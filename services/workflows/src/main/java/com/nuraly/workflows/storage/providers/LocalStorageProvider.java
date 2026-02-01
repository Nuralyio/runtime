package com.nuraly.workflows.storage.providers;

import com.nuraly.workflows.storage.StorageProvider;
import com.nuraly.workflows.storage.StorageResult;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Local filesystem storage provider. Good for development and testing.
 */
@ApplicationScoped
public class LocalStorageProvider implements StorageProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageProvider.class);

    @ConfigProperty(name = "nuraly.storage.local.base-path", defaultValue = "/tmp/nuraly/uploads")
    String basePath;

    @ConfigProperty(name = "nuraly.storage.local.serve-url", defaultValue = "http://localhost:8080/files")
    String serveUrl;

    @Override
    public String getName() {
        return "local";
    }

    @Override
    public StorageResult store(byte[] data, String filename, String contentType,
                               String bucket, String path, Map<String, String> metadata) {
        try {
            Path fullPath = buildPath(bucket, path, filename);

            // Ensure parent directories exist
            Files.createDirectories(fullPath.getParent());

            // Write file
            Files.write(fullPath, data, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            String key = buildKey(bucket, path, filename, fullPath);
            String url = buildUrl(key);

            log.info("Stored file locally: path={}, size={}", fullPath, data.length);

            return StorageResult.builder()
                    .url(url)
                    .key(key)
                    .filename(filename)
                    .contentType(contentType)
                    .size(data.length)
                    .provider(getName())
                    .bucket(bucket)
                    .uploadedAt(Instant.now())
                    .metadata(metadata != null ? metadata : Map.of())
                    .build();

        } catch (IOException e) {
            log.error("Failed to store file locally: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store file locally: " + e.getMessage(), e);
        }
    }

    @Override
    public StorageResult store(InputStream inputStream, String filename, String contentType,
                               String bucket, String path, Map<String, String> metadata) {
        try {
            byte[] data = inputStream.readAllBytes();
            return store(data, filename, contentType, bucket, path, metadata);
        } catch (IOException e) {
            log.error("Failed to read input stream: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to read input stream: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean delete(String bucket, String key) {
        try {
            Path filePath = Path.of(basePath, key);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted file: {}", filePath);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Failed to delete file: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean exists(String bucket, String key) {
        Path filePath = Path.of(basePath, key);
        return Files.exists(filePath);
    }

    @Override
    public String getPresignedUrl(String bucket, String key, int expirationSeconds) {
        // Local storage doesn't support presigned URLs, return regular URL
        return buildUrl(key);
    }

    private Path buildPath(String bucket, String path, String filename) {
        String uniqueFilename = UUID.randomUUID().toString().substring(0, 8) + "-" + filename;

        Path result = Path.of(basePath);

        if (bucket != null && !bucket.isEmpty()) {
            result = result.resolve(bucket);
        }

        if (path != null && !path.isEmpty()) {
            result = result.resolve(path);
        }

        return result.resolve(uniqueFilename);
    }

    private String buildKey(String bucket, String path, String filename, Path fullPath) {
        // Key is relative to basePath
        return Path.of(basePath).relativize(fullPath).toString();
    }

    private String buildUrl(String key) {
        String normalizedUrl = serveUrl.endsWith("/") ? serveUrl : serveUrl + "/";
        return normalizedUrl + key;
    }
}
