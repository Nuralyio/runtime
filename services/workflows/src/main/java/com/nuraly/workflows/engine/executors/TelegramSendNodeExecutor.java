package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

/**
 * Telegram Send Node Executor - sends messages to Telegram chats.
 *
 * Configuration options:
 * - botToken: Telegram Bot API token (optional, falls back to workflow variable 'telegramBotToken')
 * - chatId: Target chat ID (optional, falls back to workflow variable 'chatId')
 * - text: Message text (supports expressions like ${message})
 * - parseMode: "HTML", "Markdown", or "MarkdownV2" (optional)
 * - replyToMessageId: Message ID to reply to (optional, falls back to workflow variable 'messageId')
 * - disableNotification: Send silently (optional, default: false)
 * - showTyping: Send "typing..." indicator before sending (optional, default: true)
 * - reaction: Emoji reaction to set on the incoming message (optional, e.g., "👍")
 * - reactionMessageId: Message ID to react to (optional, falls back to workflow variable 'messageId')
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class TelegramSendNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(TelegramSendNodeExecutor.class);
    private static final String TELEGRAM_API_BASE = "https://api.telegram.org/bot";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.TELEGRAM_SEND;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Telegram send node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Resolve bot token: config > workflow variable
        String botToken = stripQuotes(resolveValue(context, config, "botToken"));
        if (botToken == null || botToken.isEmpty()) {
            Object tokenVar = context.getVariable("telegramBotToken");
            if (tokenVar != null) {
                botToken = stripQuotes(tokenVar.toString());
            }
        }
        if (botToken == null || botToken.isEmpty()) {
            return NodeExecutionResult.failure("botToken is required (configure it or use a Telegram Bot trigger node)");
        }

        // Resolve chat ID: config > workflow variable
        String chatId = stripQuotes(resolveValue(context, config, "chatId"));
        if (chatId == null || chatId.isEmpty()) {
            Object chatIdVar = context.getVariable("chatId");
            if (chatIdVar != null) {
                chatId = stripQuotes(chatIdVar.toString());
            }
        }
        if (chatId == null || chatId.isEmpty()) {
            return NodeExecutionResult.failure("chatId is required");
        }

        // Set reaction on incoming message if configured
        if (config.has("reaction")) {
            String reaction = context.resolveExpression(config.get("reaction").asText());
            if (reaction != null && !reaction.isEmpty()) {
                String reactionMsgId = resolveValue(context, config, "reactionMessageId");
                if (reactionMsgId == null || reactionMsgId.isEmpty()) {
                    Object msgIdVar = context.getVariable("messageId");
                    if (msgIdVar != null) {
                        reactionMsgId = sanitizeNumeric(msgIdVar.toString());
                    }
                }
                if (reactionMsgId != null && !reactionMsgId.isEmpty()) {
                    setMessageReaction(botToken, chatId, reactionMsgId, reaction);
                }
            }
        }

        // Resolve text
        String text = resolveValue(context, config, "text");

        // Check if we have content from previous node output
        if ((text == null || text.isEmpty()) && context.getInput() != null) {
            JsonNode input = context.getInput();
            if (input.isTextual()) {
                text = input.asText();
            } else if (input.has("text")) {
                text = input.get("text").asText();
            } else if (input.has("result")) {
                text = input.get("result").asText();
            }
        }

        if (text == null || text.isEmpty()) {
            return NodeExecutionResult.failure("text is required for sending a message");
        }

        // Send typing indicator before sending the message
        boolean showTyping = !config.has("showTyping") || config.get("showTyping").asBoolean(true);
        if (showTyping) {
            sendChatAction(botToken, chatId, "typing");
        }

        // Build sendMessage payload
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("chat_id", chatId);
        payload.put("text", text);

        // Parse mode
        if (config.has("parseMode")) {
            String parseMode = config.get("parseMode").asText();
            if (!parseMode.isEmpty()) {
                payload.put("parse_mode", parseMode);
            }
        }

            // Reply to message
        String replyToId = resolveValue(context, config, "replyToMessageId");
        if (replyToId == null || replyToId.isEmpty()) {
            Object msgIdVar = context.getVariable("messageId");
            if (msgIdVar != null) {
                replyToId = sanitizeNumeric(msgIdVar.toString());
            }
        }
        if (replyToId != null && !replyToId.isEmpty()) {
            try {
                ObjectNode replyParams = objectMapper.createObjectNode();
                replyParams.put("message_id", Long.parseLong(replyToId));
                payload.set("reply_parameters", replyParams);
            } catch (NumberFormatException e) {
                LOG.warnf("Invalid replyToMessageId: %s, skipping reply", replyToId);
            }
        }

        // Disable notification
        if (config.has("disableNotification") && config.get("disableNotification").asBoolean()) {
            payload.put("disable_notification", true);
        }

        // Send the message
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            String url = TELEGRAM_API_BASE + botToken + "/sendMessage";
            HttpPost request = new HttpPost(url);
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(payload),
                ContentType.APPLICATION_JSON
            ));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);

            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            output.set("response", jsonResponse);
            output.put("success", jsonResponse.has("ok") && jsonResponse.get("ok").asBoolean());

            if (jsonResponse.has("result")) {
                JsonNode result = jsonResponse.get("result");
                if (result.has("message_id")) {
                    output.put("sentMessageId", result.get("message_id").asLong());
                }
            }

            if (jsonResponse.has("description")) {
                output.put("error", jsonResponse.get("description").asText());
            }

            // Store in variable if configured
            if (config.has("outputVariable")) {
                context.setVariable(config.get("outputVariable").asText(), output);
            }

            if (statusCode == 200 && output.get("success").asBoolean()) {
                LOG.infof("Telegram message sent to chat %s", chatId);
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure("Telegram API error (status " + statusCode + ")", true);
            } else {
                String error = output.has("error") ? output.get("error").asText() : "Unknown error";
                return NodeExecutionResult.failure("Telegram API error: " + error);
            }
        }
    }

    private void sendChatAction(String botToken, String chatId, String action) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = TELEGRAM_API_BASE + botToken + "/sendChatAction";
            ObjectNode body = objectMapper.createObjectNode();
            body.put("chat_id", chatId);
            body.put("action", action);

            HttpPost request = new HttpPost(url);
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(body),
                ContentType.APPLICATION_JSON
            ));
            client.execute(request);
        } catch (Exception e) {
            LOG.debugf(e, "Failed to send chat action");
        }
    }

    private void setMessageReaction(String botToken, String chatId, String messageId, String emoji) {
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String url = TELEGRAM_API_BASE + botToken + "/setMessageReaction";
            ObjectNode body = objectMapper.createObjectNode();
            body.put("chat_id", chatId);
            body.put("message_id", Long.parseLong(messageId));

            ArrayNode reactions = objectMapper.createArrayNode();
            ObjectNode reaction = objectMapper.createObjectNode();
            reaction.put("type", "emoji");
            reaction.put("emoji", emoji);
            reactions.add(reaction);
            body.set("reaction", reactions);

            HttpPost request = new HttpPost(url);
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(body),
                ContentType.APPLICATION_JSON
            ));
            var response = client.execute(request);
            String responseBody = EntityUtils.toString(response.getEntity());
            LOG.debugf("setMessageReaction response: %s", responseBody);
        } catch (Exception e) {
            LOG.debugf(e, "Failed to set message reaction");
        }
    }

    private String resolveValue(ExecutionContext context, JsonNode config, String key) {
        if (config.has(key)) {
            return context.resolveExpression(config.get(key).asText());
        }
        return null;
    }

    /**
     * Strip surrounding quotes from a value (handles ""value"" → value).
     */
    private String stripQuotes(String value) {
        if (value == null) return null;
        String cleaned = value.replaceAll("^\"+|\"+$", "").trim();
        return cleaned.isEmpty() ? null : cleaned;
    }

    /**
     * Strip surrounding quotes from a numeric value (handles ""25"" → 25).
     */
    private String sanitizeNumeric(String value) {
        return stripQuotes(value);
    }
}
