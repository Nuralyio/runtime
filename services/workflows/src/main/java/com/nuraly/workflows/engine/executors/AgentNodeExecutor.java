package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * Agent Node Executor - Executes AI agent logic using a connected LLM node.
 *
 * The agent gets its LLM configuration from a connected LLM node (via 'llm' input port),
 * and optionally uses a Memory node (via 'memory' input port) for conversation history.
 * Tools can be connected via the 'tools' input port for function calling.
 *
 * Node Configuration:
 * {
 *   "agentId": "my-agent",
 *   "maxIterations": 10
 * }
 *
 * Input Ports:
 * - 'in': User prompt/message
 * - 'llm': Connected LLM node (required) - provides model, API key, etc.
 * - 'prompt': Connected Prompt node (optional) - system prompt template
 * - 'memory': Connected Memory node (optional) - provides conversation history
 * - 'tools': Connected Tool nodes (optional) - tools for function calling
 */
@ApplicationScoped
public class AgentNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(AgentNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    LlmNodeExecutor llmExecutor;

    @Inject
    ToolNodeExecutor toolExecutor;

    @Override
    public NodeType getType() {
        return NodeType.AGENT;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.infof("Executing agent node: %s", node.name);

        // Find the connected LLM node
        WorkflowNodeEntity llmNode = findConnectedNode(node, "llm");
        if (llmNode == null) {
            return NodeExecutionResult.failure("Agent requires a connected LLM node. Connect an LLM node to the 'llm' input port.");
        }

        if (llmNode.type != NodeType.LLM) {
            return NodeExecutionResult.failure("The node connected to 'llm' port must be an LLM node, got: " + llmNode.type);
        }

        // Find the connected Prompt node (optional)
        WorkflowNodeEntity promptNode = findConnectedNode(node, "prompt");

        // Find the connected Memory node (optional)
        WorkflowNodeEntity memoryNode = findConnectedNode(node, "memory");

        // Find connected Tool nodes (optional, can be multiple)
        List<WorkflowNodeEntity> toolNodes = findConnectedNodes(node, "tools");
        LOG.debugf("Found %d connected Tool nodes", toolNodes.size());

        // Get agent configuration
        JsonNode agentConfig = node.configuration != null
            ? objectMapper.readTree(node.configuration)
            : objectMapper.createObjectNode();

        // Get LLM configuration and merge with agent settings
        JsonNode llmConfig = llmNode.configuration != null
            ? objectMapper.readTree(llmNode.configuration)
            : objectMapper.createObjectNode();

        // Build merged configuration for LLM call
        ObjectNode mergedConfig = objectMapper.createObjectNode();

        // Copy LLM config (provider, apiKeyPath, model, temperature, maxTokens)
        if (llmConfig.has("provider")) mergedConfig.put("provider", llmConfig.get("provider").asText());
        if (llmConfig.has("apiKeyPath")) mergedConfig.put("apiKeyPath", llmConfig.get("apiKeyPath").asText());
        if (llmConfig.has("modelName")) mergedConfig.put("model", llmConfig.get("modelName").asText());
        if (llmConfig.has("model")) mergedConfig.put("model", llmConfig.get("model").asText());
        if (llmConfig.has("temperature")) mergedConfig.put("temperature", llmConfig.get("temperature").asDouble());
        if (llmConfig.has("maxTokens")) mergedConfig.put("maxTokens", llmConfig.get("maxTokens").asInt());

        // Get system prompt from connected Prompt node, or fallback to LLM config
        String systemPrompt = null;
        if (promptNode != null) {
            JsonNode promptConfig = promptNode.configuration != null
                ? objectMapper.readTree(promptNode.configuration)
                : objectMapper.createObjectNode();

            // Get template from Prompt node
            if (promptConfig.has("template")) {
                systemPrompt = promptConfig.get("template").asText();
            } else if (promptConfig.has("prompt")) {
                systemPrompt = promptConfig.get("prompt").asText();
            } else if (promptConfig.has("systemPrompt")) {
                systemPrompt = promptConfig.get("systemPrompt").asText();
            }
            LOG.debugf("Using system prompt from connected Prompt node: %s", promptNode.name);
        }

        // Fallback to LLM config system prompt
        if (systemPrompt == null || systemPrompt.isEmpty()) {
            if (llmConfig.has("systemPrompt")) {
                systemPrompt = llmConfig.get("systemPrompt").asText();
            }
        }

        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            mergedConfig.put("systemPrompt", systemPrompt);
        }

        // Set max iterations from agent config
        if (agentConfig.has("maxIterations")) {
            mergedConfig.put("maxToolIterations", agentConfig.get("maxIterations").asInt());
        }

        // Build tools from connected Tool nodes
        ArrayNode toolsArray = objectMapper.createArrayNode();

        // Copy tools from LLM config if present
        if (llmConfig.has("tools") && llmConfig.get("tools").isArray()) {
            for (JsonNode tool : llmConfig.get("tools")) {
                toolsArray.add(tool);
            }
        }

        // Add tools from connected Tool nodes
        for (WorkflowNodeEntity toolNode : toolNodes) {
            if (toolNode.type != NodeType.TOOL) {
                LOG.warnf("Node connected to 'tools' port is not a Tool node: %s (%s)", toolNode.name, toolNode.type);
                continue;
            }

            try {
                // Execute the Tool node to get its definition
                NodeExecutionResult toolResult = toolExecutor.execute(context, toolNode);
                if (toolResult.isSuccess() && toolResult.getOutput() != null) {
                    // The ToolNodeExecutor returns the tool definition in OpenAI format
                    toolsArray.add(toolResult.getOutput());
                    LOG.debugf("Added tool from connected node: %s", toolNode.name);
                } else {
                    LOG.warnf("Failed to get tool definition from node: %s", toolNode.name);
                }
            } catch (Exception e) {
                LOG.errorf("Error processing Tool node %s: %s", toolNode.name, e.getMessage());
            }
        }

        if (toolsArray.size() > 0) {
            mergedConfig.set("tools", toolsArray);
            LOG.debugf("Agent has %d tools available", toolsArray.size());
        }

        // TODO: If memory node is connected, load conversation history
        // and add it to the context/messages

        // Create a temporary node with merged configuration for LLM execution
        WorkflowNodeEntity tempLlmNode = new WorkflowNodeEntity();
        tempLlmNode.id = llmNode.id;
        tempLlmNode.name = node.name + " (LLM)";
        tempLlmNode.type = NodeType.LLM;
        tempLlmNode.workflow = node.workflow;
        tempLlmNode.configuration = objectMapper.writeValueAsString(mergedConfig);

        LOG.debugf("Agent using LLM config: %s", tempLlmNode.configuration);

        // Execute using the LLM executor
        NodeExecutionResult llmResult = llmExecutor.execute(context, tempLlmNode);

        if (!llmResult.isSuccess()) {
            return llmResult;
        }

        // TODO: If memory node is connected, save the interaction

        // Build agent output
        ObjectNode output = objectMapper.createObjectNode();
        if (llmResult.getOutput() != null) {
            // Copy LLM output
            llmResult.getOutput().fields().forEachRemaining(field -> {
                output.set(field.getKey(), field.getValue());
            });
        }

        // Add agent metadata
        output.put("agentId", agentConfig.has("agentId") ? agentConfig.get("agentId").asText() : "");
        output.put("llmNodeId", llmNode.id.toString());
        if (memoryNode != null) {
            output.put("memoryNodeId", memoryNode.id.toString());
        }

        return NodeExecutionResult.success(output);
    }

    /**
     * Find a node connected to a specific input port.
     */
    private WorkflowNodeEntity findConnectedNode(WorkflowNodeEntity node, String portId) {
        if (node.workflow == null || node.workflow.edges == null) {
            return null;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node's specific port
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                portId.equals(edge.targetPortId)) {
                return edge.sourceNode;
            }
        }

        return null;
    }

    /**
     * Find all nodes connected to a specific input port (for ports that accept multiple connections).
     */
    private List<WorkflowNodeEntity> findConnectedNodes(WorkflowNodeEntity node, String portId) {
        List<WorkflowNodeEntity> connectedNodes = new ArrayList<>();

        if (node.workflow == null || node.workflow.edges == null) {
            return connectedNodes;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node's specific port
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                portId.equals(edge.targetPortId) &&
                edge.sourceNode != null) {
                connectedNodes.add(edge.sourceNode);
            }
        }

        return connectedNodes;
    }
}
