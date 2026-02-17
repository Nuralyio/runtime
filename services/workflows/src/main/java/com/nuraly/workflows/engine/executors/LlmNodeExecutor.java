package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.nuraly.workflows.llm.LlmResilienceService;
import com.nuraly.workflows.llm.LlmResilienceService.ResilienceConfig;
import com.nuraly.workflows.llm.StreamingLlmProvider;
import com.nuraly.workflows.llm.StructuredOutputFallback;
import com.nuraly.workflows.llm.StreamingLlmProvider.StreamToken;
import com.nuraly.workflows.llm.dto.*;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.service.WorkflowEventService;
import com.nuraly.workflows.triggers.connectors.McpConnection;
import com.nuraly.workflows.triggers.connectors.McpConnector;
import io.modelcontextprotocol.spec.McpSchema;
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
 * STREAMING MODE:
 * When "streaming": true is configured, tokens are streamed directly to the chat frontend
 * via CHAT_STREAM_TOKEN events. This provides real-time token-by-token output.
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
 *   "streaming": true,              // Enable token-by-token streaming to chat
 *   "streamToChat": true,           // Stream output directly to chat (default: true when streaming)
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
    private static final String MODEL = "model";
    private static final String MAX_TOKENS = "maxTokens";
    private static final String MEMORY_CONFIG = "memoryConfig";
    private static final String ENABLED = "enabled";

    @Inject
    LlmProviderFactory providerFactory;

    @Inject
    LlmResilienceService resilienceService;

    @Inject
    NodeExecutorFactory nodeExecutorFactory;

    @Inject
    Configuration configuration;

    @Inject
    WorkflowEventService eventService;

    @Inject
    ContextMemoryStore contextMemoryStore;

    @Inject
    ContextMemoryNodeExecutor contextMemoryNodeExecutor;

    @Inject
    McpConnector mcpConnector;

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

        // Step 1: Resolve provider and credentials
        ProviderConfig providerConfig = resolveProviderAndCredentials(config, context);
        if (providerConfig.error != null) {
            return NodeExecutionResult.failure(providerConfig.error);
        }

        // Step 2: Build tool definitions
        List<ToolDefinition> tools = buildToolDefinitions(config, node);
        LOG.infof("LLM '%s': built %d tool definitions from config", node.name, tools.size());
        Map<String, ToolContext> toolContextMap = buildToolContextMap(tools, node);

        // Step 3: Extract model parameters
        LlmParameters params = extractLlmParameters(config, context, providerConfig);

        // Step 4: Build initial messages (system prompt, history, user prompt)
        InitialMessagesResult messagesResult = buildInitialMessages(config, context, node, params.systemPrompt);
        if (messagesResult.error != null) {
            return NodeExecutionResult.failure(messagesResult.error);
        }

        // Step 5: Execute the LLM loop (call LLM, handle tool calls)
        LlmLoopResult loopResult = executeLlmLoop(
                messagesResult.messages, tools, toolContextMap, providerConfig, params, context, node);
        if (loopResult.error != null) {
            return NodeExecutionResult.failure(loopResult.error, true);
        }

        // Step 6: Save conversation history (only for direct LLM usage, not when Agent handles memory)
        saveConversationHistory(messagesResult, loopResult.lastResponse);

        // Step 7: Build and return output
        ObjectNode output = buildExecutionOutput(
                loopResult, params.model, messagesResult, config, context);

        return NodeExecutionResult.success(output);
    }

    /**
     * Resolves LLM provider, API key, and base URL from config and KV store.
     */
    private ProviderConfig resolveProviderAndCredentials(JsonNode config, ExecutionContext context) {
        ProviderConfig result = new ProviderConfig();

        result.providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        result.provider = providerFactory.getProvider(result.providerName);
        if (result.provider == null) {
            result.error = "Unknown LLM provider: " + result.providerName;
            return result;
        }

        result.isOllama = "ollama".equalsIgnoreCase(result.providerName);

        resolveApiKey(config, context, result);
        resolveBaseUrl(config, context, result);

        return result;
    }

    private void resolveApiKey(JsonNode config, ExecutionContext context, ProviderConfig result) {
        String apiKeyPath = config.has("apiKeyPath") ? config.get("apiKeyPath").asText() : null;
        if (apiKeyPath != null && !apiKeyPath.isEmpty()) {
            result.apiKey = fetchFromKvStore(apiKeyPath, context);
            if (result.apiKey == null || result.apiKey.isEmpty()) {
                LOG.warnf("Could not retrieve API key from KV store: %s (will try without it)", apiKeyPath);
            }
        } else if (!result.isOllama) {
            LOG.warnf("No API key path configured for %s provider (will try without it)", result.providerName);
        }
    }

    private void resolveBaseUrl(JsonNode config, ExecutionContext context, ProviderConfig result) {
        String apiUrlPath = config.has("apiUrlPath") ? config.get("apiUrlPath").asText() : null;
        if (apiUrlPath != null && !apiUrlPath.isEmpty()) {
            result.baseUrl = fetchFromKvStore(apiUrlPath, context);
            if (result.baseUrl != null) {
                LOG.debugf("Using API URL from KV store: %s", result.baseUrl);
            }
        }

        boolean requiresUrl = result.isOllama || "local".equalsIgnoreCase(result.providerName);
        if (requiresUrl && (result.baseUrl == null || result.baseUrl.isEmpty())) {
            LOG.errorf("LLM node error: API URL is required for %s provider. Configure apiUrlPath in KV store.", result.providerName);
            result.error = "API URL is required for " + result.providerName + " provider. Please configure a server URL in the node settings.";
        }
    }

    /**
     * Extracts model, temperature, maxTokens, and other LLM parameters from config.
     */
    private LlmParameters extractLlmParameters(JsonNode config, ExecutionContext context, ProviderConfig providerConfig) {
        LlmParameters params = new LlmParameters();

        params.model = config.has(MODEL) && !config.get(MODEL).asText().isEmpty()
                ? config.get(MODEL).asText()
                : providerConfig.provider.getDefaultModel();
        params.systemPrompt = config.has("systemPrompt") ?
                context.resolveExpression(config.get("systemPrompt").asText()) : null;
        params.temperature = config.has("temperature") ? config.get("temperature").asDouble() : null;
        params.maxTokens = config.has(MAX_TOKENS) ? config.get(MAX_TOKENS).asInt() : null;
        params.maxIterations = config.has("maxToolIterations") ?
                config.get("maxToolIterations").asInt() : DEFAULT_MAX_TOOL_ITERATIONS;
        params.responseFormat = config.has("responseFormat") ? config.get("responseFormat") : null;
        params.useStructuredOutputFallback = params.responseFormat != null
                && !providerConfig.provider.supportsStructuredOutput(params.model);
        params.resilienceConfig = buildResilienceConfig(config);
        params.streamingEnabled = config.has("streaming") && config.get("streaming").asBoolean();
        params.streamToChat = !config.has("streamToChat") || config.get("streamToChat").asBoolean();

        return params;
    }

    /**
     * Builds the initial list of messages: system prompt, conversation history, and user prompt.
     */
    private InitialMessagesResult buildInitialMessages(JsonNode config, ExecutionContext context,
                                                        WorkflowNodeEntity node, String systemPrompt) {
        InitialMessagesResult result = new InitialMessagesResult();
        result.messages = new ArrayList<>();

        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            result.messages.add(LlmMessage.system(systemPrompt));
        }

        // Check for conversation history passed by Agent (Option A: Agent handles memory)
        if (config.has("conversationHistory") && config.get("conversationHistory").isArray()) {
            result.historyFromAgent = true;
            LOG.debugf("Found conversation history from Agent (%d messages)",
                    config.get("conversationHistory").size());
            for (JsonNode msgNode : config.get("conversationHistory")) {
                LlmMessage msg = parseMessageFromJson(msgNode);
                if (msg != null) {
                    result.messages.add(msg);
                }
            }
        } else {
            // Fallback: Load from memory store for direct LLM usage (without Agent)
            resolveMemoryAndLoadHistory(config, context, node, result);
        }

        // Get user prompt from input
        result.userPrompt = extractUserPrompt(context, config);
        if (result.userPrompt == null || result.userPrompt.isEmpty()) {
            result.error = "User prompt is required (from input.prompt or input.message)";
            return result;
        }
        result.messages.add(LlmMessage.user(result.userPrompt));

        return result;
    }

    /**
     * Resolves memory configuration and loads conversation history from the memory store.
     */
    private void resolveMemoryAndLoadHistory(JsonNode config, ExecutionContext context,
                                              WorkflowNodeEntity node, InitialMessagesResult result) {
        // Check for memory config in node configuration
        if (config.has(MEMORY_CONFIG) && config.get(MEMORY_CONFIG).has(ENABLED) &&
            config.get(MEMORY_CONFIG).get(ENABLED).asBoolean()) {
            LOG.debugf("Found memory config in node configuration");
            result.memoryConfig = parseMemoryConfigFromJson(config.get(MEMORY_CONFIG), context);
            result.conversationId = result.memoryConfig.conversationId;
        } else {
            // Find connected memory node
            WorkflowNodeEntity memoryNode = findConnectedMemoryNode(node);
            if (memoryNode != null) {
                LOG.debugf("Found connected memory node: %s", memoryNode.name);
                result.memoryConfig = parseMemoryConfig(memoryNode, context);
                result.conversationId = result.memoryConfig.conversationId;
            }
        }

        // Load conversation history from memory store
        if (result.memoryConfig != null && result.conversationId != null && !result.conversationId.isEmpty()) {
            List<LlmMessage> history = loadConversationHistory(result.conversationId, result.memoryConfig);
            if (!history.isEmpty()) {
                LOG.debugf("Loaded %d messages from memory store for: %s", history.size(), result.conversationId);
                result.messages.addAll(history);
            }
        }
    }

    /**
     * Executes the LLM call loop, handling tool calls across multiple iterations.
     */
    private LlmLoopResult executeLlmLoop(List<LlmMessage> messages, List<ToolDefinition> tools,
                                           Map<String, ToolContext> toolContextMap,
                                           ProviderConfig providerConfig, LlmParameters params,
                                           ExecutionContext context, WorkflowNodeEntity node) {
        LlmLoopResult result = new LlmLoopResult();
        result.iterations = 0;

        while (result.iterations < params.maxIterations) {
            result.iterations++;

            LlmRequest request = buildLlmRequest(messages, tools, params, providerConfig);

            emitLlmCallStartedEvent(context, node, providerConfig.providerName, params.model);

            LlmResponse response = callLlmProvider(
                    providerConfig, params, tools, request, context, node);

            emitLlmCallCompletedEvent(context, node, providerConfig.providerName, params.model, result.iterations);

            if (response == null || !response.isSuccess()) {
                String errorMsg = response != null ? response.getError() : "null response from provider";
                LOG.errorf("LLM API error (provider=%s, model=%s): %s",
                        providerConfig.providerName, params.model, errorMsg);
                result.error = "LLM error: " + errorMsg;
                return result;
            }

            result.lastResponse = response;

            if (params.useStructuredOutputFallback) {
                result.lastResponse = StructuredOutputFallback.extractJson(result.lastResponse);
            }

            // If no tool calls, we're done
            if (!response.hasToolCalls()) {
                break;
            }

            // Add assistant message with tool calls to history
            messages.add(LlmMessage.assistantWithTools(response.getToolCalls()));

            // Execute each tool call
            for (ToolCall toolCall : response.getToolCalls()) {
                String toolResult = executeToolCall(toolCall, toolContextMap, context, node);
                messages.add(LlmMessage.toolResult(toolCall.getId(), toolCall.getName(), toolResult));
            }
        }

        return result;
    }

    /**
     * Builds an LlmRequest from current messages, tools, and parameters.
     */
    private LlmRequest buildLlmRequest(List<LlmMessage> messages, List<ToolDefinition> tools,
                                         LlmParameters params, ProviderConfig providerConfig) {
        LlmRequest request = LlmRequest.builder()
                .model(params.model)
                .messages(messages)
                .tools(tools.isEmpty() ? null : tools)
                .temperature(params.temperature)
                .maxTokens(params.maxTokens)
                .baseUrl(providerConfig.baseUrl)
                .responseFormat(params.responseFormat)
                .build();

        if (params.useStructuredOutputFallback) {
            request = StructuredOutputFallback.applyPromptFallback(request);
        }

        return request;
    }

    /**
     * Calls the LLM provider, choosing between streaming and non-streaming modes.
     */
    private LlmResponse callLlmProvider(ProviderConfig providerConfig, LlmParameters params,
                                          List<ToolDefinition> tools, LlmRequest request,
                                          ExecutionContext context, WorkflowNodeEntity node) {
        boolean useStreaming = params.streamingEnabled
                && tools.isEmpty()
                && providerConfig.provider instanceof StreamingLlmProvider;

        if (useStreaming) {
            LOG.debugf("Calling LLM provider: %s, model: %s (STREAMING)", providerConfig.providerName, params.model);
            return executeStreamingLlmCall(
                    (StreamingLlmProvider) providerConfig.provider,
                    request,
                    providerConfig.apiKey,
                    context,
                    node,
                    params.streamToChat
            );
        } else {
            LOG.debugf("Calling LLM provider: %s, model: %s (with resilience)", providerConfig.providerName, params.model);
            return resilienceService.executeWithResilience(
                    request, providerConfig.providerName, providerConfig.apiKey, params.resilienceConfig);
        }
    }

    /**
     * Emits an LLM call started event if an execution context is available.
     */
    private void emitLlmCallStartedEvent(ExecutionContext context, WorkflowNodeEntity node,
                                           String providerName, String model) {
        if (context.getExecution() != null) {
            eventService.logLlmCallStarted(
                    context.getExecution(), node.id.toString(), node.name, providerName, model);
        }
    }

    /**
     * Emits an LLM call completed event if an execution context is available.
     */
    private void emitLlmCallCompletedEvent(ExecutionContext context, WorkflowNodeEntity node,
                                             String providerName, String model, int iterations) {
        if (context.getExecution() != null) {
            eventService.logLlmCallCompleted(
                    context.getExecution(), node.id.toString(), node.name, providerName, model, iterations);
        }
    }

    /**
     * Saves conversation history to the memory store (only for direct LLM usage, not when Agent handles memory).
     */
    private void saveConversationHistory(InitialMessagesResult messagesResult, LlmResponse lastResponse) {
        if (messagesResult.historyFromAgent) {
            return;
        }
        if (messagesResult.memoryConfig == null || messagesResult.conversationId == null
                || messagesResult.conversationId.isEmpty()) {
            return;
        }

        contextMemoryStore.addMessage(messagesResult.conversationId, LlmMessage.user(messagesResult.userPrompt));

        if (lastResponse != null && lastResponse.getContent() != null) {
            contextMemoryStore.addMessage(messagesResult.conversationId, LlmMessage.assistant(lastResponse.getContent()));
        }
        LOG.debugf("Saved messages to conversation history: %s (total: %d messages)",
                messagesResult.conversationId, contextMemoryStore.getMessageCount(messagesResult.conversationId));
    }

    /**
     * Builds the final execution output ObjectNode from the LLM response and metadata.
     */
    private ObjectNode buildExecutionOutput(LlmLoopResult loopResult, String model,
                                             InitialMessagesResult messagesResult,
                                             JsonNode config, ExecutionContext context) {
        ObjectNode output = objectMapper.createObjectNode();

        if (loopResult.lastResponse != null) {
            appendResponseToOutput(output, loopResult.lastResponse, model, loopResult.iterations);
        }

        // Add memory info to output (only for direct LLM usage, not when Agent handles memory)
        if (!messagesResult.historyFromAgent && messagesResult.conversationId != null
                && !messagesResult.conversationId.isEmpty()) {
            output.put("conversationId", messagesResult.conversationId);
            output.put("memoryEnabled", true);
            output.put("totalMessages", contextMemoryStore.getMessageCount(messagesResult.conversationId));
        }

        // Store response in variables if configured
        if (config.has("outputVariable")) {
            String varName = config.get("outputVariable").asText();
            context.setVariable(varName, output);
        }

        return output;
    }

    /**
     * Appends LLM response content, model info, finish reason, iterations, and usage to the output node.
     */
    private void appendResponseToOutput(ObjectNode output, LlmResponse lastResponse, String model, int iterations) {
        if (lastResponse.getContent() != null) {
            output.put("content", lastResponse.getContent());
            output.put("response", lastResponse.getContent());
        }

        output.put(MODEL, lastResponse.getModel() != null ? lastResponse.getModel() : model);
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

    private String extractUserPrompt(ExecutionContext context, JsonNode config) {
        JsonNode input = context.getInput();

        // Check config for prompt field name
        String promptField = config.has("promptField") ? config.get("promptField").asText() : null;
        if (promptField != null && input.has(promptField)) {
            String val = input.get(promptField).asText();
            if (val != null && !val.isEmpty()) return val;
        }

        // Try common field names (skip empty values, handle nested objects like Telegram's message.text)
        String[] fields = {"prompt", "message", "query", "text", "input"};
        for (String field : fields) {
            if (input.has(field)) {
                JsonNode node = input.get(field);
                if (node.isObject() && node.has("text")) {
                    String val = node.get("text").asText();
                    if (val != null && !val.isEmpty()) return val;
                } else {
                    String val = node.asText();
                    if (val != null && !val.isEmpty()) return val;
                }
            }
        }

        // Check for body.prompt (from HTTP requests)
        if (input.has("body")) {
            JsonNode body = input.get("body");
            for (String field : new String[]{"prompt", "message", "query", "text"}) {
                if (body.has(field)) {
                    JsonNode node = body.get(field);
                    if (node.isObject() && node.has("text")) {
                        String val = node.get("text").asText();
                        if (val != null && !val.isEmpty()) return val;
                    } else {
                        String val = node.asText();
                        if (val != null && !val.isEmpty()) return val;
                    }
                }
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

            // Fall back to _standalone for workflows without an application
            if (appId == null || appId.isEmpty()) {
                appId = "_standalone";
            }

            // Call KV service to get the value
            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    java.net.URLEncoder.encode(keyPath, "UTF-8") +
                    "?applicationId=" + java.net.URLEncoder.encode(appId, "UTF-8");

            LOG.debugf("KV fetch: %s", kvServiceUrl);

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
                    LOG.warnf("KV entry '%s' has no 'value' field. Response: %s", keyPath, responseBody);
                } else {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    LOG.warnf("KV fetch failed for '%s': HTTP %d - %s", keyPath, statusCode, responseBody);
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
                    // OpenAI format from Tool/MCP node: { type: "function", function: {...}, nodeId: "...", _mcpTool: bool }
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

                        // Check if this is an MCP-sourced tool
                        if (toolConfig.has("_mcpTool") && toolConfig.get("_mcpTool").asBoolean()) {
                            builder.mcpTool(true);
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

            // Check if this tool was tagged as an MCP tool by AgentNodeExecutor
            if (tool.isMcpTool()) {
                ctx.isMcpTool = true;
                ctx.mcpNodeId = tool.getNodeId();
                if (ctx.mcpNodeId != null) {
                    ctx.targetNode = findNodeById(node.workflow.nodes, ctx.mcpNodeId);
                }
                map.put(tool.getName(), ctx);
                LOG.debugf("Registered MCP tool in context map: %s (mcpNode: %s)",
                    tool.getName(), ctx.mcpNodeId);
                continue;
            }

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

    /**
     * Execute a streaming LLM call and emit tokens to chat in real-time.
     */
    private LlmResponse executeStreamingLlmCall(
            StreamingLlmProvider provider,
            LlmRequest request,
            String apiKey,
            ExecutionContext context,
            WorkflowNodeEntity node,
            boolean streamToChat) {

        String streamId = UUID.randomUUID().toString();
        StringBuilder contentBuilder = new StringBuilder();

        // Emit stream start event
        if (streamToChat && context.getExecution() != null) {
            eventService.sendChatStreamStart(
                context.getExecution(),
                node.id.toString(),
                node.name,
                streamId
            );
        }

        try {
            // Execute streaming call with token callback
            LlmResponse response = provider.streamChat(request, apiKey, token -> {
                if (token.isContent() && token.getContent() != null) {
                    String tokenContent = token.getContent();
                    contentBuilder.append(tokenContent);

                    // Emit token to chat
                    if (streamToChat && context.getExecution() != null) {
                        eventService.sendChatStreamToken(
                            context.getExecution(),
                            node.id.toString(),
                            streamId,
                            tokenContent
                        );
                    }
                } else if (token.isError()) {
                    LOG.warnf("Streaming error: %s", token.getContent());
                    if (streamToChat && context.getExecution() != null) {
                        eventService.sendChatStreamError(
                            context.getExecution(),
                            node.id.toString(),
                            streamId,
                            token.getContent()
                        );
                    }
                }
            });

            // Emit stream end event
            if (streamToChat && context.getExecution() != null) {
                Map<String, Object> usage = null;
                if (response != null && response.getUsage() != null) {
                    usage = Map.of(
                        "promptTokens", response.getUsage().getPromptTokens(),
                        "completionTokens", response.getUsage().getCompletionTokens(),
                        "totalTokens", response.getUsage().getTotalTokens()
                    );
                }
                eventService.sendChatStreamEnd(
                    context.getExecution(),
                    node.id.toString(),
                    streamId,
                    contentBuilder.toString(),
                    usage
                );
            }

            return response;

        } catch (Exception e) {
            LOG.errorf(e, "Streaming LLM call failed");

            // Emit error event
            if (streamToChat && context.getExecution() != null) {
                eventService.sendChatStreamError(
                    context.getExecution(),
                    node.id.toString(),
                    streamId,
                    e.getMessage()
                );
            }

            return LlmResponse.error("Streaming failed: " + e.getMessage());
        }
    }

    private String executeToolCall(ToolCall toolCall, Map<String, ToolContext> toolContextMap,
                                   ExecutionContext context, WorkflowNodeEntity parentNode) {
        LOG.debugf("Executing tool call: %s with arguments: %s", toolCall.getName(), toolCall.getArguments());

        try {
            ToolContext toolCtx = toolContextMap.get(toolCall.getName());
            if (toolCtx == null) {
                LOG.warnf("Tool not found in context map: %s. Available tools: %s",
                    toolCall.getName(), toolContextMap.keySet());
                return objectMapper.writeValueAsString(
                        Map.of("error", "Tool not found: " + toolCall.getName())
                );
            }

            // Handle MCP tools: route call through MCP connection
            if (toolCtx.isMcpTool) {
                return executeMcpToolCall(toolCall, toolCtx, context, parentNode);
            }

            if (toolCtx.targetNode == null) {
                LOG.warnf("Tool has no target node: %s. Available tools: %s",
                    toolCall.getName(), toolContextMap.keySet());
                return objectMapper.writeValueAsString(
                        Map.of("error", "Tool not found: " + toolCall.getName())
                );
            }

            WorkflowNodeEntity targetNode = toolCtx.targetNode;
            LOG.debugf("Found target node for tool: %s (type: %s, id: %s)",
                targetNode.name, targetNode.type, targetNode.id);

            // Emit tool call started event
            if (context.getExecution() != null) {
                eventService.logToolCallStarted(
                    context.getExecution(),
                    parentNode.id.toString(),
                    parentNode.name,
                    toolCall.getName(),
                    targetNode.id.toString()
                );
            }

            // Get executor for the target node type
            if (!nodeExecutorFactory.hasExecutor(targetNode.type)) {
                LOG.errorf("No executor for node type: %s", targetNode.type);
                // Emit tool call failed event
                if (context.getExecution() != null) {
                    eventService.logToolCallCompleted(
                        context.getExecution(),
                        parentNode.id.toString(),
                        parentNode.name,
                        toolCall.getName(),
                        targetNode.id.toString(),
                        false
                    );
                }
                return objectMapper.writeValueAsString(
                        Map.of("error", "No executor for node type: " + targetNode.type)
                );
            }

            NodeExecutor executor = nodeExecutorFactory.getExecutor(targetNode.type);

            // Create a sub-context with tool arguments as input
            ExecutionContext subContext = createSubContext(context, toolCall.getArguments());

            // Execute the tool node
            NodeExecutionResult result = executor.execute(subContext, targetNode);

            // Emit tool call completed event
            if (context.getExecution() != null) {
                eventService.logToolCallCompleted(
                    context.getExecution(),
                    parentNode.id.toString(),
                    parentNode.name,
                    toolCall.getName(),
                    targetNode.id.toString(),
                    result.isSuccess()
                );
            }

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

    /**
     * Execute a tool call through the MCP server connection.
     */
    @SuppressWarnings("unchecked")
    private String executeMcpToolCall(ToolCall toolCall, ToolContext toolCtx,
                                      ExecutionContext context, WorkflowNodeEntity parentNode) {
        try {
            WorkflowNodeEntity mcpNode = toolCtx.targetNode;

            // Emit tool call started event
            if (context.getExecution() != null) {
                eventService.logToolCallStarted(
                    context.getExecution(),
                    parentNode.id.toString(),
                    parentNode.name,
                    toolCall.getName(),
                    mcpNode != null ? mcpNode.id.toString() : "mcp"
                );
            }

            McpConnection conn = mcpNode != null
                    ? mcpConnector.getConnectionForNode(mcpNode)
                    : null;

            if (conn == null || !conn.isConnected()) {
                LOG.errorf("MCP connection not available for tool: %s", toolCall.getName());
                if (context.getExecution() != null) {
                    eventService.logToolCallCompleted(
                        context.getExecution(),
                        parentNode.id.toString(),
                        parentNode.name,
                        toolCall.getName(),
                        mcpNode != null ? mcpNode.id.toString() : "mcp",
                        false
                    );
                }
                return objectMapper.writeValueAsString(
                        Map.of("error", "MCP server not connected")
                );
            }

            // Parse arguments as Map
            Map<String, Object> args = new HashMap<>();
            if (toolCall.getArguments() != null && toolCall.getArguments().isObject()) {
                args = objectMapper.convertValue(toolCall.getArguments(), Map.class);
            }

            // Call the tool via MCP
            var result = conn.callTool(toolCall.getName(), args);

            // Emit tool call completed event
            if (context.getExecution() != null) {
                eventService.logToolCallCompleted(
                    context.getExecution(),
                    parentNode.id.toString(),
                    parentNode.name,
                    toolCall.getName(),
                    mcpNode != null ? mcpNode.id.toString() : "mcp",
                    !Boolean.TRUE.equals(result.isError())
                );
            }

            // Extract text content from MCP result
            StringBuilder resultText = new StringBuilder();
            if (result.content() != null) {
                for (var content : result.content()) {
                    if (content instanceof McpSchema.TextContent textContent) {
                        if (!resultText.isEmpty()) resultText.append("\n");
                        resultText.append(textContent.text());
                    }
                }
            }

            String toolResult = resultText.isEmpty() ? "{\"success\": true}" : resultText.toString();
            LOG.infof("MCP tool %s executed successfully, result length: %d",
                    toolCall.getName(), toolResult.length());
            return toolResult;

        } catch (Exception e) {
            LOG.errorf("MCP tool %s execution failed: %s", toolCall.getName(), e.getMessage());
            try {
                return objectMapper.writeValueAsString(
                        Map.of("error", "MCP tool execution failed: " + e.getMessage())
                );
            } catch (Exception ex) {
                return "{\"error\": \"MCP tool execution failed\"}";
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
        boolean isMcpTool;
        UUID mcpNodeId; // The MCP node ID that provides this tool
    }

    /**
     * Find a memory node connected to this LLM node.
     * Supports multiple connection methods:
     * - 'memory' input port
     * - 'context' input port
     * - 'context_memory' input port
     * - Tool-like ports: 'tool_memory', 'tool_context'
     * - Any edge from a MEMORY node type
     */
    private WorkflowNodeEntity findConnectedMemoryNode(WorkflowNodeEntity node) {
        if (node.workflow == null || node.workflow.edges == null) {
            return null;
        }

        // Accepted port names for context memory connection
        List<String> acceptedPorts = Arrays.asList(
            "memory", "context", "context_memory",
            "tool_memory", "tool_context", "tool_context_memory"
        );

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            if (edge.sourceNode == null || edge.sourceNode.type != NodeType.MEMORY) {
                continue;
            }

            // Check if this edge connects TO our node
            if (edge.targetNode != null && edge.targetNode.id.equals(node.id)) {
                String portId = edge.targetPortId;

                // Accept if port is in accepted list or starts with accepted prefixes
                if (portId == null || acceptedPorts.contains(portId) ||
                    portId.startsWith("memory") || portId.startsWith("context")) {
                    LOG.debugf("Found memory node connected via port: %s", portId);
                    return edge.sourceNode;
                }
            }

            // Also check if memory node is connected FROM our node (reverse direction)
            if (edge.sourceNode != null && edge.targetNode != null &&
                edge.sourceNode.id.equals(node.id) &&
                edge.targetNode.type == NodeType.MEMORY) {
                String portId = edge.sourcePortId;
                if (portId != null && (acceptedPorts.contains(portId) ||
                    portId.startsWith("memory") || portId.startsWith("context") ||
                    portId.startsWith("tool_memory") || portId.startsWith("tool_context"))) {
                    LOG.debugf("Found memory node connected via output port: %s", portId);
                    return edge.targetNode;
                }
            }
        }

        return null;
    }

    /**
     * Parse memory configuration from the memory node.
     */
    private MemoryConfig parseMemoryConfig(WorkflowNodeEntity memoryNode, ExecutionContext context) {
        MemoryConfig config = new MemoryConfig();

        try {
            JsonNode nodeConfig = memoryNode.configuration != null
                    ? objectMapper.readTree(memoryNode.configuration)
                    : objectMapper.createObjectNode();

            config.cutoffMode = nodeConfig.has("cutoffMode")
                    ? nodeConfig.get("cutoffMode").asText()
                    : "message";

            config.maxMessages = nodeConfig.has("maxMessages")
                    ? nodeConfig.get("maxMessages").asInt()
                    : 50;

            config.maxTokens = nodeConfig.has(MAX_TOKENS)
                    ? nodeConfig.get(MAX_TOKENS).asInt()
                    : 4000;

            String conversationIdExpression = nodeConfig.has("conversationIdExpression")
                    ? nodeConfig.get("conversationIdExpression").asText()
                    : "${input.threadId}";

            // Resolve the conversation ID
            config.conversationId = context.resolveExpression(conversationIdExpression);

            // If expression didn't resolve, try common fallbacks
            if (config.conversationId == null || config.conversationId.isEmpty() ||
                config.conversationId.equals(conversationIdExpression)) {
                config.conversationId = tryResolveConversationId(context);
            }
        } catch (Exception e) {
            LOG.warnf("Failed to parse memory config: %s", e.getMessage());
            config.cutoffMode = "message";
            config.maxMessages = 50;
            config.maxTokens = 4000;
        }

        return config;
    }

    /**
     * Parse LlmMessage from JSON (from conversation history passed by Agent).
     */
    private LlmMessage parseMessageFromJson(JsonNode msgNode) {
        if (msgNode == null || !msgNode.has("role")) {
            return null;
        }

        String roleStr = msgNode.get("role").asText().toUpperCase();
        LlmMessage.Role role;
        try {
            role = LlmMessage.Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            LOG.warnf("Unknown message role: %s", roleStr);
            return null;
        }

        String content = msgNode.has("content") ? msgNode.get("content").asText() : null;
        String toolCallId = msgNode.has("toolCallId") ? msgNode.get("toolCallId").asText() : null;
        String name = msgNode.has("name") ? msgNode.get("name").asText() : null;

        return LlmMessage.builder()
                .role(role)
                .content(content)
                .toolCallId(toolCallId)
                .name(name)
                .build();
    }

    /**
     * Parse memory configuration from JSON (passed by Agent node via config).
     */
    private MemoryConfig parseMemoryConfigFromJson(JsonNode memoryConfigJson, ExecutionContext context) {
        MemoryConfig config = new MemoryConfig();

        config.cutoffMode = memoryConfigJson.has("cutoffMode")
                ? memoryConfigJson.get("cutoffMode").asText()
                : "message";

        config.maxMessages = memoryConfigJson.has("maxMessages")
                ? memoryConfigJson.get("maxMessages").asInt()
                : 50;

        config.maxTokens = memoryConfigJson.has(MAX_TOKENS)
                ? memoryConfigJson.get(MAX_TOKENS).asInt()
                : 4000;

        String conversationIdExpression = memoryConfigJson.has("conversationIdExpression")
                ? memoryConfigJson.get("conversationIdExpression").asText()
                : "${input.threadId}";

        // Resolve the conversation ID
        config.conversationId = context.resolveExpression(conversationIdExpression);

        // If expression didn't resolve, try common fallbacks
        if (config.conversationId == null || config.conversationId.isEmpty() ||
            config.conversationId.equals(conversationIdExpression)) {
            config.conversationId = tryResolveConversationId(context);
        }

        return config;
    }

    /**
     * Try to resolve conversation ID from common input fields.
     */
    private String tryResolveConversationId(ExecutionContext context) {
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
     * Load conversation history from memory store with cutoff applied.
     */
    private List<LlmMessage> loadConversationHistory(String conversationId, MemoryConfig config) {
        if (conversationId == null || conversationId.isEmpty()) {
            return new ArrayList<>();
        }

        if ("token".equalsIgnoreCase(config.cutoffMode)) {
            return contextMemoryStore.getMessagesByTokens(conversationId, config.maxTokens);
        } else {
            // Default to message-based cutoff
            return contextMemoryStore.getMessagesByCount(conversationId, config.maxMessages);
        }
    }

    /**
     * Helper class to hold memory configuration.
     */
    private static class MemoryConfig {
        String cutoffMode = "message";
        int maxMessages = 50;
        int maxTokens = 4000;
        String conversationId;
    }

    /**
     * Holds resolved provider, API key, base URL, and error info.
     */
    private static class ProviderConfig {
        String providerName;
        LlmProvider provider;
        String apiKey;
        String baseUrl;
        boolean isOllama;
        String error;
    }

    /**
     * Holds extracted LLM call parameters (model, temperature, etc.).
     */
    private static class LlmParameters {
        String model;
        String systemPrompt;
        Double temperature;
        Integer maxTokens;
        int maxIterations;
        JsonNode responseFormat;
        boolean useStructuredOutputFallback;
        ResilienceConfig resilienceConfig;
        boolean streamingEnabled;
        boolean streamToChat;
    }

    /**
     * Holds the result of building initial messages, including memory context.
     */
    private static class InitialMessagesResult {
        List<LlmMessage> messages;
        boolean historyFromAgent;
        MemoryConfig memoryConfig;
        String conversationId;
        String userPrompt;
        String error;
    }

    /**
     * Holds the result of the LLM execution loop.
     */
    private static class LlmLoopResult {
        LlmResponse lastResponse;
        int iterations;
        String error;
    }

    /**
     * Build resilience configuration from node config.
     *
     * Supported configuration:
     * {
     *   "retry": {
     *     "enabled": true,
     *     "maxAttempts": 3,
     *     "initialBackoffMs": 1000,
     *     "maxBackoffMs": 30000
     *   },
     *   "fallback": {
     *     "enabled": true,
     *     "providers": ["anthropic", "ollama"]
     *   },
     *   "timeout": 60000
     * }
     */
    private ResilienceConfig buildResilienceConfig(JsonNode config) {
        ResilienceConfig.Builder builder = ResilienceConfig.builder();

        parseRetryConfig(config, builder);
        parseFallbackConfig(config, builder);

        if (config.has("timeout")) {
            builder.timeoutMs(config.get("timeout").asLong());
        }

        return builder.build();
    }

    private void parseRetryConfig(JsonNode config, ResilienceConfig.Builder builder) {
        if (!config.has("retry") || !config.get("retry").isObject()) {
            return;
        }

        JsonNode retryConfig = config.get("retry");
        if (retryConfig.has(ENABLED) && !retryConfig.get(ENABLED).asBoolean()) {
            builder.maxRetries(0);
            return;
        }

        if (retryConfig.has("maxAttempts")) {
            builder.maxRetries(retryConfig.get("maxAttempts").asInt() - 1);
        }
        if (retryConfig.has("initialBackoffMs")) {
            builder.initialBackoffMs(retryConfig.get("initialBackoffMs").asLong());
        }
        if (retryConfig.has("maxBackoffMs")) {
            builder.maxBackoffMs(retryConfig.get("maxBackoffMs").asLong());
        }
    }

    private void parseFallbackConfig(JsonNode config, ResilienceConfig.Builder builder) {
        if (!config.has("fallback") || !config.get("fallback").isObject()) {
            return;
        }

        JsonNode fallbackConfig = config.get("fallback");
        if (fallbackConfig.has(ENABLED) && fallbackConfig.get(ENABLED).asBoolean()
                && fallbackConfig.has("providers") && fallbackConfig.get("providers").isArray()) {
            List<String> fallbackProviders = new ArrayList<>();
            for (JsonNode provider : fallbackConfig.get("providers")) {
                fallbackProviders.add(provider.asText());
            }
            builder.fallbackProviders(fallbackProviders);
        }
    }
}
