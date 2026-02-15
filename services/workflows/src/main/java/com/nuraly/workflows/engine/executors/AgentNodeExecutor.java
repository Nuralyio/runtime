package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.service.WorkflowEventService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Agent Node Executor - Executes AI agent logic using connected config nodes.
 *
 * <h2>Workflow Setup</h2>
 * <pre>
 *   TELEGRAM_BOT / START / CHAT_START
 *           │
 *           ▼ (in)
 *       ┌─────────┐
 *       │  AGENT   │◄── LLM node (llm config port, required, type AGENT_LLM)
 *       │          │◄── Prompt node (prompt config port, optional)
 *       │          │◄── Memory node (memory config port, optional)
 *       │          │◄── Tool nodes (tools config port, optional, multiple)
 *       └────┬─────┘
 *            │ (out)
 *            ▼
 *   TELEGRAM_SEND / END / CHAT_OUTPUT
 * </pre>
 *
 * <h2>Port Types</h2>
 * <b>Input ports</b> (left side - data flow):
 * <ul>
 *   <li>{@code in} - User prompt/message from trigger or previous node</li>
 *   <li>{@code retriever} - RAG context (optional, from Context Builder / Vector Search)</li>
 * </ul>
 * <b>Config ports</b> (bottom - configuration nodes, not part of data flow):
 * <ul>
 *   <li>{@code llm} - Connected LLM node (required, type AGENT_LLM) - provides provider, model, API key</li>
 *   <li>{@code prompt} - Connected Prompt node (optional) - system prompt template.
 *       If no user message arrives on the 'in' port, the prompt template is used as the user message.</li>
 *   <li>{@code memory} - Connected Memory node (optional) - conversation history</li>
 *   <li>{@code tools} - Connected Tool nodes (optional, multiple) - function calling tools</li>
 * </ul>
 *
 * <h2>User Message Resolution</h2>
 * The agent extracts the user message in this order:
 * <ol>
 *   <li>Context input fields: {@code prompt}, {@code message}, {@code query}, {@code text}, {@code input}</li>
 *   <li>Output from the node connected to the 'in' port (same fields)</li>
 *   <li>Nested Telegram structure: {@code message.text}</li>
 *   <li>Query from connected retriever node</li>
 *   <li>Fallback: connected Prompt node template (used as user message when no input on 'in' port)</li>
 * </ol>
 *
 * <h2>LLM Node (AGENT_LLM)</h2>
 * The LLM config node (type {@code AGENT_LLM}) must have:
 * <ul>
 *   <li>{@code provider} - LLM provider (openai, anthropic, ollama, etc.)</li>
 *   <li>{@code apiKeyPath} - KV store path for the API key (e.g. "openai/prod")</li>
 *   <li>{@code model} - Model name (e.g. "gpt-4")</li>
 * </ul>
 * The KV store resolves the API key using the workflow's applicationId,
 * falling back to {@code _standalone} for workflows without an application.
 *
 * <h2>Node Configuration</h2>
 * <pre>
 * {
 *   "agentId": "my-agent",
 *   "maxIterations": 10
 * }
 * </pre>
 */
