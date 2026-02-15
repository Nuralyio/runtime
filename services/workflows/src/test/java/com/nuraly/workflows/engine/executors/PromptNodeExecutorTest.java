package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PromptNodeExecutorTest {

    private PromptNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new PromptNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    private WorkflowNodeEntity promptNode(String configuration) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.name = "test-prompt";
        node.type = NodeType.PROMPT;
        node.configuration = configuration;
        return node;
    }

    private ExecutionContext contextWithVars(String inputJson, String variablesJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson != null ? inputJson : "{}";
        execution.variables = variablesJson;
        return new ExecutionContext(execution);
    }

    @Test
    void getType() {
        assertEquals(NodeType.PROMPT, executor.getType());
    }

    @Test
    void nullConfigPassesThrough() throws Exception {
        ExecutionContext ctx = contextWithVars("{\"foo\":\"bar\"}", null);
        NodeExecutionResult result = executor.execute(ctx, promptNode(null));

        assertTrue(result.isSuccess());
        assertEquals("bar", result.getOutput().get("foo").asText());
    }

    @Test
    void templateFieldResolved() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "Hello ${variables.name}");

        ExecutionContext ctx = contextWithVars("{}", "{\"name\":\"Alice\"}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertEquals("Hello Alice", result.getOutput().get("prompt").asText());
    }

    @Test
    void promptFieldResolved() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("prompt", "Summarize: ${variables.topic}");

        ExecutionContext ctx = contextWithVars("{}", "{\"topic\":\"AI safety\"}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertEquals("Summarize: AI safety", result.getOutput().get("prompt").asText());
    }

    @Test
    void systemPromptFieldResolved() throws Exception {
        // When only systemPrompt is present (no template, no prompt), it becomes the template
        ObjectNode config = objectMapper.createObjectNode();
        config.put("systemPrompt", "You are ${variables.role}");

        ExecutionContext ctx = contextWithVars("{}", "{\"role\":\"a teacher\"}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertEquals("You are a teacher", result.getOutput().get("prompt").asText());
    }

    @Test
    void separateSystemPromptAndTemplate() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "Tell me about ${variables.topic}");
        config.put("systemPrompt", "You are ${variables.role}");

        ExecutionContext ctx = contextWithVars("{}", "{\"topic\":\"Java\",\"role\":\"an expert\"}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertEquals("Tell me about Java", result.getOutput().get("prompt").asText());
        assertEquals("You are an expert", result.getOutput().get("systemPrompt").asText());
    }

    @Test
    void variableSubstitutionInTemplate() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "Q: ${input.query} by ${variables.user.name}");

        ExecutionContext ctx = contextWithVars(
                "{\"query\":\"how does it work\"}",
                "{\"user\":{\"name\":\"Bob\"}}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertEquals("Q: how does it work by Bob", result.getOutput().get("prompt").asText());
    }

    @Test
    void outputVariableStoredInContext() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "resolved text");
        config.put("outputVariable", "myPrompt");

        ExecutionContext ctx = contextWithVars("{}", null);
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        JsonNode stored = ctx.getVariable("myPrompt");
        assertNotNull(stored);
        assertEquals("resolved text", stored.asText());
    }

    @Test
    void standardPromptVariableSet() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "hello world");

        ExecutionContext ctx = contextWithVars("{}", null);
        executor.execute(ctx, promptNode(objectMapper.writeValueAsString(config)));

        JsonNode prompt = ctx.getVariable("_prompt");
        assertNotNull(prompt, "_prompt variable should always be set");
        assertEquals("hello world", prompt.asText());
    }

    @Test
    void configVariablesResolved() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("template", "hi");
        ObjectNode vars = config.putObject("variables");
        vars.put("greeting", "${variables.msg}");

        ExecutionContext ctx = contextWithVars("{}", "{\"msg\":\"Welcome!\"}");
        NodeExecutionResult result = executor.execute(ctx,
                promptNode(objectMapper.writeValueAsString(config)));

        assertTrue(result.isSuccess());
        assertTrue(result.getOutput().has("variables"));
        assertEquals("Welcome!", result.getOutput().get("variables").get("greeting").asText());
    }
}
