package com.nuraly.workflows.llm.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.llm.LlmProvider;
import com.nuraly.workflows.llm.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Ollama LLM Provider implementation.
 * Supports local Ollama models like Llama, Mistral, CodeLlama, etc.
 */
@ApplicationScoped
public class OllamaProvider implements LlmProvider {

    private static final Logger LOG = Logger.getLogger(OllamaProvider.class);
    private static final String DEFAULT_API_URL = "http://localhost:11434";
    private static final long CACHE_TTL_MS = 60_000; // Cache models for 1 minute

    @ConfigProperty(name = "ollama.api.url", defaultValue = DEFAULT_API_URL)
    String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Set<String> cachedModels = ConcurrentHashMap.newKeySet();
    private final AtomicLong cacheTimestamp = new AtomicLong(0);

    @Override
    public String getName() {
        return "ollama";
    }

    @Override
    public boolean supportsModel(String model) {
        if (model == null) {
            return false;
        }
        // Query available models from Ollama server
        List<String> availableModels = getAvailableModels();
        if (!availableModels.isEmpty()) {
            // Check exact match or base model match (e.g., "llama3.2" matches "llama3.2:latest")
            for (String available : availableModels) {
                if (available.equals(model) ||
                    available.startsWith(model + ":") ||
                    model.equals(available.split(":")[0])) {
                    return true;
                }
            }
        }
        // Fallback: accept any model name (Ollama will return an error if not found)
        return true;
    }

    /**
     * Get list of available models from the Ollama server.
     * Results are cached for 1 minute to avoid excessive API calls.
     *
     * @return List of available model names, or empty list if server is unreachable
     */
    public List<String> getAvailableModels() {
        return getAvailableModels(null);
    }

    /**
     * Get list of available models from the specified Ollama server.
     * Results are cached for 1 minute to avoid excessive API calls.
     *
     * @param baseUrl Optional base URL override for the Ollama server
     * @return List of available model names, or empty list if server is unreachable
     */
    public List<String> getAvailableModels(String baseUrl) {
        String effectiveUrl = resolveBaseUrl(baseUrl);

        // Check cache validity (only use cache for default URL)
        if (baseUrl == null || baseUrl.isEmpty()) {
            long now = System.currentTimeMillis();
            if (now - cacheTimestamp.get() < CACHE_TTL_MS && !cachedModels.isEmpty()) {
                return new ArrayList<>(cachedModels);
            }

            // Fetch from server
            List<String> models = fetchModelsFromServer(effectiveUrl);
            if (!models.isEmpty()) {
                cachedModels.clear();
                cachedModels.addAll(models);
                cacheTimestamp.set(now);
            }
            return models;
        }

        // For custom URLs, always fetch fresh
        return fetchModelsFromServer(effectiveUrl);
    }

    /**
     * Refresh the cached model list from the Ollama server.
     *
     * @return List of available model names
     */
    public List<String> refreshAvailableModels() {
        cacheTimestamp.set(0); // Invalidate cache
        return getAvailableModels();
    }

    /**
     * Resolve the effective base URL to use.
     *
     * @param requestBaseUrl Optional base URL from request
     * @return The effective base URL
     */
    private String resolveBaseUrl(String requestBaseUrl) {
        if (requestBaseUrl != null && !requestBaseUrl.isEmpty()) {
            // Remove trailing slash if present
            return requestBaseUrl.endsWith("/") ?
                    requestBaseUrl.substring(0, requestBaseUrl.length() - 1) : requestBaseUrl;
        }
        return apiUrl;
    }

