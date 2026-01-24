package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.NodeExecutorFactory;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.llm.LlmProvider;
import com.nuraly.workflows.llm.LlmProviderFactory;
import com.nuraly.workflows.llm.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.jboss.logging.Logger;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;

import java.util.*;

/**
 * LLM Node Executor - Executes LLM calls with tool/function calling support.
 *
 * Tool calling works by:
 * 1. Building tool definitions from connected workflow nodes (nodes connected via "tool_*" ports)
 * 2. Calling the LLM with the prompt and available tools
 * 3. If the LLM requests tool calls, executing the corresponding workflow nodes
 * 4. Returning tool results to the LLM and continuing until the LLM provides a final response
 *
 * Node Configuration:
 * {
 *   "provider": "openai" | "anthropic" | "gemini" | "ollama",
 *   "model": "gpt-4o",
 *   "apiKeyPath": "openai/my-key", // KV store path for API key (optional for Ollama)
 *   "apiUrlPath": "ollama/server-url", // KV store path for API URL (optional, for Ollama)
 *   "systemPrompt": "You are a helpful assistant...",
 *   "temperature": 0.7,
 *   "maxTokens": 4096,
 *   "maxToolIterations": 10,
 *   "tools": [
 *     {
 *       "name": "get_weather",
 *       "description": "Get weather for a location",
 *       "parameters": { "type": "object", "properties": { "location": { "type": "string" } } },
 *       "portId": "tool_weather" // Maps to edge sourcePortId
 *     }
 *   ]
 * }
 */
