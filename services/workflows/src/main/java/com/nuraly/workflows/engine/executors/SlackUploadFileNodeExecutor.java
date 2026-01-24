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
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Slack Upload File Node Executor
 *
 * Uploads a file to a Slack channel.
 *
 * Configuration options:
 * - botToken: Slack Bot OAuth token (required)
 * - channels: Comma-separated list of channel IDs to share the file to (required)
 * - content: File content as text (required if fileBase64 not provided)
 * - fileBase64: File content as base64-encoded string (required if content not provided)
 * - filename: Name of the file (required)
 * - filetype: File type identifier (optional, auto-detected if not provided)
 * - title: Title of the file (optional)
 * - initialComment: Initial comment to add with the file (optional)
 * - threadTs: Thread timestamp to upload to a thread (optional)
 * - outputVariable: Variable name to store the response (optional)
 */
@ApplicationScoped
public class SlackUploadFileNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(SlackUploadFileNodeExecutor.class);
    private static final String SLACK_API_URL = "https://slack.com/api/files.upload";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.SLACK_UPLOAD_FILE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Slack upload file node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String botToken = config.has("botToken")
            ? context.resolveExpression(config.get("botToken").asText())
            : null;

        if (botToken == null || botToken.isEmpty()) {
            return NodeExecutionResult.failure("botToken is required");
        }

        String channels = config.has("channels")
            ? context.resolveExpression(config.get("channels").asText())
            : null;

        if (channels == null || channels.isEmpty()) {
            return NodeExecutionResult.failure("channels is required");
        }

        String filename = config.has("filename")
            ? context.resolveExpression(config.get("filename").asText())
            : null;

        if (filename == null || filename.isEmpty()) {
            return NodeExecutionResult.failure("filename is required");
        }

        // Get file content - either as plain text or base64
        byte[] fileContent = null;
        if (config.has("content")) {
            String content = context.resolveExpression(config.get("content").asText());
            if (content != null && !content.isEmpty()) {
                fileContent = content.getBytes(StandardCharsets.UTF_8);
            }
        } else if (config.has("fileBase64")) {
            String base64Content = context.resolveExpression(config.get("fileBase64").asText());
            if (base64Content != null && !base64Content.isEmpty()) {
                try {
                    fileContent = Base64.getDecoder().decode(base64Content);
                } catch (IllegalArgumentException e) {
                    return NodeExecutionResult.failure("Invalid base64 content: " + e.getMessage());
                }
            }
        }

        if (fileContent == null || fileContent.length == 0) {
            return NodeExecutionResult.failure("content or fileBase64 is required");
        }

        // Build multipart request
        MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.addBinaryBody("file", fileContent, ContentType.APPLICATION_OCTET_STREAM, filename);
        builder.addTextBody("channels", channels);
        builder.addTextBody("filename", filename);

        // Optional fields
        if (config.has("filetype")) {
            String filetype = context.resolveExpression(config.get("filetype").asText());
            if (filetype != null && !filetype.isEmpty()) {
                builder.addTextBody("filetype", filetype);
            }
        }

        if (config.has("title")) {
            String title = context.resolveExpression(config.get("title").asText());
            if (title != null && !title.isEmpty()) {
                builder.addTextBody("title", title);
            }
        }

        if (config.has("initialComment")) {
            String initialComment = context.resolveExpression(config.get("initialComment").asText());
            if (initialComment != null && !initialComment.isEmpty()) {
                builder.addTextBody("initial_comment", initialComment);
            }
        }

        if (config.has("threadTs")) {
            String threadTs = context.resolveExpression(config.get("threadTs").asText());
            if (threadTs != null && !threadTs.isEmpty()) {
                builder.addTextBody("thread_ts", threadTs);
            }
        }

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(SLACK_API_URL);
            request.addHeader("Authorization", "Bearer " + botToken);
            request.setEntity(builder.build());

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);
            output.put("filename", filename);
            output.put("channels", channels);

            try {
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                output.set("response", jsonResponse);
                output.put("success", jsonResponse.has("ok") && jsonResponse.get("ok").asBoolean());

                if (jsonResponse.has("file")) {
                    JsonNode fileInfo = jsonResponse.get("file");
                    output.set("file", fileInfo);

                    // Extract commonly used fields for convenience
                    if (fileInfo.has("id")) {
                        output.put("fileId", fileInfo.get("id").asText());
                    }
                    if (fileInfo.has("name")) {
                        output.put("fileName", fileInfo.get("name").asText());
                    }
                    if (fileInfo.has("mimetype")) {
                        output.put("mimeType", fileInfo.get("mimetype").asText());
                    }
                    if (fileInfo.has("size")) {
                        output.put("fileSize", fileInfo.get("size").asLong());
                    }
                    if (fileInfo.has("url_private")) {
                        output.put("privateUrl", fileInfo.get("url_private").asText());
                    }
                    if (fileInfo.has("permalink")) {
                        output.put("permalink", fileInfo.get("permalink").asText());
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
                LOG.infof("Slack file '%s' uploaded successfully to channels: %s", filename, channels);
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
