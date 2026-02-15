package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.NodeExecutorFactory;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.llm.LlmProvider;
import com.nuraly.workflows.llm.LlmProviderFactory;
import com.nuraly.workflows.llm.LlmResilienceService;
import com.nuraly.workflows.llm.LlmResilienceService.ResilienceConfig;
import com.nuraly.workflows.llm.dto.*;
import com.nuraly.workflows.service.WorkflowEventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LlmNodeExecutorUnitTest {

    @Mock LlmProviderFactory providerFactory;
    @Mock LlmResilienceService resilienceService;
    @Mock NodeExecutorFactory nodeExecutorFactory;
    @Mock Configuration configuration;
    @Mock WorkflowEventService eventService;
    @Mock ContextMemoryStore contextMemoryStore;
    @Mock ContextMemoryNodeExecutor contextMemoryNodeExecutor;

    @InjectMocks
    LlmNodeExecutor executor;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private LlmProvider mockProvider;

    @BeforeEach
    void setUp() {
        mockProvider = mock(LlmProvider.class);
        lenient().when(mockProvider.getDefaultModel()).thenReturn("gpt-4");
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ExecutionContext contextWithInput(String inputJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson;
        return new ExecutionContext(execution);
    }

    private WorkflowNodeEntity llmNode(String configJson) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.name = "llm-node";
        node.type = NodeType.LLM;
        node.configuration = configJson;
        // Provide a minimal workflow with no edges
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.nodes.add(node);
        node.workflow = workflow;
        return node;
    }

    private LlmResponse successResponse(String content) {
        return LlmResponse.builder()
                .content(content)
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(10).completionTokens(20).totalTokens(30).build())
                .build();
    }

    private LlmResponse toolCallResponse(String toolName, String args) {
        ToolCall tc = ToolCall.builder()
                .id("call-1")
                .name(toolName)
                .arguments(objectMapper.createObjectNode().put("q", args))
                .build();
        return LlmResponse.builder()
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .toolCalls(List.of(tc))
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(5).completionTokens(5).totalTokens(10).build())
                .build();
    }

    private String minimalConfig() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "openai/key");
        return objectMapper.writeValueAsString(config);
    }

    private void stubProvider() {
        when(providerFactory.getProvider("openai")).thenReturn(mockProvider);
    }

    private void stubKvAndProvider() {
        stubProvider();
        configuration.kvServiceUrl = "http://kv:7003";
    }

    // ------------------------------------------------------------------
    // Tests
    // ------------------------------------------------------------------

    @Test
    void successfulLlmCall() throws Exception {
        stubKvAndProvider();
        LlmResponse resp = successResponse("Hello!");
        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(resp);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"Hi\"}");
        NodeExecutionResult result = executor.execute(ctx, llmNode(minimalConfig()));

        assertTrue(result.isSuccess());
        JsonNode out = result.getOutput();
        assertEquals("Hello!", out.get("content").asText());
        assertEquals("gpt-4", out.get("model").asText());
        assertEquals("STOP", out.get("finishReason").asText());
        assertTrue(out.has("usage"));
        assertEquals(30, out.get("usage").get("totalTokens").asInt());
        assertEquals(1, out.get("iterations").asInt());
    }

    @Test
    void missingConfigReturnsFailure() throws Exception {
        NodeExecutionResult result = executor.execute(
                contextWithInput("{}"), llmNode(null));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void unknownProviderReturnsFailure() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "bogus");
        config.put("apiKeyPath", "key");

        when(providerFactory.getProvider("bogus")).thenReturn(null);

        NodeExecutionResult result = executor.execute(
                contextWithInput("{\"prompt\":\"Hi\"}"),
                llmNode(objectMapper.writeValueAsString(config)));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("Unknown LLM provider"));
    }

    @Test
    void ollamaRequiresBaseUrl() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "ollama");
        config.put("model", "llama3");

        LlmProvider ollamaProvider = mock(LlmProvider.class);
        when(providerFactory.getProvider("ollama")).thenReturn(ollamaProvider);
        configuration.kvServiceUrl = "http://kv:7003";

        NodeExecutionResult result = executor.execute(
                contextWithInput("{\"prompt\":\"Hi\"}"),
                llmNode(objectMapper.writeValueAsString(config)));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("API URL is required"));
    }

    @Test
    void missingUserPromptReturnsFailure() throws Exception {
        stubKvAndProvider();

        NodeExecutionResult result = executor.execute(
                contextWithInput("{}"), llmNode(minimalConfig()));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("User prompt is required"));
    }

    @Test
    void systemPromptExpressionResolved() throws Exception {
        stubKvAndProvider();

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "key");
        config.put("systemPrompt", "Hello ${variables.name}");

        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{\"prompt\":\"test\"}";
        execution.variables = "{\"name\":\"World\"}";
        ExecutionContext ctx = new ExecutionContext(execution);

        ArgumentCaptor<LlmRequest> reqCaptor = ArgumentCaptor.forClass(LlmRequest.class);
        when(resilienceService.executeWithResilience(reqCaptor.capture(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(successResponse("ok"));

        executor.execute(ctx, llmNode(objectMapper.writeValueAsString(config)));

        LlmRequest captured = reqCaptor.getValue();
        // First message should be system with resolved expression
        LlmMessage sysMsg = captured.getMessages().get(0);
        assertEquals(LlmMessage.Role.SYSTEM, sysMsg.getRole());
        assertEquals("Hello World", sysMsg.getContent());
    }

    @Test
    void toolCallLoopExecutesAndReturns() throws Exception {
        stubKvAndProvider();

        // Build config with a tool defined inline (simple format)
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "key");
        ArrayNode tools = config.putArray("tools");
        ObjectNode toolDef = tools.addObject();
        toolDef.put("name", "search");
        toolDef.put("description", "Search the web");
        toolDef.putObject("parameters").put("type", "object");
        toolDef.put("portId", "tool_search");

        WorkflowNodeEntity node = llmNode(objectMapper.writeValueAsString(config));

        // Wire up a target FUNCTION node connected via tool_search port
        WorkflowNodeEntity funcNode = new WorkflowNodeEntity();
        funcNode.id = UUID.randomUUID();
        funcNode.name = "search-func";
        funcNode.type = NodeType.FUNCTION;
        funcNode.workflow = node.workflow;
        node.workflow.nodes.add(funcNode);

        WorkflowEdgeEntity edge = new WorkflowEdgeEntity();
        edge.id = UUID.randomUUID();
        edge.sourceNode = node;
        edge.targetNode = funcNode;
        edge.sourcePortId = "tool_search";
        edge.targetPortId = "in";
        edge.workflow = node.workflow;
        node.workflow.edges.add(edge);

        // First call returns tool_calls, second returns STOP
        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse("search", "test query"))
                .thenReturn(successResponse("Search result: found it"));

        // Stub the FUNCTION executor
        NodeExecutor funcExecutor = mock(NodeExecutor.class);
        when(nodeExecutorFactory.hasExecutor(NodeType.FUNCTION)).thenReturn(true);
        when(nodeExecutorFactory.getExecutor(NodeType.FUNCTION)).thenReturn(funcExecutor);
        ObjectNode toolResult = objectMapper.createObjectNode();
        toolResult.put("result", "42");
        when(funcExecutor.execute(any(), eq(funcNode))).thenReturn(NodeExecutionResult.success(toolResult));

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"search something\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        assertEquals(2, result.getOutput().get("iterations").asInt());
        assertEquals("Search result: found it", result.getOutput().get("content").asText());
        verify(funcExecutor).execute(any(), eq(funcNode));
    }

    @Test
    void maxIterationsStopsLoop() throws Exception {
        stubKvAndProvider();

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "key");
        config.put("maxToolIterations", 1);
        ArrayNode tools = config.putArray("tools");
        tools.addObject().put("name", "t").put("description", "d")
                .putObject("parameters").put("type", "object");

        WorkflowNodeEntity node = llmNode(objectMapper.writeValueAsString(config));

        // Always return tool calls - loop should stop after 1 iteration
        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse("t", "x"));

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"go\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        // The loop stops after maxToolIterations; the last response has toolCalls so
        // finishReason = TOOL_CALLS, but since there's no content, output content is null
        assertTrue(result.isSuccess());
        assertEquals(1, result.getOutput().get("iterations").asInt());
    }

    @Test
    void outputVariableStoredInContext() throws Exception {
        stubKvAndProvider();

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "key");
        config.put("outputVariable", "result");

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(successResponse("stored value"));

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"test\"}");
        executor.execute(ctx, llmNode(objectMapper.writeValueAsString(config)));

        JsonNode stored = ctx.getVariable("result");
        assertNotNull(stored);
        assertEquals("stored value", stored.get("content").asText());
    }

    @Test
    void conversationHistoryFromAgent() throws Exception {
        stubKvAndProvider();

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "openai");
        config.put("model", "gpt-4");
        config.put("apiKeyPath", "key");
        ArrayNode history = config.putArray("conversationHistory");
        ObjectNode msg1 = history.addObject();
        msg1.put("role", "user");
        msg1.put("content", "previous question");
        ObjectNode msg2 = history.addObject();
        msg2.put("role", "assistant");
        msg2.put("content", "previous answer");

        ArgumentCaptor<LlmRequest> reqCaptor = ArgumentCaptor.forClass(LlmRequest.class);
        when(resilienceService.executeWithResilience(reqCaptor.capture(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(successResponse("ok"));

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"new question\"}");
        executor.execute(ctx, llmNode(objectMapper.writeValueAsString(config)));

        LlmRequest captured = reqCaptor.getValue();
        // Messages should include the 2 history messages + the user prompt = 3
        assertEquals(3, captured.getMessages().size());
        assertEquals(LlmMessage.Role.USER, captured.getMessages().get(0).getRole());
        assertEquals("previous question", captured.getMessages().get(0).getContent());
        assertEquals(LlmMessage.Role.ASSISTANT, captured.getMessages().get(1).getRole());
        assertEquals(LlmMessage.Role.USER, captured.getMessages().get(2).getRole());
        assertEquals("new question", captured.getMessages().get(2).getContent());

        // Memory store should NOT be called since history came from Agent
        verify(contextMemoryStore, never()).getMessagesByCount(any(), anyInt());
        verify(contextMemoryStore, never()).addMessage(any(), any());
    }

    @Test
    void memoryLoadedFromConnectedNode() throws Exception {
        stubKvAndProvider();

        WorkflowNodeEntity node = llmNode(minimalConfig());

        // Create a MEMORY node and connect it
        WorkflowNodeEntity memNode = new WorkflowNodeEntity();
        memNode.id = UUID.randomUUID();
        memNode.name = "memory";
        memNode.type = NodeType.MEMORY;
        memNode.configuration = "{\"cutoffMode\":\"message\",\"maxMessages\":20}";
        memNode.workflow = node.workflow;
        node.workflow.nodes.add(memNode);

        WorkflowEdgeEntity edge = new WorkflowEdgeEntity();
        edge.id = UUID.randomUUID();
        edge.sourceNode = memNode;
        edge.targetNode = node;
        edge.sourcePortId = "out";
        edge.targetPortId = "memory";
        edge.workflow = node.workflow;
        node.workflow.edges.add(edge);

        // Stub memory store to return history
        List<LlmMessage> history = new ArrayList<>();
        history.add(LlmMessage.user("old question"));
        history.add(LlmMessage.assistant("old answer"));
        when(contextMemoryStore.getMessagesByCount(eq("thread-abc"), eq(20)))
                .thenReturn(history);

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(successResponse("response"));

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"new q\",\"threadId\":\"thread-abc\"}");
        executor.execute(ctx, node);

        verify(contextMemoryStore).getMessagesByCount("thread-abc", 20);
    }
}