@ApplicationScoped
public class LlmNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(LlmNodeExecutor.class);
    private static final int DEFAULT_MAX_TOOL_ITERATIONS = 10;

    @Inject
    LlmProviderFactory providerFactory;

    @Inject
    NodeExecutorFactory nodeExecutorFactory;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.LLM;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("LLM node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get provider
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        LlmProvider provider = providerFactory.getProvider(providerName);
        if (provider == null) {
            return NodeExecutionResult.failure("Unknown LLM provider: " + providerName);
        }

        // Get API key from KV store (optional for Ollama)
        String apiKeyPath = config.has("apiKeyPath") ? config.get("apiKeyPath").asText() : null;
        String apiKey = null;

        boolean isOllama = "ollama".equalsIgnoreCase(providerName);

        if (apiKeyPath != null && !apiKeyPath.isEmpty()) {
            apiKey = fetchFromKvStore(apiKeyPath, context);
            if (apiKey == null || apiKey.isEmpty()) {
                if (!isOllama) {
                    // API key is required for non-Ollama providers
                    LOG.errorf("LLM node error: Failed to retrieve API key from KV store: %s", apiKeyPath);
                    return NodeExecutionResult.failure("Failed to retrieve API key from KV store: " + apiKeyPath);
                }
                LOG.debugf("No API key found for Ollama provider (this is typically fine)");
            }
        } else if (!isOllama) {
            // API key path is required for non-Ollama providers
            LOG.error("LLM node error: API key path is required");
            return NodeExecutionResult.failure("API key path is required");
        }

        // Get API URL from KV store (optional, primarily for Ollama)
        String apiUrlPath = config.has("apiUrlPath") ? config.get("apiUrlPath").asText() : null;
        String baseUrl = null;
        if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
            baseUrl = fetchFromKvStore(apiUrlPath, context);
            if (baseUrl != null) {
                LOG.debugf("Using custom API URL from KV store: %s", baseUrl);
            }
        }

        // Build tool definitions from config and connected nodes
        List<ToolDefinition> tools = buildToolDefinitions(config, node);
        Map<String, ToolContext> toolContextMap = buildToolContextMap(tools, node);

        // Get model and other settings
        String model = config.has("model") ? config.get("model").asText() : provider.getDefaultModel();
        String systemPrompt = config.has("systemPrompt") ?
                context.resolveExpression(config.get("systemPrompt").asText()) : null;
        Double temperature = config.has("temperature") ? config.get("temperature").asDouble() : null;
        Integer maxTokens = config.has("maxTokens") ? config.get("maxTokens").asInt() : null;
        int maxIterations = config.has("maxToolIterations") ?
                config.get("maxToolIterations").asInt() : DEFAULT_MAX_TOOL_ITERATIONS;

        // Build initial messages
        List<LlmMessage> messages = new ArrayList<>();

        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            messages.add(LlmMessage.system(systemPrompt));
        }

        // Get user prompt from input
        String userPrompt = extractUserPrompt(context, config);
        if (userPrompt == null || userPrompt.isEmpty()) {
            return NodeExecutionResult.failure("User prompt is required (from input.prompt or input.message)");
        }
        messages.add(LlmMessage.user(userPrompt));

        // Tool execution loop
        int iterations = 0;
        LlmResponse lastResponse = null;

        while (iterations < maxIterations) {
            iterations++;

            // Build request
            LlmRequest request = LlmRequest.builder()
                    .model(model)
                    .messages(messages)
                    .tools(tools.isEmpty() ? null : tools)
                    .temperature(temperature)
                    .maxTokens(maxTokens)
                    .baseUrl(baseUrl)
                    .build();

            // Call LLM
            LOG.debugf("Calling LLM provider: %s, model: %s", providerName, model);
            LlmResponse response = provider.chat(request, apiKey);

            if (!response.isSuccess()) {
                LOG.errorf("LLM API error (provider=%s, model=%s): %s", providerName, model, response.getError());
                return NodeExecutionResult.failure("LLM error: " + response.getError(), true);
            }

            lastResponse = response;

            // If no tool calls, we're done
            if (!response.hasToolCalls()) {
                break;
            }

            // Add assistant message with tool calls to history
            messages.add(LlmMessage.assistantWithTools(response.getToolCalls()));

            // Execute each tool call
            for (ToolCall toolCall : response.getToolCalls()) {
                String toolResult = executeToolCall(toolCall, toolContextMap, context);

                // Add tool result to messages
                messages.add(LlmMessage.toolResult(
                        toolCall.getId(),
                        toolCall.getName(),
                        toolResult
                ));
            }
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();

        if (lastResponse != null) {
            if (lastResponse.getContent() != null) {
                output.put("content", lastResponse.getContent());
                output.put("response", lastResponse.getContent());
            }

            output.put("model", lastResponse.getModel() != null ? lastResponse.getModel() : model);
            output.put("finishReason", lastResponse.getFinishReason().toString());
            output.put("iterations", iterations);

            if (lastResponse.getUsage() != null) {
                ObjectNode usage = objectMapper.createObjectNode();
                usage.put("promptTokens", lastResponse.getUsage().getPromptTokens());
                usage.put("completionTokens", lastResponse.getUsage().getCompletionTokens());
                usage.put("totalTokens", lastResponse.getUsage().getTotalTokens());
                output.set("usage", usage);
            }
        }

        // Store response in variables if configured
        if (config.has("outputVariable")) {
            String varName = config.get("outputVariable").asText();
            context.setVariable(varName, output);
        }

        return NodeExecutionResult.success(output);
    }

    private String extractUserPrompt(ExecutionContext context, JsonNode config) {
        JsonNode input = context.getInput();

        // Check config for prompt field name
        String promptField = config.has("promptField") ? config.get("promptField").asText() : null;
        if (promptField != null && input.has(promptField)) {
            return input.get(promptField).asText();
        }

        // Try common field names
        if (input.has("prompt")) {
            return input.get("prompt").asText();
        }
        if (input.has("message")) {
            return input.get("message").asText();
        }
        if (input.has("query")) {
            return input.get("query").asText();
        }
        if (input.has("text")) {
            return input.get("text").asText();
        }
        if (input.has("input")) {
            return input.get("input").asText();
        }

        // Check for body.prompt (from HTTP requests)
        if (input.has("body")) {
            JsonNode body = input.get("body");
            if (body.has("prompt")) {
                return body.get("prompt").asText();
            }
            if (body.has("message")) {
                return body.get("message").asText();
            }
        }

        return null;
    }

    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            // Try to get app ID from context
            JsonNode input = context.getInput();
            if (input.has("applicationId")) {
                appId = input.get("applicationId").asText();
            } else if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId != null ?
                        context.getExecution().workflow.applicationId.toString() : null;
            }

            if (appId == null) {
                return null;
            }

            // Call KV service to get the value
            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    java.net.URLEncoder.encode(keyPath, "UTF-8") +
                    "?applicationId=" + appId;

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(kvServiceUrl);
                request.addHeader("Content-Type", "application/json");

                var response = httpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode >= 200 && statusCode < 300) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    JsonNode kvEntry = objectMapper.readTree(responseBody);
                    if (kvEntry.has("value")) {
                        return kvEntry.get("value").asText();
                    }
                }
            }

            return null;
        } catch (Exception e) {
            LOG.warnf("Failed to fetch value from KV store (%s): %s", keyPath, e.getMessage());
            return null;
        }
    }

    private List<ToolDefinition> buildToolDefinitions(JsonNode config, WorkflowNodeEntity node) {
        List<ToolDefinition> tools = new ArrayList<>();

        // Tools defined in config (may come from Tool nodes via Agent or direct config)
        if (config.has("tools") && config.get("tools").isArray()) {
            for (JsonNode toolConfig : config.get("tools")) {
                // Check if this is OpenAI format (from Tool nodes) or simple format
                if (toolConfig.has("type") && "function".equals(toolConfig.get("type").asText())) {
                    // OpenAI format from Tool node: { type: "function", function: {...}, nodeId: "..." }
                    JsonNode funcDef = toolConfig.get("function");
                    if (funcDef != null) {
                        ToolDefinition.ToolDefinitionBuilder builder = ToolDefinition.builder()
                                .name(funcDef.has("name") ? funcDef.get("name").asText() : "unknown")
                                .description(funcDef.has("description") ? funcDef.get("description").asText() : "")
                                .parameters(funcDef.has("parameters") ? funcDef.get("parameters") : null);

                        // Store Tool node ID so we can find the connected Function node
                        if (toolConfig.has("nodeId")) {
                            try {
                                builder.nodeId(UUID.fromString(toolConfig.get("nodeId").asText()));
                            } catch (Exception ignored) {}
                        }
                        tools.add(builder.build());
                    }
                } else {
                    // Simple format: { name, description, parameters, portId }
                    ToolDefinition tool = ToolDefinition.builder()
                            .name(toolConfig.get("name").asText())
                            .description(toolConfig.has("description") ? toolConfig.get("description").asText() : "")
                            .parameters(toolConfig.has("parameters") ? toolConfig.get("parameters") : null)
                            .sourcePortId(toolConfig.has("portId") ? toolConfig.get("portId").asText() : null)
                            .build();
                    tools.add(tool);
                }
            }
        }

        // Auto-discover tools from connected nodes
        // Tools are connected via edges with sourcePortId starting with "tool_"
        if (node.workflow != null && node.workflow.edges != null) {
            for (WorkflowEdgeEntity edge : node.workflow.edges) {
                if (edge.sourceNode != null && edge.sourceNode.id.equals(node.id)) {
                    String portId = edge.sourcePortId;
                    if (portId != null && portId.startsWith("tool_")) {
                        WorkflowNodeEntity targetNode = edge.targetNode;
                        if (targetNode != null) {
                            // Check if we already have this tool defined
                            String toolName = portId.substring(5); // Remove "tool_" prefix
                            boolean exists = tools.stream().anyMatch(t -> t.getName().equals(toolName));

                            if (!exists) {
                                // Auto-create tool definition from connected node
                                ToolDefinition tool = ToolDefinition.builder()
                                        .name(toolName)
                                        .description(getNodeDescription(targetNode))
                                        .parameters(getNodeInputSchema(targetNode))
                                        .nodeId(targetNode.id)
                                        .sourcePortId(portId)
                                        .build();
                                tools.add(tool);
                            } else {
                                // Update existing tool with node ID
                                tools.stream()
                                        .filter(t -> t.getName().equals(toolName))
                                        .findFirst()
                                        .ifPresent(t -> t.setNodeId(targetNode.id));
                            }
                        }
                    }
                }
            }
        }

        return tools;
    }

    private String getNodeDescription(WorkflowNodeEntity node) {
        if (node.configuration != null) {
            try {
                JsonNode config = objectMapper.readTree(node.configuration);
                if (config.has("description")) {
                    return config.get("description").asText();
                }
            } catch (Exception ignored) {}
        }
        return "Execute " + node.name + " (" + node.type + " node)";
    }

    private JsonNode getNodeInputSchema(WorkflowNodeEntity node) {
        if (node.configuration != null) {
            try {
                JsonNode config = objectMapper.readTree(node.configuration);
                if (config.has("inputSchema")) {
                    return config.get("inputSchema");
                }
            } catch (Exception ignored) {}
        }

        // Default schema
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");
        schema.set("properties", objectMapper.createObjectNode());
        return schema;
    }

    private Map<String, ToolContext> buildToolContextMap(List<ToolDefinition> tools, WorkflowNodeEntity node) {
        Map<String, ToolContext> map = new HashMap<>();

        for (ToolDefinition tool : tools) {
            ToolContext ctx = new ToolContext();
            ctx.definition = tool;

            // Find the connected node for this tool
            if (tool.getNodeId() != null) {
                WorkflowNodeEntity toolNode = findNodeById(node.workflow.nodes, tool.getNodeId());

                // If the node is a TOOL node, find the connected Function node
                if (toolNode != null && toolNode.type == NodeType.TOOL) {
                    ctx.targetNode = findConnectedFunctionNode(toolNode, node.workflow);
                    if (ctx.targetNode == null) {
                        LOG.warnf("Tool node '%s' has no connected Function node", toolNode.name);
                        // Still store the tool node - executeToolCall will handle the error
                        ctx.targetNode = toolNode;
                    }
                } else {
                    ctx.targetNode = toolNode;
                }
            } else if (tool.getSourcePortId() != null && node.workflow != null) {
                // Find node connected via this port
                for (WorkflowEdgeEntity edge : node.workflow.edges) {
                    if (edge.sourceNode.id.equals(node.id) &&
                            tool.getSourcePortId().equals(edge.sourcePortId)) {
                        ctx.targetNode = edge.targetNode;
                        tool.setNodeId(edge.targetNode.id);
                        break;
                    }
                }
            }

            map.put(tool.getName(), ctx);
            LOG.debugf("Registered tool in context map: %s -> targetNode: %s (type: %s)",
                tool.getName(),
                ctx.targetNode != null ? ctx.targetNode.name : "null",
                ctx.targetNode != null ? ctx.targetNode.type : "null");
        }

        LOG.debugf("Tool context map built with %d tools: %s", map.size(), map.keySet());
        return map;
    }

    /**
     * Find the Function node connected to a Tool node's 'function' input port.
     */
    private WorkflowNodeEntity findConnectedFunctionNode(WorkflowNodeEntity toolNode,
                                                          com.nuraly.workflows.entity.WorkflowEntity workflow) {
        if (workflow == null || workflow.edges == null) {
            return null;
        }

        for (WorkflowEdgeEntity edge : workflow.edges) {
            // Check if this edge connects TO the Tool node's 'function' port
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(toolNode.id) &&
                "function".equals(edge.targetPortId) &&
                edge.sourceNode != null) {
                return edge.sourceNode;
            }
        }

        return null;
    }

    private WorkflowNodeEntity findNodeById(List<WorkflowNodeEntity> nodes, UUID nodeId) {
        for (WorkflowNodeEntity n : nodes) {
            if (n.id.equals(nodeId)) {
                return n;
            }
        }
        return null;
    }

    private String executeToolCall(ToolCall toolCall, Map<String, ToolContext> toolContextMap,
                                   ExecutionContext context) {
        LOG.debugf("Executing tool call: %s with arguments: %s", toolCall.getName(), toolCall.getArguments());

        try {
            ToolContext toolCtx = toolContextMap.get(toolCall.getName());
            if (toolCtx == null || toolCtx.targetNode == null) {
                LOG.warnf("Tool not found in context map: %s. Available tools: %s",
                    toolCall.getName(), toolContextMap.keySet());
                return objectMapper.writeValueAsString(
                        Map.of("error", "Tool not found: " + toolCall.getName())
                );
            }

            WorkflowNodeEntity targetNode = toolCtx.targetNode;
            LOG.debugf("Found target node for tool: %s (type: %s, id: %s)",
                targetNode.name, targetNode.type, targetNode.id);

            // Get executor for the target node type
            if (!nodeExecutorFactory.hasExecutor(targetNode.type)) {
                LOG.errorf("No executor for node type: %s", targetNode.type);
                return objectMapper.writeValueAsString(
                        Map.of("error", "No executor for node type: " + targetNode.type)
                );
            }

            NodeExecutor executor = nodeExecutorFactory.getExecutor(targetNode.type);

            // Create a sub-context with tool arguments as input
            ExecutionContext subContext = createSubContext(context, toolCall.getArguments());

            // Execute the tool node
            NodeExecutionResult result = executor.execute(subContext, targetNode);

            if (result.isSuccess()) {
                String toolResult;
                if (result.getOutput() != null) {
                    toolResult = objectMapper.writeValueAsString(result.getOutput());
                } else {
                    toolResult = "{\"success\": true}";
                }
                LOG.infof("Tool %s executed successfully, result: %s", toolCall.getName(), toolResult);
                return toolResult;
            } else {
                LOG.errorf("Tool %s execution failed: %s", toolCall.getName(), result.getErrorMessage());
                return objectMapper.writeValueAsString(
                        Map.of("error", result.getErrorMessage())
                );
            }
        } catch (Exception e) {
            LOG.errorf("Tool %s execution threw exception: %s", toolCall.getName(), e.getMessage());
            try {
                return objectMapper.writeValueAsString(
                        Map.of("error", "Tool execution failed: " + e.getMessage())
                );
            } catch (Exception ex) {
                return "{\"error\": \"Tool execution failed\"}";
            }
        }
    }

    private ExecutionContext createSubContext(ExecutionContext parentContext, JsonNode toolArguments) {
        // Create a new context with tool arguments merged into input
        ExecutionContext subContext = new ExecutionContext(parentContext.getExecution());

        // Copy variables
        subContext.setVariables(parentContext.getVariables().deepCopy());

        // Set tool arguments as input
        ObjectNode input = objectMapper.createObjectNode();
        if (toolArguments != null && toolArguments.isObject()) {
            toolArguments.fields().forEachRemaining(entry -> {
                input.set(entry.getKey(), entry.getValue());
            });
        }
        subContext.setInput(input);

        return subContext;
    }

    /**
     * Helper class to track tool context
     */
    private static class ToolContext {
        ToolDefinition definition;
        WorkflowNodeEntity targetNode;
    }
}
