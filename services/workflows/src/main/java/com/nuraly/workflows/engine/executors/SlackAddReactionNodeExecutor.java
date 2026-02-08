package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Slack Add Reaction Node Executor
 *
 * Adds a reaction emoji to a Slack message.
 *
 * Configuration options:
 * - botToken: Slack Bot OAuth token (required)
 * - channel: Channel containing the message (required)
 * - timestamp: Timestamp of the message to react to (required)
 * - name: Reaction emoji name without colons, e.g., "thumbsup" (required)
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class SlackAddReactionNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(SlackAddReactionNodeExecutor.class);
    private static final String SLACK_API_URL = "https://slack.com/api/reactions.add";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.SLACK_ADD_REACTION;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Slack add reaction node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String botToken = config.has("botToken")
            ? context.resolveExpression(config.get("botToken").asText())
            : null;

        if (botToken == null || botToken.isEmpty()) {
            return NodeExecutionResult.failure("botToken is required");
        }

        String channel = config.has("channel")
            ? context.resolveExpression(config.get("channel").asText())
            : null;

        if (channel == null || channel.isEmpty()) {
            return NodeExecutionResult.failure("channel is required");
        }

        String timestamp = config.has("timestamp")
            ? context.resolveExpression(config.get("timestamp").asText())
            : null;

        if (timestamp == null || timestamp.isEmpty()) {
            return NodeExecutionResult.failure("timestamp is required");
        }

        String name = config.has("name")
            ? context.resolveExpression(config.get("name").asText())
            : null;

        if (name == null || name.isEmpty()) {
            return NodeExecutionResult.failure("name (reaction emoji) is required");
        }

        // Remove colons if present (users might pass :thumbsup: instead of thumbsup)
        name = name.replace(":", "");

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("channel", channel);
        payload.put("timestamp", timestamp);
        payload.put("name", name);

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
            output.put("channel", channel);
            output.put("timestamp", timestamp);
            output.put("reaction", name);

            try {
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                output.set("response", jsonResponse);
                output.put("success", jsonResponse.has("ok") && jsonResponse.get("ok").asBoolean());

                if (jsonResponse.has("error")) {
                    output.put("error", jsonResponse.get("error").asText());

                    // Handle "already_reacted" as a soft success (idempotent operation)
                    if ("already_reacted".equals(jsonResponse.get("error").asText())) {
                        output.put("success", true);
                        output.put("alreadyReacted", true);
                    }
                }
            } catch (Exception e) {
                output.put("response", responseBody);
                output.put("success", false);
            }

            storeOutputVariable(context, config, output);

            if (statusCode == 200 && output.get("success").asBoolean()) {
                LOG.infof("Slack reaction '%s' added successfully to message in channel: %s", name, channel);
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure("Slack API request failed with status " + statusCode, true);
            } else {
                String error = output.has("error") ? output.get("error").asText() : "Unknown error";
                return NodeExecutionResult.failure("Slack API request failed: " + error);
            }
        }
    }

    private void storeOutputVariable(ExecutionContext context, JsonNode config, ObjectNode output) {
        if (config.has("outputVariable")) {
            String varName = config.get("outputVariable").asText();
            context.setVariable(varName, output);
        }
    }
}
