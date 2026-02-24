package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.document.DocumentLoader;
import com.nuraly.workflows.document.DocumentLoaderFactory;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.monitoring.RagMetricsService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * DOCUMENT_LOADER Node Executor - Loads and parses documents from various sources.
 *
 * Node Configuration:
 * {
 *   "sourceType": "url" | "base64" | "text",  // How the document is provided
 *   "urlField": "documentUrl",                 // Field containing URL (for sourceType=url)
 *   "contentField": "documentContent",         // Field containing content (for base64/text)
 *   "filenameField": "filename",               // Field containing filename for type detection
 *   "defaultType": "txt",                      // Default file type if not detected
 *   "timeout": 30000                           // HTTP timeout in ms (for URL fetch)
 * }
 *
 * Input (URL source):
 *   { "documentUrl": "https://example.com/doc.pdf", "filename": "doc.pdf" }
 *
 * Input (Base64 source):
 *   { "documentContent": "base64encodedcontent...", "filename": "doc.pdf" }
 *
 * Input (Text source):
 *   { "documentContent": "This is the document text...", "filename": "doc.txt" }
 *
 * Output:
 *   {
 *     "content": "Extracted text from document...",
 *     "sourceId": "doc.pdf",
 *     "sourceType": "pdf",
 *     "pageCount": 5,
 *     "characterCount": 12345,
 *     "metadata": { "title": "...", "author": "...", ... }
 *   }
 */
