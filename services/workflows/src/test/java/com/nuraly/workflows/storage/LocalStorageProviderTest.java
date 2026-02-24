package com.nuraly.workflows.storage;

import com.nuraly.workflows.storage.providers.LocalStorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class LocalStorageProviderTest {

    private LocalStorageProvider provider;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() throws Exception {
        provider = new LocalStorageProvider();

        // Set the basePath using reflection
        Field basePathField = LocalStorageProvider.class.getDeclaredField("basePath");
        basePathField.setAccessible(true);
        basePathField.set(provider, tempDir.toString());

        Field serveUrlField = LocalStorageProvider.class.getDeclaredField("serveUrl");
        serveUrlField.setAccessible(true);
        serveUrlField.set(provider, "http://localhost:8080/files");
    }

    @Test
    void testGetName() {
        assertEquals("local", provider.getName());
    }

    @Test
    void testStoreFile() {
        // Arrange
        byte[] content = "Hello, World!".getBytes();
        String filename = "test.txt";
        String contentType = "text/plain";
        String bucket = "test-bucket";
        String path = "uploads";
        Map<String, String> metadata = Map.of("author", "test");

        // Act
        StorageResult result = provider.store(content, filename, contentType, bucket, path, metadata);

        // Assert
        assertNotNull(result);
        assertEquals(filename, result.getFilename());
        assertEquals(contentType, result.getContentType());
        assertEquals(content.length, result.getSize());
        assertEquals("local", result.getProvider());
        assertEquals(bucket, result.getBucket());
        assertTrue(result.getUrl().startsWith("http://localhost:8080/files/"));
        assertTrue(result.getKey().contains(bucket));
        assertTrue(result.getKey().endsWith(".txt"));

        // Verify file was actually created
        Path expectedDir = tempDir.resolve(bucket).resolve(path);
        assertTrue(Files.exists(expectedDir));
    }

    @Test
    void testStoreFileWithNullPath() {
        // Arrange
        byte[] content = "Test content".getBytes();
        String filename = "document.pdf";

        // Act
        StorageResult result = provider.store(content, filename, "application/pdf", "bucket", null, null);

        // Assert
        assertNotNull(result);
        assertEquals(filename, result.getFilename());
        assertNotNull(result.getUrl());
    }

    @Test
    void testExists() {
        // Arrange - store a file first
        byte[] content = "Test".getBytes();
        StorageResult result = provider.store(content, "exists-test.txt", "text/plain", "bucket", null, null);

        // Act & Assert
        assertTrue(provider.exists("bucket", result.getKey()));
        assertFalse(provider.exists("bucket", "non-existent-key"));
    }

    @Test
    void testDelete() {
        // Arrange - store a file first
        byte[] content = "To be deleted".getBytes();
        StorageResult result = provider.store(content, "delete-test.txt", "text/plain", "bucket", null, null);

        // Verify file exists
        assertTrue(provider.exists("bucket", result.getKey()));

        // Act
        boolean deleted = provider.delete("bucket", result.getKey());

        // Assert
        assertTrue(deleted);
        assertFalse(provider.exists("bucket", result.getKey()));
    }

    @Test
    void testDeleteNonExistent() {
        // Act
        boolean deleted = provider.delete("bucket", "non-existent-file.txt");

        // Assert
        assertFalse(deleted);
    }

    @Test
    void testGetPresignedUrl() {
        // Local storage doesn't support presigned URLs, should return regular URL
        String url = provider.getPresignedUrl("bucket", "test/file.txt", 3600);
        assertEquals("http://localhost:8080/files/test/file.txt", url);
    }
}
