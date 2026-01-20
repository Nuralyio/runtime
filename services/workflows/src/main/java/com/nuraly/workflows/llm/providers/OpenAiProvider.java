package com.nuraly.workflows.llm.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.llm.LlmProvider;
import com.nuraly.workflows.llm.dto.*;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * OpenAI LLM Provider implementation.
 * Supports GPT-4, GPT-4 Turbo, GPT-3.5 Turbo models.
 */
@ApplicationScoped
public class OpenAiProvider implements LlmProvider {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
    private static final Set<String> SUPPORTED_MODELS = Set.of(
            "gpt-4", "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-4o", "gpt-4o-mini",
            "gpt-3.5-turbo", "gpt-3.5-turbo-16k"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "openai";
    }

    @Override
    public boolean supportsModel(String model) {
        return model != null && (SUPPORTED_MODELS.contains(model) || model.startsWith("gpt-"));
    }

    @Override
    public String getDefaultModel() {
        return "gpt-4o";
    }

    @Override
    public LlmResponse chat(LlmRequest request, String apiKey) {
        try {
            ObjectNode requestBody = buildRequestBody(request);

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(API_URL);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.addHeader("Authorization", "Bearer " + apiKey);
                httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    return LlmResponse.error("OpenAI API error (status " + statusCode + "): " + extractErrorMessage(responseBody));
                }
            }
        } catch (Exception e) {
            return LlmResponse.error("OpenAI request failed: " + e.getMessage());
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

        // Temperature
        if (request.getTemperature() != null) {
            body.put("temperature", request.getTemperature());
        }

        // Max tokens
        if (request.getMaxTokens() != null) {
            body.put("max_tokens", request.getMaxTokens());
        }

        // Tools
        if (request.getTools() != null && !request.getTools().isEmpty()) {
            ArrayNode tools = objectMapper.createArrayNode();
            for (ToolDefinition tool : request.getTools()) {
                tools.add(convertTool(tool));
            }
            body.set("tools", tools);

            // Force tool use if requested
            if (Boolean.TRUE.equals(request.getForceToolUse())) {
                body.put("tool_choice", "required");
            }
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

        // Tool call ID for tool responses
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
                functionNode.put("arguments", tc.getArguments().toString());
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
            JsonNode choice = json.get("choices").get(0);
            JsonNode message = choice.get("message");

            LlmResponse.LlmResponseBuilder builder = LlmResponse.builder();

            // Content
            if (message.has("content") && !message.get("content").isNull()) {
                builder.content(message.get("content").asText());
            }

            // Tool calls
            if (message.has("tool_calls") && message.get("tool_calls").isArray()) {
                List<ToolCall> toolCalls = new ArrayList<>();
                for (JsonNode tc : message.get("tool_calls")) {
                    ToolCall toolCall = ToolCall.builder()
                            .id(tc.get("id").asText())
                            .name(tc.get("function").get("name").asText())
                            .arguments(objectMapper.readTree(tc.get("function").get("arguments").asText()))
                            .build();
                    toolCalls.add(toolCall);
                }
                builder.toolCalls(toolCalls);
            }

            // Finish reason
            String finishReason = choice.get("finish_reason").asText();
            builder.finishReason(mapFinishReason(finishReason));

            // Usage
            if (json.has("usage")) {
                JsonNode usage = json.get("usage");
                builder.usage(LlmResponse.Usage.builder()
                        .promptTokens(usage.get("prompt_tokens").asInt())
                        .completionTokens(usage.get("completion_tokens").asInt())
                        .totalTokens(usage.get("total_tokens").asInt())
                        .build());
            }

            // Model
            if (json.has("model")) {
                builder.model(json.get("model").asText());
            }

            return builder.build();
        } catch (Exception e) {
            return LlmResponse.error("Failed to parse OpenAI response: " + e.getMessage());
        }
    }

    private LlmResponse.FinishReason mapFinishReason(String reason) {
        return switch (reason) {
            case "stop" -> LlmResponse.FinishReason.STOP;
            case "tool_calls" -> LlmResponse.FinishReason.TOOL_CALLS;
            case "length" -> LlmResponse.FinishReason.LENGTH;
            case "content_filter" -> LlmResponse.FinishReason.CONTENT_FILTER;
            default -> LlmResponse.FinishReason.STOP;
        };
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            if (json.has("error") && json.get("error").has("message")) {
                return json.get("error").get("message").asText();
            }
            return responseBody;
        } catch (Exception e) {
            return responseBody;
        }
    }
}
