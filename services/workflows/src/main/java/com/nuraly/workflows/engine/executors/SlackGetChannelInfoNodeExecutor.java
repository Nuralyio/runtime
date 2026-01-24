package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Slack Get Channel Info Node Executor
 *
 * Retrieves information about a Slack channel.
 *
 * Configuration options:
 * - botToken: Slack Bot OAuth token (required)
 * - channel: Channel ID to get info for (required)
 * - includeLocale: Include locale info in response (optional, default: false)
 * - includeNumMembers: Include member count (optional, default: false)
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class SlackGetChannelInfoNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(SlackGetChannelInfoNodeExecutor.class);
    private static final String SLACK_API_URL = "https://slack.com/api/conversations.info";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.SLACK_GET_CHANNEL_INFO;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Slack get channel info node configuration is missing");
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

        // Build URL with query parameters
        StringBuilder urlBuilder = new StringBuilder(SLACK_API_URL);
        urlBuilder.append("?channel=").append(URLEncoder.encode(channel, StandardCharsets.UTF_8));

        if (config.has("includeLocale") && config.get("includeLocale").asBoolean()) {
            urlBuilder.append("&include_locale=true");
        }

        if (config.has("includeNumMembers") && config.get("includeNumMembers").asBoolean()) {
            urlBuilder.append("&include_num_members=true");
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(urlBuilder.toString());
            request.addHeader("Authorization", "Bearer " + botToken);

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);

            try {
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                output.set("response", jsonResponse);
                output.put("success", jsonResponse.has("ok") && jsonResponse.get("ok").asBoolean());

                if (jsonResponse.has("channel")) {
                    JsonNode channelInfo = jsonResponse.get("channel");
                    output.set("channel", channelInfo);

                    // Extract commonly used fields for convenience
                    if (channelInfo.has("id")) {
                        output.put("channelId", channelInfo.get("id").asText());
                    }
                    if (channelInfo.has("name")) {
                        output.put("channelName", channelInfo.get("name").asText());
                    }
                    if (channelInfo.has("is_private")) {
                        output.put("isPrivate", channelInfo.get("is_private").asBoolean());
                    }
                    if (channelInfo.has("is_archived")) {
                        output.put("isArchived", channelInfo.get("is_archived").asBoolean());
                    }
                    if (channelInfo.has("num_members")) {
                        output.put("numMembers", channelInfo.get("num_members").asInt());
                    }
                    if (channelInfo.has("topic") && channelInfo.get("topic").has("value")) {
                        output.put("topic", channelInfo.get("topic").get("value").asText());
                    }
                    if (channelInfo.has("purpose") && channelInfo.get("purpose").has("value")) {
                        output.put("purpose", channelInfo.get("purpose").get("value").asText());
                    }
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
                LOG.infof("Slack channel info retrieved successfully for channel: %s", channel);
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
