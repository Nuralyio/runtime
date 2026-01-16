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
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Base64;
import java.util.Optional;

/**
 * OCR Node Executor - Extracts text from images/documents using PaddleOCR
 *
 * Configuration options:
 * - imageUrl: URL of the image to process (supports ${variables.x} expressions)
 * - imageBase64: Base64 encoded image data (alternative to imageUrl)
 * - imageField: Field name from input containing base64 image (e.g., "${input.image}")
 * - language: OCR language(s) - "fr", "en", "ar", "ch" etc. (default: "fr")
 * - detectLayout: Whether to detect document layout (default: false)
 * - outputVariable: Variable name to store result (optional)
 *
 * Output:
 * - text: Full extracted text
 * - lines: Array of detected text lines with confidence scores
 * - language: Language used for OCR
 */
@ApplicationScoped
public class OcrNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ConfigProperty(name = "ocr.service.url", defaultValue = "http://ocr:8000")
    Optional<String> ocrServiceUrlConfig;

    private String getOcrServiceUrl() {
        return ocrServiceUrlConfig.orElse(
            System.getenv("OCR_SERVICE_URL") != null ? System.getenv("OCR_SERVICE_URL") : "http://ocr:8000"
        );
    }

    @Override
    public NodeType getType() {
        return NodeType.OCR;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("OCR node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get image data - either from URL, base64, or input field
        String imageBase64 = null;
        String imageUrl = null;

        if (config.has("imageBase64")) {
            imageBase64 = context.resolveExpression(config.get("imageBase64").asText());
        } else if (config.has("imageField")) {
            String fieldExpression = config.get("imageField").asText();
            imageBase64 = context.resolveExpression(fieldExpression);
        } else if (config.has("imageUrl")) {
            imageUrl = context.resolveExpression(config.get("imageUrl").asText());
        }

        if (imageBase64 == null && imageUrl == null) {
            return NodeExecutionResult.failure("Either imageUrl, imageBase64, or imageField is required");
        }

        // Get language configuration
        String language = config.has("language") ? config.get("language").asText() : "fr";
        boolean detectLayout = config.has("detectLayout") && config.get("detectLayout").asBoolean();

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Build request to OCR service
            ObjectNode requestBody = objectMapper.createObjectNode();

            if (imageBase64 != null) {
                // Remove data URL prefix if present
                if (imageBase64.contains(",")) {
                    imageBase64 = imageBase64.substring(imageBase64.indexOf(",") + 1);
                }
                requestBody.put("image_base64", imageBase64);
            } else {
                requestBody.put("image_url", imageUrl);
            }

            requestBody.put("language", language);
            requestBody.put("detect_layout", detectLayout);

            HttpPost request = new HttpPost(getOcrServiceUrl() + "/ocr");
            request.setHeader("Content-Type", "application/json");
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(requestBody),
                ContentType.APPLICATION_JSON
            ));

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            if (statusCode >= 200 && statusCode < 300) {
                JsonNode ocrResult = objectMapper.readTree(responseBody);

                ObjectNode output = objectMapper.createObjectNode();

                // Extract full text
                if (ocrResult.has("text")) {
                    output.put("text", ocrResult.get("text").asText());
                }

                // Extract lines with confidence
                if (ocrResult.has("lines")) {
                    output.set("lines", ocrResult.get("lines"));
                }

                // Add metadata
                output.put("language", language);
                output.put("success", true);

                // Store bounding boxes if available (for invoice field extraction)
                if (ocrResult.has("boxes")) {
                    output.set("boxes", ocrResult.get("boxes"));
                }

                // Map output to variable if specified
                if (config.has("outputVariable")) {
                    String varName = config.get("outputVariable").asText();
                    context.setVariable(varName, output);
                }

                // Also support outputMapping for consistency with other nodes
                if (config.has("outputMapping")) {
                    JsonNode outputMapping = config.get("outputMapping");
                    outputMapping.fields().forEachRemaining(entry -> {
                        String variablePath = entry.getKey();
                        if (variablePath.startsWith("$.variables.")) {
                            String varName = variablePath.substring(12);
                            context.setVariable(varName, output);
                        }
                    });
                }

                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                // Server error - retryable
                return NodeExecutionResult.failure("OCR service error: " + responseBody, true);
            } else {
                // Client error - not retryable
                return NodeExecutionResult.failure("OCR request failed: " + responseBody);
            }
        } catch (Exception e) {
            // Network errors are retryable
            return NodeExecutionResult.failure("OCR service connection failed: " + e.getMessage(), true);
        }
    }
}