    private List<String> fetchModelsFromServer(String baseUrl) {
        String tagsUrl = baseUrl + "/api/tags";

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet httpGet = new HttpGet(tagsUrl);
            httpGet.addHeader("Accept", "application/json");

            var response = httpClient.execute(httpGet);
            int statusCode = response.getCode();
            String responseBody = EntityUtils.toString(response.getEntity());

            if (statusCode >= 200 && statusCode < 300) {
                return parseModelsResponse(responseBody);
            } else {
                LOG.warnv("Failed to fetch Ollama models (status {0}): {1}", statusCode, responseBody);
                return Collections.emptyList();
            }
        } catch (Exception e) {
            LOG.warnv("Failed to connect to Ollama server at {0}: {1}", tagsUrl, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<String> parseModelsResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            List<String> models = new ArrayList<>();

            if (json.has("models") && json.get("models").isArray()) {
                for (JsonNode modelNode : json.get("models")) {
                    if (modelNode.has("name")) {
                        models.add(modelNode.get("name").asText());
                    }
                }
            }

            return models;
        } catch (Exception e) {
            LOG.warnv("Failed to parse Ollama models response: {0}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String getDefaultModel() {
        return "llama3.2";
    }

    @Override
    public LlmResponse chat(LlmRequest request, String apiKey) {
        try {
            ObjectNode requestBody = buildRequestBody(request);
            String effectiveBaseUrl = resolveBaseUrl(request.getBaseUrl());
            String chatUrl = effectiveBaseUrl + "/api/chat";

            LOG.debugv("Calling Ollama at {0}", chatUrl);

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(chatUrl);
                httpPost.addHeader("Content-Type", "application/json");

                // Ollama doesn't require API key by default, but supports it if provided
                if (apiKey != null && !apiKey.isEmpty()) {
                    httpPost.addHeader("Authorization", "Bearer " + apiKey);
                }

                httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    return LlmResponse.error("Ollama API error (status " + statusCode + "): " + extractErrorMessage(responseBody));
                }
            }
        } catch (Exception e) {
            return LlmResponse.error("Ollama request failed: " + e.getMessage());
        }
    }

    private ObjectNode buildRequestBody(LlmRequest request) {
        ObjectNode body = objectMapper.createObjectNode();

        // Model
        String model = request.getModel() != null ? request.getModel() : getDefaultModel();
        body.put("model", model);

        // Messages
        ArrayNode messages = objectMapper.createArrayNode();
        for (LlmMessage msg : request.getMessages()) {
            messages.add(convertMessage(msg));
        }
        body.set("messages", messages);

        // Disable streaming (we want the full response)
        body.put("stream", false);

        // Options
        ObjectNode options = objectMapper.createObjectNode();
        if (request.getTemperature() != null) {
            options.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            options.put("num_predict", request.getMaxTokens());
        }
        if (!options.isEmpty()) {
            body.set("options", options);
        }

        // Tools
        if (request.getTools() != null && !request.getTools().isEmpty()) {
            ArrayNode tools = objectMapper.createArrayNode();
            for (ToolDefinition tool : request.getTools()) {
                tools.add(convertTool(tool));
            }
            body.set("tools", tools);
        }

        return body;
    }

    private ObjectNode convertMessage(LlmMessage message) {
        ObjectNode node = objectMapper.createObjectNode();

        switch (message.getRole()) {
            case SYSTEM -> node.put("role", "system");
            case USER -> node.put("role", "user");
            case ASSISTANT -> node.put("role", "assistant");
            case TOOL -> node.put("role", "tool");
        }

        if (message.getContent() != null) {
            node.put("content", message.getContent());
        }

        // Tool call ID for tool responses (if supported)
        if (message.getToolCallId() != null) {
            node.put("tool_call_id", message.getToolCallId());
        }

        // Tool calls for assistant messages
        if (message.getToolCalls() != null && !message.getToolCalls().isEmpty()) {
            ArrayNode toolCalls = objectMapper.createArrayNode();
            for (ToolCall tc : message.getToolCalls()) {
                ObjectNode tcNode = objectMapper.createObjectNode();
                tcNode.put("id", tc.getId());
                tcNode.put("type", "function");
                ObjectNode functionNode = objectMapper.createObjectNode();
                functionNode.put("name", tc.getName());
                functionNode.set("arguments", tc.getArguments());
                tcNode.set("function", functionNode);
                toolCalls.add(tcNode);
            }
            node.set("tool_calls", toolCalls);
        }

        return node;
    }

