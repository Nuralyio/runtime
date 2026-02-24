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
 * Slack Send Message Node Executor
 *
 * Sends messages to Slack channels or users via webhook or API.
 *
 * Configuration options:
 * - method: "webhook" or "api" (default: "api")
 * - webhookUrl: Slack incoming webhook URL (required if method is "webhook")
 * - botToken: Slack Bot OAuth token (required if method is "api")
 * - channel: Channel ID or name to send message to (required for api method)
 * - text: Plain text message content
 * - blocks: Slack Block Kit blocks for rich formatting (optional)
 * - threadTs: Thread timestamp to reply to (optional)
 * - unfurlLinks: Whether to unfurl links (optional, default: true)
 * - unfurlMedia: Whether to unfurl media (optional, default: true)
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class SlackSendMessageNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(SlackSendMessageNodeExecutor.class);
    private static final String SLACK_API_URL = "https://slack.com/api/chat.postMessage";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.SLACK_SEND_MESSAGE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Slack send message node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        String method = config.has("method") ? config.get("method").asText() : "api";

        if ("webhook".equalsIgnoreCase(method)) {
            return executeWebhook(context, config);
        } else {
            return executeApi(context, config);
        }
    }

    private NodeExecutionResult executeWebhook(ExecutionContext context, JsonNode config) throws Exception {
        String webhookUrl = config.has("webhookUrl")
            ? context.resolveExpression(config.get("webhookUrl").asText())
            : null;

        if (webhookUrl == null || webhookUrl.isEmpty()) {
            return NodeExecutionResult.failure("webhookUrl is required for webhook method");
        }

        String text = config.has("text")
            ? context.resolveExpression(config.get("text").asText())
            : null;

        if (text == null || text.isEmpty()) {
            return NodeExecutionResult.failure("text is required for sending a message");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("text", text);

        // Add blocks if provided
        if (config.has("blocks")) {
            payload.set("blocks", resolveBlocks(context, config.get("blocks")));
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(webhookUrl);
            request.setEntity(new StringEntity(objectMapper.writeValueAsString(payload), ContentType.APPLICATION_JSON));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);
            output.put("response", responseBody);
            output.put("success", statusCode == 200 && "ok".equals(responseBody));

            storeOutputVariable(context, config, output);

            if (statusCode == 200) {
                LOG.infof("Slack webhook message sent successfully");
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure("Slack webhook request failed with status " + statusCode, true);
            } else {
                return NodeExecutionResult.failure("Slack webhook request failed: " + responseBody);
            }
        }
    }

    private NodeExecutionResult executeApi(ExecutionContext context, JsonNode config) throws Exception {
        String botToken = config.has("botToken")
            ? context.resolveExpression(config.get("botToken").asText())
            : null;

        if (botToken == null || botToken.isEmpty()) {
            return NodeExecutionResult.failure("botToken is required for API method");
        }

        String channel = config.has("channel")
            ? context.resolveExpression(config.get("channel").asText())
            : null;

        if (channel == null || channel.isEmpty()) {
            return NodeExecutionResult.failure("channel is required for API method");
        }

        String text = config.has("text")
            ? context.resolveExpression(config.get("text").asText())
            : null;

        // Either text or blocks must be provided
        boolean hasBlocks = config.has("blocks") && !config.get("blocks").isEmpty();
        if ((text == null || text.isEmpty()) && !hasBlocks) {
            return NodeExecutionResult.failure("text or blocks is required for sending a message");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("channel", channel);

        if (text != null && !text.isEmpty()) {
            payload.put("text", text);
        }

        // Add blocks if provided
        if (hasBlocks) {
            payload.set("blocks", resolveBlocks(context, config.get("blocks")));
        }

        // Optional: thread reply
        if (config.has("threadTs")) {
            String threadTs = context.resolveExpression(config.get("threadTs").asText());
            if (threadTs != null && !threadTs.isEmpty()) {
                payload.put("thread_ts", threadTs);
            }
        }

        // Unfurl options
        if (config.has("unfurlLinks")) {
            payload.put("unfurl_links", config.get("unfurlLinks").asBoolean(true));
        }
        if (config.has("unfurlMedia")) {
            payload.put("unfurl_media", config.get("unfurlMedia").asBoolean(true));
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(SLACK_API_URL);
            request.addHeader("Authorization", "Bearer " + botToken);
            request.addHeader("Content-Type", "application/json");
            request.setEntity(new StringEntity(objectMapper.writeValueAsString(payload), ContentType.APPLICATION_JSON));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);

            try {
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                output.set("response", jsonResponse);
                output.put("success", jsonResponse.has("ok") && jsonResponse.get("ok").asBoolean());

                if (jsonResponse.has("ts")) {
                    output.put("messageTs", jsonResponse.get("ts").asText());
                }
                if (jsonResponse.has("channel")) {
                    output.put("channelId", jsonResponse.get("channel").asText());
                }
                if (jsonResponse.has("error")) {
                    output.put("error", jsonResponse.get("error").asText());
                }
            } catch (Exception e) {
                output.put("response", responseBody);
                output.put("success", false);
            }

            storeOutputVariable(context, config, output);

            if (statusCode == 200 && output.get("success").asBoolean()) {
                LOG.infof("Slack API message sent successfully to channel: %s", channel);
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure("Slack API request failed with status " + statusCode, true);
            } else {
                String error = output.has("error") ? output.get("error").asText() : "Unknown error";
                return NodeExecutionResult.failure("Slack API request failed: " + error);
            }
        }
    }

    private JsonNode resolveBlocks(ExecutionContext context, JsonNode blocks) {
        if (blocks.isArray()) {
            ArrayNode resolvedBlocks = objectMapper.createArrayNode();
            for (JsonNode block : blocks) {
                resolvedBlocks.add(resolveBlockNode(context, block));
            }
            return resolvedBlocks;
        }
        return blocks;
    }

    private JsonNode resolveBlockNode(ExecutionContext context, JsonNode node) {
        if (node.isTextual()) {
            return objectMapper.valueToTree(context.resolveExpression(node.asText()));
        } else if (node.isObject()) {
            ObjectNode resolved = objectMapper.createObjectNode();
            node.fields().forEachRemaining(entry -> {
                resolved.set(entry.getKey(), resolveBlockNode(context, entry.getValue()));
            });
            return resolved;
        } else if (node.isArray()) {
            ArrayNode resolved = objectMapper.createArrayNode();
            for (JsonNode item : node) {
                resolved.add(resolveBlockNode(context, item));
            }
            return resolved;
        }
        return node;
    }

    private void storeOutputVariable(ExecutionContext context, JsonNode config, ObjectNode output) {
        if (config.has("outputVariable")) {
            String varName = config.get("outputVariable").asText();
            context.setVariable(varName, output);
        }
    }
}
