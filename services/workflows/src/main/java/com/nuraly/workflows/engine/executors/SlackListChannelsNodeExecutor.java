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
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Slack List Channels Node Executor
 *
 * Lists available Slack channels in the workspace.
 *
 * Configuration options:
 * - botToken: Slack Bot OAuth token (required)
 * - types: Comma-separated channel types: public_channel, private_channel, mpim, im (optional, default: public_channel)
 * - excludeArchived: Exclude archived channels (optional, default: true)
 * - limit: Maximum number of channels to return per page (optional, default: 100, max: 1000)
 * - cursor: Pagination cursor for fetching next page (optional)
 * - teamId: Team ID for org-wide app (optional)
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class SlackListChannelsNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(SlackListChannelsNodeExecutor.class);
    private static final String SLACK_API_URL = "https://slack.com/api/conversations.list";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.SLACK_LIST_CHANNELS;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Slack list channels node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String botToken = config.has("botToken")
            ? context.resolveExpression(config.get("botToken").asText())
            : null;

        if (botToken == null || botToken.isEmpty()) {
            return NodeExecutionResult.failure("botToken is required");
        }

        // Build URL with query parameters
        StringBuilder urlBuilder = new StringBuilder(SLACK_API_URL);
        List<String> params = new ArrayList<>();

        // Channel types
        String types = config.has("types")
            ? context.resolveExpression(config.get("types").asText())
            : "public_channel";
        params.add("types=" + URLEncoder.encode(types, StandardCharsets.UTF_8));

        // Exclude archived
        boolean excludeArchived = !config.has("excludeArchived") || config.get("excludeArchived").asBoolean(true);
        params.add("exclude_archived=" + excludeArchived);

        // Limit
        int limit = config.has("limit") ? config.get("limit").asInt(100) : 100;
        limit = Math.min(limit, 1000); // Max 1000
        params.add("limit=" + limit);

        // Pagination cursor
        if (config.has("cursor")) {
            String cursor = context.resolveExpression(config.get("cursor").asText());
            if (cursor != null && !cursor.isEmpty()) {
                params.add("cursor=" + URLEncoder.encode(cursor, StandardCharsets.UTF_8));
            }
        }

        // Team ID for org-wide apps
        if (config.has("teamId")) {
            String teamId = context.resolveExpression(config.get("teamId").asText());
            if (teamId != null && !teamId.isEmpty()) {
                params.add("team_id=" + URLEncoder.encode(teamId, StandardCharsets.UTF_8));
            }
        }

        urlBuilder.append("?").append(String.join("&", params));

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

                if (jsonResponse.has("channels")) {
                    JsonNode channels = jsonResponse.get("channels");
                    output.set("channels", channels);
                    output.put("channelCount", channels.size());

                    // Create a simplified list of channels for convenience
                    ArrayNode simplifiedChannels = objectMapper.createArrayNode();
                    for (JsonNode channel : channels) {
                        ObjectNode simplified = objectMapper.createObjectNode();
                        if (channel.has("id")) {
                            simplified.put("id", channel.get("id").asText());
                        }
                        if (channel.has("name")) {
                            simplified.put("name", channel.get("name").asText());
                        }
                        if (channel.has("is_private")) {
                            simplified.put("isPrivate", channel.get("is_private").asBoolean());
                        }
                        if (channel.has("is_archived")) {
                            simplified.put("isArchived", channel.get("is_archived").asBoolean());
                        }
                        if (channel.has("num_members")) {
                            simplified.put("numMembers", channel.get("num_members").asInt());
                        }
                        simplifiedChannels.add(simplified);
                    }
                    output.set("simplifiedChannels", simplifiedChannels);
                }

                // Pagination info
                if (jsonResponse.has("response_metadata")) {
                    JsonNode metadata = jsonResponse.get("response_metadata");
                    if (metadata.has("next_cursor") && !metadata.get("next_cursor").asText().isEmpty()) {
                        output.put("nextCursor", metadata.get("next_cursor").asText());
                        output.put("hasMore", true);
                    } else {
                        output.put("hasMore", false);
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
                LOG.infof("Slack channels listed successfully, count: %d", output.get("channelCount").asInt(0));
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