    private ObjectNode convertTool(ToolDefinition tool) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "function");

        ObjectNode function = objectMapper.createObjectNode();
        function.put("name", tool.getName());
        function.put("description", tool.getDescription());

        if (tool.getParameters() != null) {
            function.set("parameters", tool.getParameters());
        } else {
            // Default empty object schema
            ObjectNode params = objectMapper.createObjectNode();
            params.put("type", "object");
            params.set("properties", objectMapper.createObjectNode());
            function.set("parameters", params);
        }

        node.set("function", function);
        return node;
    }

    private LlmResponse parseResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode message = json.get("message");

            LlmResponse.LlmResponseBuilder builder = LlmResponse.builder();

            // Content
            if (message.has("content") && !message.get("content").isNull()) {
                String content = message.get("content").asText();
                if (!content.isEmpty()) {
                    builder.content(content);
                }
            }

            // Tool calls
            if (message.has("tool_calls") && message.get("tool_calls").isArray()) {
                List<ToolCall> toolCalls = new ArrayList<>();
                for (JsonNode tc : message.get("tool_calls")) {
                    JsonNode functionNode = tc.get("function");
                    String id = tc.has("id") ? tc.get("id").asText() : generateToolCallId();

                    JsonNode arguments;
                    if (functionNode.has("arguments")) {
                        JsonNode argsNode = functionNode.get("arguments");
                        if (argsNode.isTextual()) {
                            arguments = objectMapper.readTree(argsNode.asText());
                        } else {
                            arguments = argsNode;
                        }
                    } else {
                        arguments = objectMapper.createObjectNode();
                    }

                    ToolCall toolCall = ToolCall.builder()
                            .id(id)
                            .name(functionNode.get("name").asText())
                            .arguments(arguments)
                            .build();
                    toolCalls.add(toolCall);
                }
                builder.toolCalls(toolCalls);
                builder.finishReason(LlmResponse.FinishReason.TOOL_CALLS);
            } else {
                // Determine finish reason
                if (json.has("done") && json.get("done").asBoolean()) {
                    String doneReason = json.has("done_reason") ? json.get("done_reason").asText() : "stop";
                    builder.finishReason(mapFinishReason(doneReason));
                } else {
                    builder.finishReason(LlmResponse.FinishReason.STOP);
                }
            }

            // Usage - Ollama provides eval_count and prompt_eval_count
            if (json.has("prompt_eval_count") || json.has("eval_count")) {
                int promptTokens = json.has("prompt_eval_count") ? json.get("prompt_eval_count").asInt() : 0;
                int completionTokens = json.has("eval_count") ? json.get("eval_count").asInt() : 0;
                builder.usage(LlmResponse.Usage.builder()
                        .promptTokens(promptTokens)
                        .completionTokens(completionTokens)
                        .totalTokens(promptTokens + completionTokens)
                        .build());
            }

            // Model
            if (json.has("model")) {
                builder.model(json.get("model").asText());
            }

            return builder.build();
        } catch (Exception e) {
            return LlmResponse.error("Failed to parse Ollama response: " + e.getMessage());
        }
    }

    private LlmResponse.FinishReason mapFinishReason(String reason) {
        return switch (reason) {
            case "stop" -> LlmResponse.FinishReason.STOP;
            case "length" -> LlmResponse.FinishReason.LENGTH;
            default -> LlmResponse.FinishReason.STOP;
        };
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            if (json.has("error")) {
                return json.get("error").asText();
            }
            return responseBody;
        } catch (Exception e) {
            return responseBody;
        }
    }

    private String generateToolCallId() {
        return "call_" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }
}
