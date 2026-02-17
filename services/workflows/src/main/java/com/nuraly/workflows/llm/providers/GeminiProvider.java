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
import java.util.UUID;

/**
 * Google Gemini LLM Provider implementation.
 * Supports Gemini Pro and Gemini Ultra models.
 */
@ApplicationScoped
public class GeminiProvider implements LlmProvider {

    private static final String API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final Set<String> SUPPORTED_MODELS = Set.of(
            "gemini-pro", "gemini-pro-vision", "gemini-ultra",
            "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp"
    );

    private static final String JSON_SCHEMA = "json_schema";
    private static final String PARTS = PARTS;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "gemini";
    }

    @Override
    public boolean supportsModel(String model) {
        return model != null && (SUPPORTED_MODELS.contains(model) || model.startsWith("gemini-"));
    }

    @Override
    public String getDefaultModel() {
        return "gemini-1.5-pro";
    }

    @Override
    public LlmResponse chat(LlmRequest request, String apiKey) {
        try {
            String model = request.getModel() != null ? request.getModel() : getDefaultModel();
            String url = API_BASE + model + ":generateContent?key=" + apiKey;

            ObjectNode requestBody = buildRequestBody(request);

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(url);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    return LlmResponse.error("Gemini API error (status " + statusCode + "): " + extractErrorMessage(responseBody));
                }
            }
        } catch (Exception e) {
            return LlmResponse.error("Gemini request failed: " + e.getMessage());
        }
    }

    private ObjectNode buildRequestBody(LlmRequest request) {
        ObjectNode body = objectMapper.createObjectNode();

        // Contents (messages)
        ArrayNode contents = objectMapper.createArrayNode();
        String systemInstruction = null;

        for (LlmMessage msg : request.getMessages()) {
            if (msg.getRole() == LlmMessage.Role.SYSTEM) {
                systemInstruction = msg.getContent();
            } else {
                ObjectNode content = convertMessage(msg);
                if (content != null) {
                    contents.add(content);
                }
            }
        }

        body.set("contents", contents);

        // System instruction
        String effectiveSystemInstruction = systemInstruction != null
                ? systemInstruction : request.getSystemPrompt();
        if (effectiveSystemInstruction != null) {
            body.set("systemInstruction", buildSystemInstruction(effectiveSystemInstruction));
        }

        // Generation config
        body.set("generationConfig", buildGenerationConfig(request));

        // Tools
        addToolsToBody(request, body);

        return body;
    }

    private ObjectNode buildSystemInstruction(String text) {
        ObjectNode systemNode = objectMapper.createObjectNode();
        ArrayNode parts = objectMapper.createArrayNode();
        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("text", text);
        parts.add(textPart);
        systemNode.set(PARTS, parts);
        return systemNode;
    }

    private ObjectNode buildGenerationConfig(LlmRequest request) {
        ObjectNode generationConfig = objectMapper.createObjectNode();
        if (request.getTemperature() != null) {
            generationConfig.put("temperature", request.getTemperature());
        }
        if (request.getMaxTokens() != null) {
            generationConfig.put("maxOutputTokens", request.getMaxTokens());
        }

        if (request.getResponseFormat() != null
                && request.getResponseFormat().has(JSON_SCHEMA)
                && request.getResponseFormat().get(JSON_SCHEMA).has("schema")) {
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.set("responseSchema",
                    request.getResponseFormat().get(JSON_SCHEMA).get("schema"));
        }

        return generationConfig;
    }

    private void addToolsToBody(LlmRequest request, ObjectNode body) {
        if (request.getTools() == null || request.getTools().isEmpty()) {
            return;
        }

        ArrayNode tools = objectMapper.createArrayNode();
        ObjectNode toolsWrapper = objectMapper.createObjectNode();
        ArrayNode functionDeclarations = objectMapper.createArrayNode();

        for (ToolDefinition tool : request.getTools()) {
            functionDeclarations.add(convertTool(tool));
        }

        toolsWrapper.set("functionDeclarations", functionDeclarations);
        tools.add(toolsWrapper);
        body.set("tools", tools);

        if (Boolean.TRUE.equals(request.getForceToolUse())) {
            ObjectNode toolConfig = objectMapper.createObjectNode();
            ObjectNode functionCallingConfig = objectMapper.createObjectNode();
            functionCallingConfig.put("mode", "ANY");
            toolConfig.set("functionCallingConfig", functionCallingConfig);
            body.set("toolConfig", toolConfig);
        }
    }

    private ObjectNode convertMessage(LlmMessage message) {
        ObjectNode node = objectMapper.createObjectNode();
        ArrayNode parts = objectMapper.createArrayNode();

        switch (message.getRole()) {
            case USER -> {
                node.put("role", "user");
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", message.getContent());
                parts.add(textPart);
            }
            case ASSISTANT -> {
                node.put("role", "model");

                // Text content
                if (message.getContent() != null) {
                    ObjectNode textPart = objectMapper.createObjectNode();
                    textPart.put("text", message.getContent());
                    parts.add(textPart);
                }

                // Function calls
                if (message.getToolCalls() != null) {
                    for (ToolCall tc : message.getToolCalls()) {
                        ObjectNode functionCall = objectMapper.createObjectNode();
                        ObjectNode fcNode = objectMapper.createObjectNode();
                        fcNode.put("name", tc.getName());
                        fcNode.set("args", tc.getArguments());
                        functionCall.set("functionCall", fcNode);
                        parts.add(functionCall);
                    }
                }
            }
            case TOOL -> {
                node.put("role", "user");
                ObjectNode functionResponse = objectMapper.createObjectNode();
                ObjectNode frNode = objectMapper.createObjectNode();
                frNode.put("name", message.getName());

                try {
                    frNode.set("response", objectMapper.readTree(message.getContent()));
                } catch (Exception e) {
                    ObjectNode responseNode = objectMapper.createObjectNode();
                    responseNode.put("result", message.getContent());
                    frNode.set("response", responseNode);
                }

                functionResponse.set("functionResponse", frNode);
                parts.add(functionResponse);
            }
            default -> {
                return null;
            }
        }

        node.set(PARTS, parts);
        return node;
    }

    private ObjectNode convertTool(ToolDefinition tool) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("name", tool.getName());
        node.put("description", tool.getDescription());

        if (tool.getParameters() != null) {
            node.set("parameters", tool.getParameters());
        } else {
            // Default empty object schema
            ObjectNode params = objectMapper.createObjectNode();
            params.put("type", "object");
            params.set("properties", objectMapper.createObjectNode());
            node.set("parameters", params);
        }

        return node;
    }

    private LlmResponse parseResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);

            // Check for candidates
            if (!json.has("candidates") || json.get("candidates").isEmpty()) {
                // Check for prompt feedback (blocked)
                if (json.has("promptFeedback")) {
                    JsonNode feedback = json.get("promptFeedback");
                    if (feedback.has("blockReason")) {
                        return LlmResponse.builder()
                                .finishReason(LlmResponse.FinishReason.CONTENT_FILTER)
                                .error("Content blocked: " + feedback.get("blockReason").asText())
                                .build();
                    }
                }
                return LlmResponse.error("No candidates in Gemini response");
            }

            JsonNode candidate = json.get("candidates").get(0);
            JsonNode content = candidate.get("content");
            JsonNode parts = content.get(PARTS);

            LlmResponse.LlmResponseBuilder builder = LlmResponse.builder();

            StringBuilder textContent = new StringBuilder();
            List<ToolCall> toolCalls = new ArrayList<>();

            for (JsonNode part : parts) {
                if (part.has("text")) {
                    textContent.append(part.get("text").asText());
                } else if (part.has("functionCall")) {
                    JsonNode fc = part.get("functionCall");
                    ToolCall toolCall = ToolCall.builder()
                            .id(UUID.randomUUID().toString()) // Gemini doesn't provide IDs
                            .name(fc.get("name").asText())
                            .arguments(fc.get("args"))
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

            // Finish reason
            String finishReason = candidate.has("finishReason") ?
                    candidate.get("finishReason").asText() : "STOP";
            builder.finishReason(mapFinishReason(finishReason));

            // Usage
            if (json.has("usageMetadata")) {
                JsonNode usage = json.get("usageMetadata");
                builder.usage(LlmResponse.Usage.builder()
                        .promptTokens(usage.has("promptTokenCount") ? usage.get("promptTokenCount").asInt() : 0)
                        .completionTokens(usage.has("candidatesTokenCount") ? usage.get("candidatesTokenCount").asInt() : 0)
                        .totalTokens(usage.has("totalTokenCount") ? usage.get("totalTokenCount").asInt() : 0)
                        .build());
            }

            return builder.build();
        } catch (Exception e) {
            return LlmResponse.error("Failed to parse Gemini response: " + e.getMessage());
        }
    }

    private LlmResponse.FinishReason mapFinishReason(String reason) {
        return switch (reason) {
            case "STOP" -> LlmResponse.FinishReason.STOP;
            case "MAX_TOKENS" -> LlmResponse.FinishReason.LENGTH;
            case "SAFETY" -> LlmResponse.FinishReason.CONTENT_FILTER;
            case "RECITATION" -> LlmResponse.FinishReason.CONTENT_FILTER;
            default -> {
                // Check for function call indicators
                if (reason.contains("FUNCTION") || reason.contains("TOOL")) {
                    yield LlmResponse.FinishReason.TOOL_CALLS;
                }
                yield LlmResponse.FinishReason.STOP;
            }
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