@ApplicationScoped
public class DocumentLoaderNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(DocumentLoaderNodeExecutor.class);
    private static final int DEFAULT_TIMEOUT_MS = 30000;

    @Inject
    DocumentLoaderFactory loaderFactory;

    @Inject
    RagMetricsService ragMetrics;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Override
    public NodeType getType() {
        return NodeType.DOCUMENT_LOADER;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("DOCUMENT_LOADER node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Check if this is test data (uploaded via "Test Workflow" button)
        // Test data is always base64 encoded, so override sourceType
        boolean isTestData = input.has("_isTestData") && input.get("_isTestData").asBoolean();

        // Determine source type (use _sourceType from input if test data)
        String sourceType;
        if (isTestData && input.has("_sourceType")) {
            sourceType = input.get("_sourceType").asText();
            LOG.debugf("Using test data sourceType: %s", sourceType);
        } else {
            sourceType = config.has("sourceType") ? config.get("sourceType").asText() : "text";
        }

        // Get filename for type detection
        String filenameField = config.has("filenameField") ? config.get("filenameField").asText() : "filename";
        String filename = input.has(filenameField) ? input.get(filenameField).asText() : null;

        // Default file type if not detected
        String defaultType = config.has("defaultType") ? config.get("defaultType").asText() : "txt";
        if (filename == null || filename.isEmpty()) {
            filename = "document." + defaultType;
        }

        // Get the appropriate loader
        DocumentLoader loader = loaderFactory.getLoader(filename);
        if (loader == null) {
            return NodeExecutionResult.failure("No document loader available for file: " + filename +
                    ". Supported extensions: " + String.join(", ", loaderFactory.getSupportedExtensions()));
        }

        // Extract additional metadata from input
        Map<String, Object> metadata = new HashMap<>();
        if (input.has("metadata") && input.get("metadata").isObject()) {
            input.get("metadata").fields().forEachRemaining(entry ->
                    metadata.put(entry.getKey(), entry.getValue().asText()));
        }

        // Pass through isolationKey if present
        String isolationKey = null;
        if (input.has("isolationKey")) {
            isolationKey = input.get("isolationKey").asText();
            metadata.put("isolationKey", isolationKey);
        } else if (config.has("isolationKey")) {
            isolationKey = config.get("isolationKey").asText();
            metadata.put("isolationKey", isolationKey);
        }

        DocumentLoader.LoadedDocument loadedDoc;
        long startTime = System.currentTimeMillis();

        try {
            switch (sourceType.toLowerCase()) {
                case "url" -> {
                    String urlField = config.has("urlField") ? config.get("urlField").asText() : "documentUrl";
                    if (!input.has(urlField)) {
                        return NodeExecutionResult.failure("URL field '" + urlField + "' not found in input");
                    }
                    String url = input.get(urlField).asText();
                    int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;
                    loadedDoc = loadFromUrl(url, filename, metadata, loader, timeout);
                }
                case "base64" -> {
                    String contentField = config.has("contentField") ? config.get("contentField").asText() : "documentContent";
                    // For test data, content is always in "content" field
                    if (isTestData && input.has("content")) {
                        contentField = "content";
                    }
                    if (!input.has(contentField)) {
                        // Try common field names
                        if (input.has("content")) {
                            contentField = "content";
                        } else {
                            return NodeExecutionResult.failure("Content field '" + contentField + "' not found in input");
                        }
                    }
                    String base64Content = input.get(contentField).asText();
                    byte[] bytes = Base64.getDecoder().decode(base64Content);
                    loadedDoc = loader.load(new ByteArrayInputStream(bytes), filename, metadata);
                }
                case "text" -> {
                    String contentField = config.has("contentField") ? config.get("contentField").asText() : "documentContent";
                    if (!input.has(contentField)) {
                        // Try common field names
                        if (input.has("content")) {
                            contentField = "content";
                        } else if (input.has("text")) {
                            contentField = "text";
                        } else {
                            return NodeExecutionResult.failure("Content field '" + contentField + "' not found in input");
                        }
                    }
                    String textContent = input.get(contentField).asText();
                    loadedDoc = loader.loadFromString(textContent, filename, metadata);
                }
                default -> {
                    return NodeExecutionResult.failure("Unknown sourceType: " + sourceType +
                            ". Valid options: url, base64, text");
                }
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            String docType = getFileExtension(filename);
            ragMetrics.recordDocumentLoaded(docType, 0, duration, false);
            LOG.errorf(e, "Failed to load document: %s", filename);
            return NodeExecutionResult.failure("Failed to load document: " + e.getMessage(), true);
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("content", loadedDoc.getContent());
        output.put("sourceId", loadedDoc.getSourceId());
        output.put("sourceType", loadedDoc.getSourceType());
        output.put("pageCount", loadedDoc.getPageCount());
        output.put("characterCount", loadedDoc.getCharacterCount());

        // Add metadata as JSON object
        ObjectNode metadataNode = objectMapper.createObjectNode();
        if (loadedDoc.getMetadata() != null) {
            loadedDoc.getMetadata().forEach((key, value) -> {
                if (value instanceof Number) {
                    metadataNode.put(key, ((Number) value).doubleValue());
                } else {
                    metadataNode.put(key, String.valueOf(value));
                }
            });
        }
        output.set("metadata", metadataNode);

        // Pass through isolation key
        if (isolationKey != null) {
            output.put("isolationKey", isolationKey);
        }

        // Record metrics
        long duration = System.currentTimeMillis() - startTime;
        ragMetrics.recordDocumentLoaded(loadedDoc.getSourceType(), loadedDoc.getCharacterCount(), duration, true);

        LOG.debugf("Loaded document '%s': %s, %d chars, %d pages",
                   filename, loadedDoc.getSourceType(),
                   loadedDoc.getCharacterCount(), loadedDoc.getPageCount());

        return NodeExecutionResult.success(output);
    }

    private DocumentLoader.LoadedDocument loadFromUrl(String url, String filename,
                                                       Map<String, Object> metadata,
                                                       DocumentLoader loader, int timeoutMs) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeoutMs))
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("HTTP request failed with status: " + response.statusCode());
        }

        metadata.put("sourceUrl", url);
        metadata.put("httpStatus", response.statusCode());

        return loader.load(new ByteArrayInputStream(response.body()), filename, metadata);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "unknown";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
