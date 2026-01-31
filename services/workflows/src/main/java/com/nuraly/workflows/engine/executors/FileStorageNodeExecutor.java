package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.storage.StorageConfig;
import com.nuraly.workflows.storage.StorageProvider;
import com.nuraly.workflows.storage.StorageProviderFactory;
import com.nuraly.workflows.storage.StorageResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.tika.Tika;
import org.jboss.logging.Logger;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * FILE_STORAGE Node Executor - Stores files to S3, MinIO, or local filesystem.
 *
 * Node Configuration:
 * {
 *   "provider": "s3" | "minio" | "local",     // Storage provider
 *   "storageConfigPath": "storage/my-s3",     // KV store path for S3/MinIO credentials
 *   "bucket": "my-documents",                  // Bucket name (can be overridden from KV)
 *   "path": "uploads/",                        // Optional path prefix
 *   "fileField": "file",                       // Field containing base64 file content
 *   "filenameField": "filename",               // Field containing filename
 *   "contentTypeField": "contentType",         // Field containing content type (optional)
 *   "metadataFields": ["userId", "category"]   // Fields to include as metadata
 * }
 *
 * KV Store entry (storageConfigPath) format:
 * {
 *   "endpoint": "https://s3.amazonaws.com",    // S3/MinIO endpoint
 *   "region": "us-east-1",                     // AWS region
 *   "accessKey": "AKIAIOSFODNN7EXAMPLE",       // Access key
 *   "secretKey": "wJalrXUtnFEMI/K7MDENG/...",  // Secret key
 *   "bucket": "default-bucket",                // Default bucket (optional)
 *   "pathStyleAccess": false                   // Use path-style access (for MinIO)
 * }
 *
 * Input:
 *   {
 *     "file": "base64_encoded_content...",
 *     "filename": "document.pdf",
 *     "contentType": "application/pdf",        // Optional - auto-detected if missing
 *     "userId": "user123",                     // Optional metadata
 *     "category": "reports"                    // Optional metadata
 *   }
 *
 * Output:
 *   {
 *     "url": "https://bucket.s3.amazonaws.com/uploads/abc123-document.pdf",
 *     "key": "uploads/abc123-document.pdf",
 *     "filename": "document.pdf",
 *     "contentType": "application/pdf",
 *     "size": 1024000,
 *     "provider": "s3",
 *     "bucket": "my-documents",
 *     "metadata": { "userId": "user123", "category": "reports" }
 *   }
 */
