package com.nuraly.workflows.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.executors.FileStorageNodeExecutor;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.storage.providers.LocalStorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileStorageNodeExecutorTest {

    @Mock
    private StorageProviderFactory storageProviderFactory;

    @InjectMocks
    private FileStorageNodeExecutor executor;

    private ObjectMapper objectMapper = new ObjectMapper();
    private LocalStorageProvider localStorageProvider;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() throws Exception {
        localStorageProvider = new LocalStorageProvider();

        // Set the basePath using reflection
        Field basePathField = LocalStorageProvider.class.getDeclaredField("basePath");
        basePathField.setAccessible(true);
        basePathField.set(localStorageProvider, tempDir.toString());

        Field serveUrlField = LocalStorageProvider.class.getDeclaredField("serveUrl");
        serveUrlField.setAccessible(true);
        serveUrlField.set(localStorageProvider, "http://localhost:8080/files");
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.FILE_STORAGE, executor.getType());
    }

    @Test
    void testExecuteSuccess() throws Exception {
        // Arrange
        when(storageProviderFactory.getProvider(any())).thenReturn(localStorageProvider);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("provider", "local")
                        .put("bucket", "test-bucket")
                        .put("path", "uploads")
        );

        String fileContent = "Hello, World!";
        String base64Content = Base64.getEncoder().encodeToString(fileContent.getBytes());

        ObjectNode input = objectMapper.createObjectNode();
        input.put("file", base64Content);
        input.put("filename", "test.txt");
        input.put("contentType", "text/plain");

        ExecutionContext context = createContext(input);

        // Act
        NodeExecutionResult result = executor.execute(context, node);

        // Assert
        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput());

        JsonNode output = result.getOutput();
        assertEquals("test.txt", output.get("filename").asText());
        assertEquals("text/plain", output.get("contentType").asText());
        assertEquals(fileContent.length(), output.get("size").asInt());
        assertEquals("local", output.get("provider").asText());
        assertEquals("test-bucket", output.get("bucket").asText());
        assertTrue(output.get("url").asText().startsWith("http://localhost:8080/files/"));
    }

    @Test
    void testExecuteMissingFile() throws Exception {
        // Arrange
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("bucket", "test-bucket")
        );

        ObjectNode input = objectMapper.createObjectNode();
        input.put("filename", "test.txt");
        // Missing "file" field

        ExecutionContext context = createContext(input);

        // Act
        NodeExecutionResult result = executor.execute(context, node);

        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("File field"));
    }

    @Test
    void testExecuteInvalidBase64() throws Exception {
        // Arrange
        when(storageProviderFactory.getProvider(any())).thenReturn(localStorageProvider);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("bucket", "test-bucket")
        );

        ObjectNode input = objectMapper.createObjectNode();
        input.put("file", "not-valid-base64!!!");
        input.put("filename", "test.txt");

        ExecutionContext context = createContext(input);

        // Act
        NodeExecutionResult result = executor.execute(context, node);

        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Invalid base64"));
    }

    @Test
    void testExecuteMissingConfiguration() throws Exception {
        // Arrange
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = null;

        ObjectNode input = objectMapper.createObjectNode();
        ExecutionContext context = createContext(input);

        // Act
        NodeExecutionResult result = executor.execute(context, node);

        // Assert
        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void testExecuteWithMetadata() throws Exception {
        // Arrange
        when(storageProviderFactory.getProvider(any())).thenReturn(localStorageProvider);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.configuration = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("bucket", "docs")
                        .set("metadataFields", objectMapper.createArrayNode().add("userId").add("category"))
        );

        String base64Content = Base64.getEncoder().encodeToString("PDF content".getBytes());

        ObjectNode input = objectMapper.createObjectNode();
        input.put("file", base64Content);
        input.put("filename", "document.pdf");
        input.put("userId", "user-123");
        input.put("category", "reports");

        ExecutionContext context = createContext(input);

        // Act
        NodeExecutionResult result = executor.execute(context, node);

        // Assert
        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        JsonNode metadata = output.get("metadata");
        assertEquals("user-123", metadata.get("userId").asText());
        assertEquals("reports", metadata.get("category").asText());
    }

    private ExecutionContext createContext(JsonNode input) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.id = UUID.randomUUID();
        execution.inputData = input.toString();
        ExecutionContext context = new ExecutionContext(execution);
        context.setInput(input);
        return context;
    }
}
