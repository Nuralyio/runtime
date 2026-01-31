package com.nuraly.workflows.storage;

/**
 * Configuration for S3/MinIO storage, typically fetched from KV store at runtime.
 */
public class StorageConfig {

    private final String endpoint;
    private final String region;
    private final String accessKey;
    private final String secretKey;
    private final String bucket;
    private final boolean pathStyleAccess;

    private StorageConfig(Builder builder) {
        this.endpoint = builder.endpoint;
        this.region = builder.region;
        this.accessKey = builder.accessKey;
        this.secretKey = builder.secretKey;
        this.bucket = builder.bucket;
        this.pathStyleAccess = builder.pathStyleAccess;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public String getRegion() {
        return region;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getBucket() {
        return bucket;
    }

    public boolean isPathStyleAccess() {
        return pathStyleAccess;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String endpoint;
        private String region = "us-east-1";
        private String accessKey;
        private String secretKey;
        private String bucket;
        private boolean pathStyleAccess = false;

        public Builder endpoint(String endpoint) {
            this.endpoint = endpoint;
            return this;
        }

        public Builder region(String region) {
            this.region = region;
            return this;
        }

        public Builder accessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        public Builder secretKey(String secretKey) {
            this.secretKey = secretKey;
            return this;
        }

        public Builder bucket(String bucket) {
            this.bucket = bucket;
            return this;
        }

        public Builder pathStyleAccess(boolean pathStyleAccess) {
            this.pathStyleAccess = pathStyleAccess;
            return this;
        }

        public StorageConfig build() {
            return new StorageConfig(this);
        }
    }
}
