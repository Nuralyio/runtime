package com.nuraly.workflows.storage;

import java.time.Instant;
import java.util.Map;

/**
 * Result of a file storage operation.
 */
public class StorageResult {

    private final String url;
    private final String key;
    private final String filename;
    private final String contentType;
    private final long size;
    private final String provider;
    private final String bucket;
    private final Instant uploadedAt;
    private final Map<String, String> metadata;

    private StorageResult(Builder builder) {
        this.url = builder.url;
        this.key = builder.key;
        this.filename = builder.filename;
        this.contentType = builder.contentType;
        this.size = builder.size;
        this.provider = builder.provider;
        this.bucket = builder.bucket;
        this.uploadedAt = builder.uploadedAt;
        this.metadata = builder.metadata;
    }

    public String getUrl() {
        return url;
    }

    public String getKey() {
        return key;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }

    public long getSize() {
        return size;
    }

    public String getProvider() {
        return provider;
    }

    public String getBucket() {
        return bucket;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public Map<String, String> getMetadata() {
        return metadata;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String url;
        private String key;
        private String filename;
        private String contentType;
        private long size;
        private String provider;
        private String bucket;
        private Instant uploadedAt = Instant.now();
        private Map<String, String> metadata = Map.of();

        public Builder url(String url) {
            this.url = url;
            return this;
        }

        public Builder key(String key) {
            this.key = key;
            return this;
        }

        public Builder filename(String filename) {
            this.filename = filename;
            return this;
        }

        public Builder contentType(String contentType) {
            this.contentType = contentType;
            return this;
        }

        public Builder size(long size) {
            this.size = size;
            return this;
        }

        public Builder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public Builder bucket(String bucket) {
            this.bucket = bucket;
            return this;
        }

        public Builder uploadedAt(Instant uploadedAt) {
            this.uploadedAt = uploadedAt;
            return this;
        }

        public Builder metadata(Map<String, String> metadata) {
            this.metadata = metadata;
            return this;
        }

        public StorageResult build() {
            return new StorageResult(this);
        }
    }
}