@ApplicationScoped
public class AgentNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(AgentNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Accepted port names for memory/context connection
    private static final List<String> MEMORY_PORTS = Arrays.asList(
        "memory", "context", "context_memory"
    );

    @Inject
    LlmNodeExecutor llmExecutor;

    @Inject
    ToolNodeExecutor toolExecutor;

    @Inject
    WorkflowEventService eventService;

    @Inject
    ContextMemoryStore contextMemoryStore;

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

        if (llmNode.type != NodeType.LLM && llmNode.type != NodeType.AGENT_LLM) {
            return NodeExecutionResult.failure("The node connected to 'llm' port must be an LLM node, got: " + llmNode.type);
        }

        // Find the connected Prompt node (optional)
        WorkflowNodeEntity promptNode = findConnectedNode(node, "prompt");

        // Find the connected Memory node (optional) - check multiple port names
        WorkflowNodeEntity memoryNode = findConnectedMemoryNode(node);

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

        // Copy LLM config (provider, apiKeyPath, apiUrlPath, model, temperature, maxTokens)
        if (llmConfig.has("provider")) mergedConfig.put("provider", llmConfig.get("provider").asText());
        if (llmConfig.has("apiKeyPath")) mergedConfig.put("apiKeyPath", llmConfig.get("apiKeyPath").asText());
        if (llmConfig.has("apiUrlPath")) mergedConfig.put("apiUrlPath", llmConfig.get("apiUrlPath").asText());
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

        // Check for RAG context from retriever port (Context Builder or Vector Search)
        String ragContext = null;
        JsonNode retrieverOutput = null;
        String retrieverQuery = null;
        WorkflowNodeEntity retrieverNode = findConnectedNode(node, "retriever");
        if (retrieverNode != null) {
            // Get the output of the retriever node from execution context
            retrieverOutput = context.getNodeOutput(retrieverNode.id);
            if (retrieverOutput != null) {
                ragContext = extractRagContext(retrieverOutput);
                LOG.debugf("Got RAG context from retriever node '%s': %d chars",
                           retrieverNode.name, ragContext != null ? ragContext.length() : 0);

                // Extract the original query from retriever output
                if (retrieverOutput.has("query")) {
                    retrieverQuery = retrieverOutput.get("query").asText();
                } else if (retrieverOutput.has("message")) {
                    retrieverQuery = retrieverOutput.get("message").asText();
                }
            }
        }

        // Fallback: check input for context (if Context Builder connected to 'in' port)
        if (ragContext == null || ragContext.isEmpty()) {
            ragContext = extractRagContext(context.getInput());
        }

        // Get user message from multiple sources (for join pattern with multiple INPUT ports)
        String userMessage = extractUserPrompt(context);

        // If not found in current input, check the "in" port source node output
        if (userMessage == null || userMessage.isEmpty()) {
            WorkflowNodeEntity inPortNode = findConnectedNode(node, "in");
            if (inPortNode != null) {
                JsonNode inPortOutput = context.getNodeOutput(inPortNode.id);
                if (inPortOutput != null) {
                    userMessage = extractUserPromptFromJson(inPortOutput);
                    if (userMessage != null && !userMessage.isEmpty()) {
                        LOG.debugf("Found user message from 'in' port source node: %s", inPortNode.name);
                    }
                }
            }
        }

        // Fallback: use query from retriever
        if ((userMessage == null || userMessage.isEmpty()) && retrieverQuery != null) {
            userMessage = retrieverQuery;
            LOG.debugf("Using query from retriever as user message: %s", userMessage);
        }

        // Fallback: use connected Prompt node template as user message
        if ((userMessage == null || userMessage.isEmpty()) && systemPrompt != null && !systemPrompt.isEmpty()) {
            userMessage = systemPrompt;
            systemPrompt = null; // Avoid duplicating as both system and user message
            LOG.debugf("Using Prompt node template as user message (no input on 'in' port)");
        }

        // Ensure the input has the query so LLM executor can find it
        if (userMessage != null && !userMessage.isEmpty()) {
            JsonNode currentInput = context.getInput();
            if (currentInput == null || currentInput.isNull() || currentInput.isEmpty()) {
                ObjectNode newInput = objectMapper.createObjectNode();
                newInput.put("query", userMessage);
                context.setInput(newInput);
            } else if (currentInput.isObject()) {
                // Always set query to ensure LLM executor finds the user message
                ((ObjectNode) currentInput).put("query", userMessage);
            }
        }

        // Inject RAG context into system prompt if available
        if (ragContext != null && !ragContext.isEmpty()) {
            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                // Append context to system prompt
                systemPrompt = systemPrompt + "\n\n## Retrieved Context\n\n" + ragContext +
                               "\n\n## Instructions\n\nUse the above context to answer the user's question. " +
                               "If the context doesn't contain relevant information, say so.";
            } else {
                // Use context as the system prompt
                systemPrompt = "You are a helpful assistant. Use the following context to answer the user's question.\n\n" +
                               "## Retrieved Context\n\n" + ragContext +
                               "\n\n## Instructions\n\nAnswer based on the above context. " +
                               "If the context doesn't contain relevant information, say so.";
            }
            LOG.debugf("Injected RAG context into system prompt (%d chars)", ragContext.length());
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
                // Emit tool processing event
                if (context.getExecution() != null) {
                    eventService.logToolCallStarted(
                        context.getExecution(),
                        node.id.toString(),
                        node.name,
                        toolNode.name,
                        toolNode.id.toString()
                    );
                }

                // Execute the Tool node to get its definition
                NodeExecutionResult toolResult = toolExecutor.execute(context, toolNode);
                boolean success = toolResult.isSuccess() && toolResult.getOutput() != null;

                // Emit tool completed event
                if (context.getExecution() != null) {
                    eventService.logToolCallCompleted(
                        context.getExecution(),
                        node.id.toString(),
                        node.name,
                        toolNode.name,
                        toolNode.id.toString(),
                        success
                    );
                }

                if (success) {
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

        // Memory handling - Agent owns the memory, loads messages, passes to LLM
        String conversationId = null;
        List<LlmMessage> conversationHistory = new ArrayList<>();

        if (memoryNode != null && memoryNode.type == NodeType.MEMORY) {
            LOG.debugf("Found connected memory node: %s", memoryNode.name);

            // Parse memory node configuration
            String cutoffMode = "message";
            int maxMessages = 50;
            int maxTokens = 4000;
            String conversationIdExpression = "${input.threadId}";

            if (memoryNode.configuration != null) {
                try {
                    JsonNode nodeConfig = objectMapper.readTree(memoryNode.configuration);
                    cutoffMode = nodeConfig.has("cutoffMode") ? nodeConfig.get("cutoffMode").asText() : "message";
                    maxMessages = nodeConfig.has("maxMessages") ? nodeConfig.get("maxMessages").asInt() : 50;
                    maxTokens = nodeConfig.has("maxTokens") ? nodeConfig.get("maxTokens").asInt() : 4000;
                    conversationIdExpression = nodeConfig.has("conversationIdExpression")
                        ? nodeConfig.get("conversationIdExpression").asText()
                        : "${input.threadId}";
                } catch (Exception e) {
                    LOG.warnf("Failed to parse memory node config: %s", e.getMessage());
                }
            }

            // Resolve conversation ID
            conversationId = context.resolveExpression(conversationIdExpression);
            if (conversationId == null || conversationId.isEmpty() || conversationId.equals(conversationIdExpression)) {
                conversationId = resolveConversationId(context);
            }

            // Load conversation history from memory store
            if (conversationId != null && !conversationId.isEmpty()) {
                if ("token".equalsIgnoreCase(cutoffMode)) {
                    conversationHistory = contextMemoryStore.getMessagesByTokens(conversationId, maxTokens);
                } else {
                    conversationHistory = contextMemoryStore.getMessagesByCount(conversationId, maxMessages);
                }
                LOG.debugf("Loaded %d messages from conversation history for: %s", conversationHistory.size(), conversationId);

                // Pass conversation history to LLM as JSON array
                if (!conversationHistory.isEmpty()) {
                    ArrayNode historyArray = objectMapper.createArrayNode();
                    for (LlmMessage msg : conversationHistory) {
                        ObjectNode msgNode = objectMapper.createObjectNode();
                        msgNode.put("role", msg.getRole().toString().toLowerCase());
                        if (msg.getContent() != null) {
                            msgNode.put("content", msg.getContent());
                        }
                        if (msg.getToolCallId() != null) {
                            msgNode.put("toolCallId", msg.getToolCallId());
                        }
                        if (msg.getName() != null) {
                            msgNode.put("name", msg.getName());
                        }
                        historyArray.add(msgNode);
                    }
                    mergedConfig.set("conversationHistory", historyArray);
                }
            }
        }

        // Create a temporary node with merged configuration for LLM execution
        WorkflowNodeEntity tempLlmNode = new WorkflowNodeEntity();
        tempLlmNode.id = llmNode.id;
        tempLlmNode.name = node.name + " (LLM)";
        tempLlmNode.type = NodeType.LLM;
        tempLlmNode.workflow = node.workflow;
        tempLlmNode.configuration = objectMapper.writeValueAsString(mergedConfig);

        LOG.debugf("Agent using LLM config: %s", tempLlmNode.configuration);

        // Get provider and model for event logging
        String provider = llmConfig.has("provider") ? llmConfig.get("provider").asText() : "unknown";
        String model = llmConfig.has("model") ? llmConfig.get("model").asText() : "unknown";

        // Emit LLM call started event for the AGENT node (not the LLM node)
        if (context.getExecution() != null) {
            eventService.logLlmCallStarted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                provider,
                model
            );
        }

        // Execute using the LLM executor
        NodeExecutionResult llmResult = llmExecutor.execute(context, tempLlmNode);

        // Emit LLM call completed event
        if (context.getExecution() != null) {
            eventService.logLlmCallCompleted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                provider,
                model,
                1  // iteration count
            );
        }

        if (!llmResult.isSuccess()) {
            return llmResult;
        }

        // Save new messages to memory (Agent handles this, not LLM)
        if (memoryNode != null && conversationId != null && !conversationId.isEmpty()) {
            // Get user prompt to save - use the userMessage we already extracted
            if (userMessage != null && !userMessage.isEmpty()) {
                contextMemoryStore.addMessage(conversationId, LlmMessage.user(userMessage));
            }

            // Get assistant response to save
            if (llmResult.getOutput() != null) {
                JsonNode outputNode = llmResult.getOutput();
                String assistantResponse = null;
                if (outputNode.has("content")) {
                    assistantResponse = outputNode.get("content").asText();
                } else if (outputNode.has("response")) {
                    assistantResponse = outputNode.get("response").asText();
                }
                if (assistantResponse != null && !assistantResponse.isEmpty()) {
                    contextMemoryStore.addMessage(conversationId, LlmMessage.assistant(assistantResponse));
                }
            }

            LOG.debugf("Saved messages to conversation: %s (total: %d)",
                    conversationId, contextMemoryStore.getMessageCount(conversationId));
        }

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

    /**
     * Find a memory node connected to this agent node.
     * Checks multiple port names: 'memory', 'context', 'context_memory'
     */
    private WorkflowNodeEntity findConnectedMemoryNode(WorkflowNodeEntity node) {
        if (node.workflow == null || node.workflow.edges == null) {
            return null;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                edge.sourceNode != null &&
                edge.sourceNode.type == NodeType.MEMORY) {

                String portId = edge.targetPortId;
                // Accept if port is in accepted list or starts with memory/context
                if (portId == null || MEMORY_PORTS.contains(portId) ||
                    portId.startsWith("memory") || portId.startsWith("context")) {
                    LOG.debugf("Found memory node connected via port: %s", portId);
                    return edge.sourceNode;
                }
            }
        }

        return null;
    }

    /**
     * Resolve conversation ID from common input fields.
     */
    private String resolveConversationId(ExecutionContext context) {
        JsonNode input = context.getInput();
        if (input == null) {
            return null;
        }

        // Try common field names
        String[] fields = {"threadId", "conversationId", "sessionId", "chatId", "thread_id", "conversation_id"};

        for (String field : fields) {
            if (input.has(field) && !input.get(field).isNull()) {
                return input.get(field).asText();
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : fields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    return body.get(field).asText();
                }
            }
        }

        // Try variables
        for (String field : fields) {
            JsonNode varValue = context.getVariable(field);
            if (varValue != null && !varValue.isNull()) {
                return varValue.asText();
            }
        }

        return null;
    }

    /**
     * Extract user prompt from context input.
     */
    private String extractUserPrompt(ExecutionContext context) {
        return extractUserPromptFromJson(context.getInput());
    }

    /**
     * Extract user prompt from a JSON node.
     */
    private String extractUserPromptFromJson(JsonNode input) {
        if (input == null) {
            return null;
        }

        // Try common field names
        String[] fields = {"prompt", "message", "query", "text", "input"};

        for (String field : fields) {
            if (input.has(field) && !input.get(field).isNull()) {
                JsonNode val = input.get(field);
                // Handle nested objects (e.g. Telegram's message.text)
                if (val.isObject() && val.has("text")) {
                    String text = val.get("text").asText();
                    if (text != null && !text.isEmpty()) return text;
                } else if (val.isTextual()) {
                    String text = val.asText();
                    if (text != null && !text.isEmpty()) return text;
                }
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : fields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    JsonNode val = body.get(field);
                    if (val.isObject() && val.has("text")) {
                        String text = val.get("text").asText();
                        if (text != null && !text.isEmpty()) return text;
                    } else if (val.isTextual()) {
                        String text = val.asText();
                        if (text != null && !text.isEmpty()) return text;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Extract RAG context from input (from Context Builder node).
     * Looks for 'context' field which contains formatted retrieved documents.
     */
    private String extractRagContext(JsonNode input) {
        if (input == null) {
            return null;
        }

        // Primary: 'context' field from Context Builder
        if (input.has("context") && input.get("context").isTextual()) {
            String context = input.get("context").asText();
            if (!context.isEmpty()) {
                return context;
            }
        }

        // Alternative: Build context from 'results' array (direct from Vector Search)
        if (input.has("results") && input.get("results").isArray()) {
            JsonNode results = input.get("results");
            if (!results.isEmpty()) {
                StringBuilder contextBuilder = new StringBuilder();
                for (int i = 0; i < results.size(); i++) {
                    JsonNode result = results.get(i);
                    if (result.has("content")) {
                        if (i > 0) {
                            contextBuilder.append("\n\n---\n\n");
                        }
                        contextBuilder.append("[").append(i + 1).append("] ");
                        contextBuilder.append(result.get("content").asText());
                        if (result.has("sourceId")) {
                            contextBuilder.append("\n(Source: ").append(result.get("sourceId").asText()).append(")");
                        }
                    }
                }
                String context = contextBuilder.toString();
                if (!context.isEmpty()) {
                    return context;
                }
            }
        }

        return null;
    }
}
