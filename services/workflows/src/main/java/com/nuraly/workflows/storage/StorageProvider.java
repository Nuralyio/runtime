package com.nuraly.workflows.storage;

import java.io.InputStream;
import java.util.Map;

/**
 * Interface for file storage providers (S3, MinIO, Local filesystem, etc.)
 */
public interface StorageProvider {

    /**
     * Get the provider name (e.g., "s3", "minio", "local")
     */
    String getName();

    /**
     * Store a file from byte array
     *
     * @param data        The file content as bytes
     * @param filename    The original filename
     * @param contentType The MIME type of the file
     * @param bucket      The bucket/folder to store in
     * @param path        Optional path prefix within the bucket
     * @param metadata    Optional metadata to attach to the file
     * @return StorageResult with URL and details
     */
    StorageResult store(byte[] data, String filename, String contentType,
                        String bucket, String path, Map<String, String> metadata);

    /**
     * Store a file from input stream
     *
     * @param inputStream The file content as stream
     * @param filename    The original filename
     * @param contentType The MIME type of the file
     * @param bucket      The bucket/folder to store in
     * @param path        Optional path prefix within the bucket
     * @param metadata    Optional metadata to attach to the file
     * @return StorageResult with URL and details
     */
    StorageResult store(InputStream inputStream, String filename, String contentType,
                        String bucket, String path, Map<String, String> metadata);

    /**
     * Delete a file by its key
     *
     * @param bucket The bucket containing the file
     * @param key    The file key/path
     * @return true if deleted successfully
     */
    boolean delete(String bucket, String key);

    /**
     * Check if a file exists
     *
     * @param bucket The bucket to check
     * @param key    The file key/path
     * @return true if file exists
     */
    boolean exists(String bucket, String key);

    /**
     * Get a presigned URL for temporary access (if supported)
     *
     * @param bucket           The bucket containing the file
     * @param key              The file key/path
     * @param expirationSeconds How long the URL should be valid
     * @return Presigned URL or regular URL if presigning not supported
     */
    String getPresignedUrl(String bucket, String key, int expirationSeconds);
}
