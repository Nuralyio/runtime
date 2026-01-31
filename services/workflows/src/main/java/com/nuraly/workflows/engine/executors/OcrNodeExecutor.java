package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.messaging.ServiceProducer;
import com.nuraly.workflows.messaging.ServiceRequestMessage;
import com.nuraly.workflows.messaging.ServiceResponseMessage;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * OCR Node Executor - Extracts text from images/documents via RabbitMQ.
 *
 * Sends requests to external OCR service via RabbitMQ for scaling.
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

    private static final Logger LOG = Logger.getLogger(OcrNodeExecutor.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    ServiceProducer serviceProducer;

    @Inject
    Configuration configuration;

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

        // Check imageBase64 config
        if (config.has("imageBase64")) {
            String base64Value = config.get("imageBase64").asText();
            if (base64Value != null && !base64Value.isEmpty() && !base64Value.equals("null")) {
                imageBase64 = context.resolveExpression(base64Value);
                if (imageBase64 == null || imageBase64.length() < 100) {
                    LOG.debug("imageBase64 config resolved to invalid value, trying imageField");
                    imageBase64 = null;
                }
            }
        }

        // Check imageField config if imageBase64 didn't work
        if (imageBase64 == null && config.has("imageField")) {
            String fieldExpression = config.get("imageField").asText();
            if (fieldExpression != null && !fieldExpression.isEmpty() && !fieldExpression.equals("null")) {
                imageBase64 = context.resolveExpression(fieldExpression);
            }
        }

        // Check imageUrl config as last resort
        if (imageBase64 == null && config.has("imageUrl")) {
            String urlValue = config.get("imageUrl").asText();
            if (urlValue != null && !urlValue.isEmpty() && !urlValue.equals("null")) {
                imageUrl = context.resolveExpression(urlValue);
            }
        }

        if ((imageBase64 == null || imageBase64.length() < 100) && imageUrl == null) {
            return NodeExecutionResult.failure("Either imageUrl, imageBase64, or imageField is required");
        }

        // Get language configuration
        String language = config.has("language") ? config.get("language").asText() : "fr";
        boolean detectLayout = config.has("detectLayout") && config.get("detectLayout").asBoolean();

        // Build request payload
        ObjectNode requestPayload = objectMapper.createObjectNode();
        if (imageBase64 != null) {
            // Remove data URL prefix if present
            if (imageBase64.contains(",")) {
                imageBase64 = imageBase64.substring(imageBase64.indexOf(",") + 1);
            }
            requestPayload.put("image_base64", imageBase64);
        } else {
            requestPayload.put("image_url", imageUrl);
        }
        requestPayload.put("language", language);
        requestPayload.put("detect_layout", detectLayout);

        // Create service request
        ServiceRequestMessage request = new ServiceRequestMessage("ocr", objectMapper.writeValueAsString(requestPayload));
        request.setWorkflowId(context.getWorkflowId());
        request.setExecutionId(context.getExecutionId());
        request.setUserId(context.getUserId());

        JsonNode input = context.getInput();
        if (input.has("isolationKey")) {
            request.setIsolationKey(input.get("isolationKey").asText());
        }

        LOG.infof("Sending OCR request via RabbitMQ: requestId=%s", request.getRequestId());

        // Send request and wait for response
        ServiceResponseMessage response = serviceProducer.sendRequest("ocr", request, configuration.serviceTimeout);

        if (!response.isSuccess()) {
            boolean retryable = response.getErrorMessage() != null &&
                    (response.getErrorMessage().contains("timeout") ||
                     response.getErrorMessage().contains("connection"));
            return NodeExecutionResult.failure("OCR service error: " + response.getErrorMessage(), retryable);
        }

        // Parse response payload
        JsonNode ocrResult = objectMapper.readTree(response.getPayload());

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

        // Store bounding boxes if available
        if (ocrResult.has("boxes")) {
            output.set("boxes", ocrResult.get("boxes"));
        }

        // Map output to variable
        String varName = config.has("outputVariable") && !config.get("outputVariable").asText().isEmpty()
                ? config.get("outputVariable").asText()
                : "ocrResult";
        context.setVariable(varName, output);

        // Support outputMapping for consistency
        if (config.has("outputMapping")) {
            JsonNode outputMapping = config.get("outputMapping");
            outputMapping.fields().forEachRemaining(entry -> {
                String variablePath = entry.getKey();
                if (variablePath.startsWith("$.variables.")) {
                    String mappedVarName = variablePath.substring(12);
                    context.setVariable(mappedVarName, output);
                }
            });
        }

        LOG.infof("OCR completed: requestId=%s, text length=%d",
                request.getRequestId(),
                output.has("text") ? output.get("text").asText().length() : 0);

        return NodeExecutionResult.success(output);
    }
}