@ApplicationScoped
public class FileStorageNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(FileStorageNodeExecutor.class);

    @Inject
    StorageProviderFactory storageProviderFactory;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Tika tika = new Tika();

    @Override
    public NodeType getType() {
        return NodeType.FILE_STORAGE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("FILE_STORAGE node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Get provider type
        String providerName = config.has("provider") ? config.get("provider").asText() : "local";

        // For S3/MinIO, fetch credentials from KV store
        StorageConfig storageConfig = null;
        if ("s3".equalsIgnoreCase(providerName) || "minio".equalsIgnoreCase(providerName)) {
            String storageConfigPath = config.has("storageConfigPath") ? config.get("storageConfigPath").asText() : null;
            if (storageConfigPath == null || storageConfigPath.isEmpty()) {
                return NodeExecutionResult.failure("storageConfigPath is required for S3/MinIO provider. " +
                        "Configure your storage credentials in the KV store.");
            }

            storageConfig = fetchStorageConfig(storageConfigPath, context);
            if (storageConfig == null) {
                return NodeExecutionResult.failure("Failed to retrieve storage configuration from KV store: " + storageConfigPath);
            }
        }

        // Get bucket - from node config, then from KV config, then default
        String bucket = "default";
        if (config.has("bucket") && !config.get("bucket").asText().isEmpty()) {
            bucket = config.get("bucket").asText();
        } else if (storageConfig != null && storageConfig.getBucket() != null) {
            bucket = storageConfig.getBucket();
        }

        String path = config.has("path") ? config.get("path").asText() : "";

        // Get field names from config
        String fileField = config.has("fileField") ? config.get("fileField").asText() : "file";
        String filenameField = config.has("filenameField") ? config.get("filenameField").asText() : "filename";
        String contentTypeField = config.has("contentTypeField") ? config.get("contentTypeField").asText() : "contentType";

        // Extract file content
        if (!input.has(fileField)) {
            return NodeExecutionResult.failure("File field '" + fileField + "' not found in input");
        }

        String base64Content = input.get(fileField).asText();
        byte[] fileBytes;
        try {
            fileBytes = Base64.getDecoder().decode(base64Content);
        } catch (IllegalArgumentException e) {
            return NodeExecutionResult.failure("Invalid base64 content in field '" + fileField + "'");
        }

        // Extract filename
        String filename = "file";
        if (input.has(filenameField)) {
            filename = input.get(filenameField).asText();
        } else if (input.has("name")) {
            filename = input.get("name").asText();
        }

        // Detect or extract content type
        String contentType;
        if (input.has(contentTypeField) && !input.get(contentTypeField).asText().isEmpty()) {
            contentType = input.get(contentTypeField).asText();
        } else {
            contentType = detectContentType(fileBytes, filename);
        }

        // Extract metadata from specified fields
        Map<String, String> metadata = new HashMap<>();
        if (config.has("metadataFields") && config.get("metadataFields").isArray()) {
            for (JsonNode fieldNode : config.get("metadataFields")) {
                String field = fieldNode.asText();
                if (input.has(field)) {
                    metadata.put(field, input.get(field).asText());
                }
            }
        }

        // Add isolationKey to metadata if present
        if (input.has("isolationKey")) {
            metadata.put("isolationKey", input.get("isolationKey").asText());
        }

        // Get the storage provider and store the file
        StorageResult result;
        try {
            if (storageConfig != null) {
                // Use dynamic S3/MinIO config from KV
                result = storageProviderFactory.storeWithConfig(
                        storageConfig, fileBytes, filename, contentType, bucket, path, metadata);
            } else {
                // Use default local storage
                StorageProvider provider = storageProviderFactory.getProvider(providerName);
                result = provider.store(fileBytes, filename, contentType, bucket, path, metadata);
            }
        } catch (Exception e) {
            LOG.errorf(e, "Failed to store file '%s' to %s", filename, providerName);
            return NodeExecutionResult.failure("Failed to store file: " + e.getMessage(), true);
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("url", result.getUrl());
        output.put("key", result.getKey());
        output.put("filename", result.getFilename());
        output.put("contentType", result.getContentType());
        output.put("size", result.getSize());
        output.put("provider", result.getProvider());
        output.put("bucket", result.getBucket());
        output.put("uploadedAt", result.getUploadedAt().toString());

        // Add metadata
        ObjectNode metadataNode = objectMapper.createObjectNode();
        result.getMetadata().forEach(metadataNode::put);
        output.set("metadata", metadataNode);

        // Pass through isolationKey
        if (input.has("isolationKey")) {
            output.put("isolationKey", input.get("isolationKey").asText());
        }

        LOG.infof("Stored file '%s' to %s: %s (%d bytes)",
                filename, result.getProvider(), result.getUrl(), result.getSize());

        return NodeExecutionResult.success(output);
    }

    /**
     * Fetch storage configuration from KV store.
     */
    private StorageConfig fetchStorageConfig(String keyPath, ExecutionContext context) {
        try {
            String appId = context.getWorkflowId();
            if (appId == null) {
                appId = "default";
            }

            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    java.net.URLEncoder.encode(keyPath, "UTF-8") +
                    "?applicationId=" + appId;

            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(kvServiceUrl);
                request.addHeader("Content-Type", "application/json");

                var response = httpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode >= 200 && statusCode < 300) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    JsonNode kvEntry = objectMapper.readTree(responseBody);

                    if (kvEntry.has("value")) {
                        String valueStr = kvEntry.get("value").asText();
                        // The value might be a JSON string or already an object
                        JsonNode configJson;
                        if (valueStr.startsWith("{")) {
                            configJson = objectMapper.readTree(valueStr);
                        } else {
                            configJson = kvEntry.get("value");
                        }

                        return StorageConfig.builder()
                                .endpoint(getJsonString(configJson, "endpoint"))
                                .region(getJsonString(configJson, "region", "us-east-1"))
                                .accessKey(getJsonString(configJson, "accessKey"))
                                .secretKey(getJsonString(configJson, "secretKey"))
                                .bucket(getJsonString(configJson, "bucket"))
                                .pathStyleAccess(getJsonBoolean(configJson, "pathStyleAccess", false))
                                .build();
                    }
                } else {
                    LOG.warnf("KV store returned status %d for path: %s", statusCode, keyPath);
                }
            }

            return null;
        } catch (Exception e) {
            LOG.warnf("Failed to fetch storage config from KV store (%s): %s", keyPath, e.getMessage());
            return null;
        }
    }

    private String getJsonString(JsonNode node, String field) {
        return getJsonString(node, field, null);
    }

    private String getJsonString(JsonNode node, String field, String defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return defaultValue;
    }

    private boolean getJsonBoolean(JsonNode node, String field, boolean defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asBoolean();
        }
        return defaultValue;
    }

    private String detectContentType(byte[] data, String filename) {
        try {
            String detected = tika.detect(data);
            if (detected != null && !detected.equals("application/octet-stream")) {
                return detected;
            }
        } catch (Exception e) {
            LOG.debugf("Failed to detect content type from bytes: %s", e.getMessage());
        }

        try {
            String detected = tika.detect(filename);
            if (detected != null) {
                return detected;
            }
        } catch (Exception e) {
            LOG.debugf("Failed to detect content type from filename: %s", e.getMessage());
        }

        return "application/octet-stream";
    }
}
