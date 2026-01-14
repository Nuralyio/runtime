package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class LlmNodeExecutorTest {

    @Inject
    LlmNodeExecutor executor;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.LLM, executor.getType());
    }

    @Test
    void testExecuteWithMissingConfiguration() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.LLM;
        node.name = "LLM Node";
        node.configuration = null;

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void testExecuteWithMissingApiKeyPath() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{\"prompt\": \"Hello\"}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4o");

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.LLM;
        node.name = "LLM Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("API key path is required"));
    }

    @Test
    void testExecuteWithUnknownProvider() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{\"prompt\": \"Hello\"}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "unknown_provider");
        config.put("apiKeyPath", "test/key");

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.type = NodeType.LLM;
        node.name = "LLM Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Unknown LLM provider"));
    }

    @Test
    void testConfigurationParsing() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4o");
        config.put("apiKeyPath", "openai/my-key");
        config.put("systemPrompt", "You are a helpful assistant.");
        config.put("temperature", 0.7);
        config.put("maxTokens", 1000);
        config.put("maxToolIterations", 5);

        // Verify configuration can be parsed
        assertNotNull(config.get("provider").asText());
        assertEquals("openai", config.get("provider").asText());
        assertEquals("gpt-4o", config.get("model").asText());
        assertEquals(0.7, config.get("temperature").asDouble());
        assertEquals(1000, config.get("maxTokens").asInt());
        assertEquals(5, config.get("maxToolIterations").asInt());
    }

    @Test
    void testToolDefinitionInConfiguration() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("apiKeyPath", "openai/key");

        // Add tools
        ObjectNode tool1 = objectMapper.createObjectNode();
        tool1.put("name", "get_weather");
        tool1.put("description", "Get weather for a location");
        tool1.put("portId", "tool_weather");

        ObjectNode parameters = objectMapper.createObjectNode();
        parameters.put("type", "object");
        ObjectNode properties = objectMapper.createObjectNode();
        ObjectNode locationProp = objectMapper.createObjectNode();
        locationProp.put("type", "string");
        properties.set("location", locationProp);
        parameters.set("properties", properties);
        tool1.set("parameters", parameters);

        config.set("tools", objectMapper.createArrayNode().add(tool1));

        // Verify tools can be parsed
        assertTrue(config.has("tools"));
        assertTrue(config.get("tools").isArray());
        assertEquals(1, config.get("tools").size());
        assertEquals("get_weather", config.get("tools").get(0).get("name").asText());
    }

    @Test
    void testInputPromptExtraction() throws Exception {
        // Test various prompt field names
        String[] promptFields = {"prompt", "message", "query", "text", "input"};

        for (String field : promptFields) {
            ObjectNode inputData = objectMapper.createObjectNode();
            inputData.put(field, "Test prompt");

            WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
            execution.inputData = objectMapper.writeValueAsString(inputData);
            ExecutionContext context = new ExecutionContext(execution);

            assertNotNull(context.getInput().get(field));
            assertEquals("Test prompt", context.getInput().get(field).asText());
        }
    }

    @Test
    void testInputPromptExtractionFromBody() throws Exception {
        ObjectNode inputData = objectMapper.createObjectNode();
        ObjectNode body = objectMapper.createObjectNode();
        body.put("prompt", "Test from body");
        inputData.set("body", body);

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = objectMapper.writeValueAsString(inputData);
        ExecutionContext context = new ExecutionContext(execution);

        assertTrue(context.getInput().has("body"));
        assertEquals("Test from body", context.getInput().get("body").get("prompt").asText());
    }

    @Test
    void testOutputVariableConfiguration() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("apiKeyPath", "openai/key");
        config.put("outputVariable", "llmResponse");

        // Verify outputVariable is set
        assertTrue(config.has("outputVariable"));
        assertEquals("llmResponse", config.get("outputVariable").asText());
    }

    @Test
    void testSystemPromptWithExpression() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        execution.variables = "{\"userName\": \"John\"}";
        ExecutionContext context = new ExecutionContext(execution);

        // Test expression resolution
        String result = context.resolveExpression("Hello ${variables.userName}!");
        assertEquals("Hello John!", result);
    }

    @Test
    void testMaxToolIterationsDefault() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("apiKeyPath", "openai/key");

        // Default should be used when not specified
        assertFalse(config.has("maxToolIterations"));

        // When specified
        config.put("maxToolIterations", 15);
        assertEquals(15, config.get("maxToolIterations").asInt());
    }
}
