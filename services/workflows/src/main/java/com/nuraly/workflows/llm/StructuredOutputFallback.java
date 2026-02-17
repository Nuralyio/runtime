package com.nuraly.workflows.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Prompt-based fallback for models that do not support native structured output.
 * Injects the JSON schema into the system prompt and extracts JSON from free-text responses.
 */
public final class StructuredOutputFallback {

    private static final Logger LOG = Logger.getLogger(StructuredOutputFallback.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String JSON_SCHEMA = "json_schema";
    private static final Pattern CODE_BLOCK_PATTERN = Pattern.compile("```(?:json)?[ \\t]*+\\n?(.*?)\\n?```", Pattern.DOTALL);
    private static final Pattern JSON_OBJECT_PATTERN = Pattern.compile("\\{.*}", Pattern.DOTALL);

    private StructuredOutputFallback() {}

    /**
     * Strips responseFormat from the request and appends the JSON schema
     * to the system prompt with instructions to reply as raw JSON only.
     *
     * @param request the original LLM request with responseFormat set
     * @return a new LlmRequest with responseFormat removed and schema injected into the system prompt
     */
    public static LlmRequest applyPromptFallback(LlmRequest request) {
        JsonNode responseFormat = request.getResponseFormat();
        String schemaText = extractSchemaText(responseFormat);

        String schemaInstruction = "\n\nYou MUST respond with valid JSON only, no additional text. " +
                "Your response must conform to the following JSON schema:\n" + schemaText;

        List<LlmMessage> messages = new ArrayList<>(request.getMessages());

        // Find and augment the system message, or prepend one
        boolean systemFound = false;
        for (int i = 0; i < messages.size(); i++) {
            LlmMessage msg = messages.get(i);
            if (msg.getRole() == LlmMessage.Role.SYSTEM) {
                messages.set(i, LlmMessage.system(msg.getContent() + schemaInstruction));
                systemFound = true;
                break;
            }
        }
        if (!systemFound) {
            messages.add(0, LlmMessage.system(schemaInstruction.trim()));
        }

        return LlmRequest.builder()
                .model(request.getModel())
                .messages(messages)
                .tools(request.getTools())
                .temperature(request.getTemperature())
                .maxTokens(request.getMaxTokens())
                .systemPrompt(request.getSystemPrompt())
                .forceToolUse(request.getForceToolUse())
                .baseUrl(request.getBaseUrl())
                .responseFormat(null) // strip native response format
                .build();
    }

    /**
     * Best-effort JSON extraction from a free-text LLM response.
     * Tries three strategies in order:
     * 1. Parse entire content as JSON directly
     * 2. Extract from ```json ... ``` code blocks
     * 3. Find first {...} block via regex
     *
     * Returns the original response unchanged if extraction fails.
     */
    public static LlmResponse extractJson(LlmResponse response) {
        if (response == null || response.getContent() == null || response.getContent().isBlank()) {
            return response;
        }

        String content = response.getContent().trim();

        // Strategy 1: parse entire content as JSON
        String parsed = tryParseJson(content);
        if (parsed != null) {
            return replaceContent(response, parsed);
        }

        // Strategy 2: extract from ```json ... ``` code blocks
        Matcher codeBlockMatcher = CODE_BLOCK_PATTERN.matcher(content);
        if (codeBlockMatcher.find()) {
            String blockContent = codeBlockMatcher.group(1).trim();
            parsed = tryParseJson(blockContent);
            if (parsed != null) {
                return replaceContent(response, parsed);
            }
        }

        // Strategy 3: find first {...} block
        Matcher jsonObjectMatcher = JSON_OBJECT_PATTERN.matcher(content);
        if (jsonObjectMatcher.find()) {
            String objectContent = jsonObjectMatcher.group().trim();
            parsed = tryParseJson(objectContent);
            if (parsed != null) {
                return replaceContent(response, parsed);
            }
        }

        // All strategies failed - return original response unchanged
        LOG.debugf("Structured output fallback: could not extract JSON from response");
        return response;
    }

    private static String extractSchemaText(JsonNode responseFormat) {
        if (responseFormat != null
                && responseFormat.has(JSON_SCHEMA)
                && responseFormat.get(JSON_SCHEMA).has("schema")) {
            return responseFormat.get(JSON_SCHEMA).get("schema").toPrettyString();
        }
        // Fall back to the whole responseFormat node
        return responseFormat != null ? responseFormat.toPrettyString() : "{}";
    }

    private static String tryParseJson(String text) {
        try {
            JsonNode node = MAPPER.readTree(text);
            if (node.isObject() || node.isArray()) {
                return node.toString();
            }
        } catch (Exception ignored) {
            // Expected when text is not valid JSON — fallback strategies will handle it
        }
        return null;
    }

    private static LlmResponse replaceContent(LlmResponse original, String newContent) {
        return LlmResponse.builder()
                .content(newContent)
                .toolCalls(original.getToolCalls())
                .finishReason(original.getFinishReason())
                .usage(original.getUsage())
                .error(original.getError())
                .model(original.getModel())
                .build();
    }
}
