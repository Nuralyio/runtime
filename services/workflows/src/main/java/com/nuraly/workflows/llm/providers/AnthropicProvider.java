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
 * Anthropic (Claude) LLM Provider implementation.
 * Supports Claude 3.5, Claude 3 (Opus, Sonnet, Haiku) models.
 */
@ApplicationScoped
public class AnthropicProvider implements LlmProvider {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final String API_VERSION = "2023-06-01";
    private static final Set<String> SUPPORTED_MODELS = Set.of(
            "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022",
            "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307",
            "claude-sonnet-4-20250514", "claude-opus-4-5-20251101"
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "anthropic";
    }

    @Override
    public boolean supportsModel(String model) {
        return model != null && (SUPPORTED_MODELS.contains(model) || model.startsWith("claude-"));
    }

    @Override
    public String getDefaultModel() {
        return "claude-sonnet-4-20250514";
    }

    @Override
    public LlmResponse chat(LlmRequest request, String apiKey) {
        try {
            ObjectNode requestBody = buildRequestBody(request);

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(API_URL);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.addHeader("x-api-key", apiKey);
                httpPost.addHeader("anthropic-version", API_VERSION);
                httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    return LlmResponse.error("Anthropic API error (status " + statusCode + "): " + extractErrorMessage(responseBody));
                }
            }
        } catch (Exception e) {
            return LlmResponse.error("Anthropic request failed: " + e.getMessage());
        }
    }

    private ObjectNode buildRequestBody(LlmRequest request) {
        ObjectNode body = objectMapper.createObjectNode();

        // Model
        String model = request.getModel() != null ? request.getModel() : getDefaultModel();
        body.put("model", model);

        // Max tokens (required for Anthropic)
        body.put("max_tokens", request.getMaxTokens() != null ? request.getMaxTokens() : 4096);

        // System prompt (separate from messages in Anthropic API)
        String systemPrompt = null;
        List<LlmMessage> conversationMessages = new ArrayList<>();

        for (LlmMessage msg : request.getMessages()) {
            if (msg.getRole() == LlmMessage.Role.SYSTEM) {
                systemPrompt = msg.getContent();
            } else {
                conversationMessages.add(msg);
            }
        }

        if (systemPrompt != null) {
            body.put("system", systemPrompt);
        } else if (request.getSystemPrompt() != null) {
            body.put("system", request.getSystemPrompt());
        }

        // Messages
        ArrayNode messages = objectMapper.createArrayNode();
        for (LlmMessage msg : conversationMessages) {
            ObjectNode msgNode = convertMessage(msg);
            if (msgNode != null) {
                messages.add(msgNode);
            }
        }
        body.set("messages", messages);

        // Temperature
        if (request.getTemperature() != null) {
            body.put("temperature", request.getTemperature());
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
                ObjectNode toolChoice = objectMapper.createObjectNode();
                toolChoice.put("type", "any");
                body.set("tool_choice", toolChoice);
            }
        }

        return body;
    }

    private ObjectNode convertMessage(LlmMessage message) {
        ObjectNode node = objectMapper.createObjectNode();

        switch (message.getRole()) {
            case USER -> {
                node.put("role", "user");
                ArrayNode content = objectMapper.createArrayNode();
                ObjectNode textBlock = objectMapper.createObjectNode();
                textBlock.put("type", "text");
                textBlock.put("text", message.getContent());
                content.add(textBlock);
                node.set("content", content);
            }
            case ASSISTANT -> {
                node.put("role", "assistant");
                ArrayNode content = objectMapper.createArrayNode();

                // Text content
                if (message.getContent() != null) {
                    ObjectNode textBlock = objectMapper.createObjectNode();
                    textBlock.put("type", "text");
                    textBlock.put("text", message.getContent());
                    content.add(textBlock);
                }

                // Tool use blocks
                if (message.getToolCalls() != null) {
                    for (ToolCall tc : message.getToolCalls()) {
                        ObjectNode toolUse = objectMapper.createObjectNode();
                        toolUse.put("type", "tool_use");
                        toolUse.put("id", tc.getId());
                        toolUse.put("name", tc.getName());
                        toolUse.set("input", tc.getArguments());
                        content.add(toolUse);
                    }
                }

                node.set("content", content);
            }
            case TOOL -> {
                node.put("role", "user");
                ArrayNode content = objectMapper.createArrayNode();
                ObjectNode toolResult = objectMapper.createObjectNode();
                toolResult.put("type", "tool_result");
                toolResult.put("tool_use_id", message.getToolCallId());
                toolResult.put("content", message.getContent());
                content.add(toolResult);
                node.set("content", content);
            }
            default -> {
                return null;
            }
        }

        return node;
    }

    private ObjectNode convertTool(ToolDefinition tool) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("name", tool.getName());
        node.put("description", tool.getDescription());

        if (tool.getParameters() != null) {
            node.set("input_schema", tool.getParameters());
        } else {
            // Default empty object schema
            ObjectNode schema = objectMapper.createObjectNode();
            schema.put("type", "object");
            schema.set("properties", objectMapper.createObjectNode());
            node.set("input_schema", schema);
        }

        return node;
    }

    private LlmResponse parseResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            LlmResponse.LlmResponseBuilder builder = LlmResponse.builder();

            // Parse content blocks
            JsonNode contentArray = json.get("content");
            StringBuilder textContent = new StringBuilder();
            List<ToolCall> toolCalls = new ArrayList<>();

            for (JsonNode block : contentArray) {
                String type = block.get("type").asText();

                if ("text".equals(type)) {
                    textContent.append(block.get("text").asText());
                } else if ("tool_use".equals(type)) {
                    ToolCall toolCall = ToolCall.builder()
                            .id(block.get("id").asText())
                            .name(block.get("name").asText())
                            .arguments(block.get("input"))
                            .build();
                    toolCalls.add(toolCall);
                }
            }

            if (textContent.length() > 0) {
                builder.content(textContent.toString());
            }

            if (!toolCalls.isEmpty()) {
                builder.toolCalls(toolCalls);
            }

            // Stop reason
            String stopReason = json.get("stop_reason").asText();
            builder.finishReason(mapStopReason(stopReason));

            // Usage
            if (json.has("usage")) {
                JsonNode usage = json.get("usage");
                builder.usage(LlmResponse.Usage.builder()
                        .promptTokens(usage.get("input_tokens").asInt())
                        .completionTokens(usage.get("output_tokens").asInt())
                        .totalTokens(usage.get("input_tokens").asInt() + usage.get("output_tokens").asInt())
                        .build());
            }

            // Model
            if (json.has("model")) {
                builder.model(json.get("model").asText());
            }

            return builder.build();
        } catch (Exception e) {
            return LlmResponse.error("Failed to parse Anthropic response: " + e.getMessage());
        }
    }

    private LlmResponse.FinishReason mapStopReason(String reason) {
        return switch (reason) {
            case "end_turn" -> LlmResponse.FinishReason.STOP;
            case "tool_use" -> LlmResponse.FinishReason.TOOL_CALLS;
            case "max_tokens" -> LlmResponse.FinishReason.LENGTH;
            case "stop_sequence" -> LlmResponse.FinishReason.STOP;
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
