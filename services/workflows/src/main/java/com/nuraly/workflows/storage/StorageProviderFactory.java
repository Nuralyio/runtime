package com.nuraly.workflows.storage;

import com.nuraly.workflows.storage.providers.LocalStorageProvider;
import com.nuraly.workflows.storage.providers.S3StorageProvider;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Factory for creating storage providers based on configuration or node settings.
 */
@ApplicationScoped
public class StorageProviderFactory {

    private static final Logger log = LoggerFactory.getLogger(StorageProviderFactory.class);

    @Inject
    S3StorageProvider s3StorageProvider;

    @Inject
    LocalStorageProvider localStorageProvider;

    @ConfigProperty(name = "nuraly.storage.default-provider", defaultValue = "local")
    String defaultProvider;

    /**
     * Get the default storage provider based on configuration.
     */
    public StorageProvider getDefaultProvider() {
        return getProvider(defaultProvider);
    }

    /**
     * Get a storage provider by name.
     *
     * @param providerName The provider name: "s3", "minio", or "local"
     * @return The storage provider
     * @throws IllegalArgumentException if provider is not supported
     */
    public StorageProvider getProvider(String providerName) {
        if (providerName == null || providerName.isEmpty()) {
            return getDefaultProvider();
        }

        return switch (providerName.toLowerCase()) {
            case "s3", "minio", "aws" -> {
                log.debug("Using S3 storage provider");
                yield s3StorageProvider;
            }
            case "local", "filesystem", "fs" -> {
                log.debug("Using local storage provider");
                yield localStorageProvider;
            }
            default -> throw new IllegalArgumentException(
                    "Unsupported storage provider: " + providerName +
                            ". Supported providers: s3, minio, local");
        };
    }

    /**
     * Store a file using dynamic S3/MinIO configuration from KV store.
     * This allows per-workflow/per-user storage configuration.
     *
     * @param config      Storage configuration from KV store
     * @param data        File content as bytes
     * @param filename    Original filename
     * @param contentType MIME type
     * @param bucket      Target bucket
     * @param path        Path prefix within bucket
     * @param metadata    Optional metadata
     * @return StorageResult with URL and details
     */
    public StorageResult storeWithConfig(StorageConfig config, byte[] data, String filename,
                                          String contentType, String bucket, String path,
                                          Map<String, String> metadata) {
        log.debug("Using dynamic S3 config: endpoint={}, region={}", config.getEndpoint(), config.getRegion());
        return s3StorageProvider.storeWithConfig(config, data, filename, contentType, bucket, path, metadata);
    }

    /**
     * Check if a provider is available/configured.
     */
    public boolean isProviderAvailable(String providerName) {
        try {
            getProvider(providerName);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
