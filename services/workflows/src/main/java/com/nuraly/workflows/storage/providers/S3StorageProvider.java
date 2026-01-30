package com.nuraly.workflows.storage.providers;

import com.nuraly.workflows.storage.StorageProvider;
import com.nuraly.workflows.storage.StorageResult;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * S3-compatible storage provider. Works with AWS S3 and MinIO.
 */
@ApplicationScoped
public class S3StorageProvider implements StorageProvider {

    private static final Logger log = LoggerFactory.getLogger(S3StorageProvider.class);

    @ConfigProperty(name = "nuraly.storage.s3.endpoint", defaultValue = "")
    Optional<String> endpoint;

    @ConfigProperty(name = "nuraly.storage.s3.region", defaultValue = "us-east-1")
    String region;

    @ConfigProperty(name = "nuraly.storage.s3.access-key", defaultValue = "")
    Optional<String> accessKey;

    @ConfigProperty(name = "nuraly.storage.s3.secret-key", defaultValue = "")
    Optional<String> secretKey;

    @ConfigProperty(name = "nuraly.storage.s3.path-style-access", defaultValue = "false")
    boolean pathStyleAccess;

    private volatile S3Client s3Client;
    private volatile S3Presigner s3Presigner;

    @Override
    public String getName() {
        return "s3";
    }

    @Override
    public StorageResult store(byte[] data, String filename, String contentType,
                               String bucket, String path, Map<String, String> metadata) {
        S3Client client = getClient();

        String key = buildKey(path, filename);

        try {
            ensureBucketExists(client, bucket);

            PutObjectRequest.Builder requestBuilder = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType);

            if (metadata != null && !metadata.isEmpty()) {
                requestBuilder.metadata(metadata);
            }

            client.putObject(requestBuilder.build(), RequestBody.fromBytes(data));

            String url = buildUrl(bucket, key);

            log.info("Stored file to S3: bucket={}, key={}, size={}", bucket, key, data.length);

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

        } catch (S3Exception e) {
            log.error("Failed to store file to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store file to S3: " + e.getMessage(), e);
        }
    }

    @Override
    public StorageResult store(InputStream inputStream, String filename, String contentType,
                               String bucket, String path, Map<String, String> metadata) {
        try {
            byte[] data = inputStream.readAllBytes();
            return store(data, filename, contentType, bucket, path, metadata);
        } catch (Exception e) {
            log.error("Failed to read input stream: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to read input stream: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean delete(String bucket, String key) {
        try {
            S3Client client = getClient();
            client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
            log.info("Deleted file from S3: bucket={}, key={}", bucket, key);
            return true;
        } catch (S3Exception e) {
            log.error("Failed to delete file from S3: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean exists(String bucket, String key) {
        try {
            S3Client client = getClient();
            client.headObject(HeadObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (S3Exception e) {
            log.error("Failed to check if file exists in S3: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public String getPresignedUrl(String bucket, String key, int expirationSeconds) {
        try {
            S3Presigner presigner = getPresigner();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(expirationSeconds))
                    .getObjectRequest(GetObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build())
                    .build();

            return presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            log.warn("Failed to generate presigned URL, returning regular URL: {}", e.getMessage());
            return buildUrl(bucket, key);
        }
    }

    private S3Client getClient() {
        if (s3Client == null) {
            synchronized (this) {
                if (s3Client == null) {
                    s3Client = buildClient();
                }
            }
        }
        return s3Client;
    }

    private S3Presigner getPresigner() {
        if (s3Presigner == null) {
            synchronized (this) {
                if (s3Presigner == null) {
                    s3Presigner = buildPresigner();
                }
            }
        }
        return s3Presigner;
    }

    private S3Client buildClient() {
        var builder = S3Client.builder()
                .region(Region.of(region));

        if (accessKey.isPresent() && secretKey.isPresent()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.get(), secretKey.get())));
        }

        if (endpoint.isPresent() && !endpoint.get().isEmpty()) {
            builder.endpointOverride(URI.create(endpoint.get()));
        }

        if (pathStyleAccess) {
            builder.forcePathStyle(true);
        }

        return builder.build();
    }

    private S3Presigner buildPresigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(region));

        if (accessKey.isPresent() && secretKey.isPresent()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey.get(), secretKey.get())));
        }

        if (endpoint.isPresent() && !endpoint.get().isEmpty()) {
            builder.endpointOverride(URI.create(endpoint.get()));
        }

        return builder.build();
    }

    private void ensureBucketExists(S3Client client, String bucket) {
        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            log.info("Bucket does not exist, creating: {}", bucket);
            client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
        }
    }

    private String buildKey(String path, String filename) {
        String uniqueFilename = UUID.randomUUID().toString().substring(0, 8) + "-" + filename;
        if (path != null && !path.isEmpty()) {
            String normalizedPath = path.endsWith("/") ? path : path + "/";
            return normalizedPath + uniqueFilename;
        }
        return uniqueFilename;
    }

    private String buildUrl(String bucket, String key) {
        if (endpoint.isPresent() && !endpoint.get().isEmpty()) {
            String endpointUrl = endpoint.get();
            if (pathStyleAccess) {
                return endpointUrl + "/" + bucket + "/" + key;
            } else {
                // Virtual-hosted style
                return endpointUrl.replace("://", "://" + bucket + ".") + "/" + key;
            }
        }
        // AWS S3 default URL format
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }
}
