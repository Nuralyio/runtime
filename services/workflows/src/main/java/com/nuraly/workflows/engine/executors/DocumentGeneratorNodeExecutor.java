package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.http.HttpClientManager;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

import java.util.Iterator;
import java.util.Map;

/**
 * Document Generator Node Executor - Generates Word documents from templates.
 *
 * Calls the document-generator microservice (port 7008) to render .docx files
 * using poi-tl templates with dynamic data.
 *
 * Configuration options:
 * - templateId: UUID of the template (supports ${variables.x} expressions)
 * - data: Object with template field mappings (values support expressions)
 * - outputVariable: Variable name to store result (default: "documentResult")
 *
 * Output:
 * - success: boolean
 * - fileUrl: URL path to download the generated file
 * - fileName: Name of the generated file
 */
@ApplicationScoped
public class DocumentGeneratorNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(DocumentGeneratorNodeExecutor.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    HttpClientManager httpClientManager;

    @Inject
    Configuration configuration;

    @Override
    public NodeType getType() {
        return NodeType.DOCUMENT_GENERATOR;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Document Generator node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Resolve templateId
        String templateId = config.has("templateId") ? context.resolveExpression(config.get("templateId").asText()) : null;
        if (templateId == null || templateId.isBlank()) {
            return NodeExecutionResult.failure("templateId is required");
        }

        // Build data object with expression resolution
        ObjectNode resolvedData = objectMapper.createObjectNode();
        if (config.has("data") && config.get("data").isObject()) {
            resolveDataFields(config.get("data"), resolvedData, context);
        }

        // Build request payload
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("templateId", templateId);
        requestBody.set("data", resolvedData);
        if (config.has("applicationId")) {
            requestBody.put("applicationId", context.resolveExpression(config.get("applicationId").asText()));
        }

        // Call document-generator service
        String url = configuration.docgenServiceUrl + "/api/v1/documents/generate";
        LOG.infof("Generating document: templateId=%s, url=%s", templateId, url);

        try {
            var httpClient = httpClientManager.getClient();
            HttpPost request = new HttpPost(url);
            request.addHeader("Content-Type", "application/json");
            request.addHeader("Accept", "application/json");
            request.setEntity(new StringEntity(objectMapper.writeValueAsString(requestBody), ContentType.APPLICATION_JSON));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();

            if (statusCode >= 200 && statusCode < 300) {
                // The sync endpoint returns the file directly (binary)
                // Extract filename from Content-Disposition header
                String contentDisposition = response.getFirstHeader("Content-Disposition") != null
                        ? response.getFirstHeader("Content-Disposition").getValue() : "";
                String fileName = extractFileName(contentDisposition);

                output.put("success", true);
                output.put("statusCode", statusCode);
                output.put("fileName", fileName);
                output.put("fileUrl", "/api/v1/documents/files/" + fileName);
                output.put("templateId", templateId);

                // Store in variable
                String varName = config.has("outputVariable") && !config.get("outputVariable").asText().isEmpty()
                        ? config.get("outputVariable").asText()
                        : "documentResult";
                context.setVariable(varName, output);

                // Support outputMapping
                if (config.has("outputMapping")) {
                    config.get("outputMapping").fields().forEachRemaining(entry -> {
                        String variablePath = entry.getKey();
                        if (variablePath.startsWith("$.variables.")) {
                            String mappedVarName = variablePath.substring(12);
                            context.setVariable(mappedVarName, output);
                        }
                    });
                }

                LOG.infof("Document generated successfully: templateId=%s, fileName=%s", templateId, fileName);
                return NodeExecutionResult.success(output);
            } else if (statusCode == 404) {
                return NodeExecutionResult.failure("Template not found: " + templateId);
            } else if (statusCode >= 500) {
                return NodeExecutionResult.failure(
                        "Document generation failed with status " + statusCode + ": " + responseBody, true);
            } else {
                return NodeExecutionResult.failure(
                        "Document generation failed with status " + statusCode + ": " + responseBody);
            }

        } catch (Exception e) {
            boolean retryable = e.getMessage() != null &&
                    (e.getMessage().contains("timeout") ||
                     e.getMessage().contains("connection") ||
                     e.getMessage().contains("refused"));
            LOG.errorf("Document generation failed: %s", e.getMessage());
            return NodeExecutionResult.failure("Document generation failed: " + e.getMessage(), retryable);
        }
    }

    private void resolveDataFields(JsonNode source, ObjectNode target, ExecutionContext context) {
        Iterator<Map.Entry<String, JsonNode>> fields = source.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            JsonNode value = entry.getValue();

            if (value.isTextual()) {
                String resolved = context.resolveExpression(value.asText());
                // Try to parse as JSON (for arrays/objects passed as expressions)
                try {
                    JsonNode parsed = objectMapper.readTree(resolved);
                    if (parsed.isArray() || parsed.isObject()) {
                        target.set(entry.getKey(), parsed);
                        continue;
                    }
                } catch (Exception ignored) {}
                target.put(entry.getKey(), resolved);
            } else if (value.isObject()) {
                ObjectNode nested = objectMapper.createObjectNode();
                resolveDataFields(value, nested, context);
                target.set(entry.getKey(), nested);
            } else {
                target.set(entry.getKey(), value);
            }
        }
    }

    private String extractFileName(String contentDisposition) {
        if (contentDisposition != null && contentDisposition.contains("filename=")) {
            String fileName = contentDisposition.substring(contentDisposition.indexOf("filename=") + 9);
            return fileName.replace("\"", "").trim();
        }
        return "generated.docx";
    }
}
