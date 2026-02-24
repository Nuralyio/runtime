package com.nuraly.workflows.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.executors.AgentNodeExecutor;
import com.nuraly.workflows.engine.executors.LlmNodeExecutor;
import com.nuraly.workflows.engine.executors.ToolNodeExecutor;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.service.WorkflowEventService;
import com.nuraly.workflows.test.WorkflowBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pure unit tests for AgentNodeExecutor — no container, no DB.
 * Validates that the Agent correctly resolves connected config nodes
 * (LLM, Prompt, Tools, Memory) and extracts user messages from various input shapes.
 */
@ExtendWith(MockitoExtension.class)
class WorkflowExecutionTest {

    @Mock
    private LlmNodeExecutor llmExecutor;

    @Mock
    private ToolNodeExecutor toolExecutor;

    @Mock
    private WorkflowEventService eventService;

    @Mock
    private ContextMemoryStore contextMemoryStore;

    @InjectMocks
    private AgentNodeExecutor agentExecutor;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ObjectNode cannedLlmOutput;

    @BeforeEach
    void setUp() {
        cannedLlmOutput = objectMapper.createObjectNode();
        cannedLlmOutput.put("content", "I am a helpful assistant.");
        cannedLlmOutput.put("response", "I am a helpful assistant.");
    }

    // ------------------------------------------------------------------
    // LLM config resolution
    // ------------------------------------------------------------------

    @Test
    void agentResolvesLlmConfigNode() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("llm-resolve")
                .node("start", NodeType.START)
                .node("agent", NodeType.AGENT, """
                        {"maxIterations":10}""")
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/prod"}""")
                .node("end", NodeType.END)
                .edge("start", "out", "agent", "in")
                .edge("llm", "out", "agent", "llm")
                .edge("agent", "out", "end", "input")
                .build();

        stubLlmSuccess();
        ExecutionContext ctx = contextWithInput("""
                {"query":"hello"}""");

        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));

        assertTrue(result.isSuccess());
        // The agent should have delegated to llmExecutor with merged config
        // containing the provider and model from the LLM node
        assertNotNull(result.getOutput());
        assertEquals(wf.node("llm").id.toString(), result.getOutput().get("llmNodeId").asText());
    }

    @Test
    void agentAcceptsBothLlmTypes() throws Exception {
        // AGENT_LLM type
        WorkflowBuilder.Result wf1 = minimalAgentWorkflow(NodeType.AGENT_LLM);
        stubLlmSuccess();
        NodeExecutionResult r1 = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf1.node("agent"));
        assertTrue(r1.isSuccess(), "AGENT_LLM should be accepted");

        // LLM type
        WorkflowBuilder.Result wf2 = minimalAgentWorkflow(NodeType.LLM);
        stubLlmSuccess();
        NodeExecutionResult r2 = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf2.node("agent"));
        assertTrue(r2.isSuccess(), "LLM should be accepted");
    }

    @Test
    void agentRejectsWrongTypeOnLlmPort() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("wrong-type")
                .node("agent", NodeType.AGENT)
                .node("func", NodeType.FUNCTION)
                .edge("func", "out", "agent", "llm")
                .build();

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{}"), wf.node("agent"));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("must be an LLM node"));
    }

    @Test
    void agentFailsWithoutLlmNode() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("no-llm")
                .node("start", NodeType.START)
                .node("agent", NodeType.AGENT)
                .node("end", NodeType.END)
                .edge("start", "out", "agent", "in")
                .edge("agent", "out", "end", "input")
                .build();

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{}"), wf.node("agent"));

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("connected LLM node"));
    }

    // ------------------------------------------------------------------
    // Prompt resolution
    // ------------------------------------------------------------------

    @Test
    void agentResolvesPromptNode() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("prompt-resolve")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("prompt", NodeType.PROMPT, """
                        {"template":"You are a helpful coding assistant"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("prompt", "out", "agent", "prompt")
                .build();

        // Capture the temp node passed to llmExecutor to verify systemPrompt
        when(llmExecutor.execute(any(), any())).thenAnswer(invocation -> {
            WorkflowNodeEntity tempNode = invocation.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            // The prompt template should appear as systemPrompt in the merged config
            assertEquals("You are a helpful coding assistant",
                    config.get("systemPrompt").asText());
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"write code\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentFallsBackToPromptAsUserMessage() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("prompt-fallback")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("prompt", NodeType.PROMPT, """
                        {"template":"Summarize today's news"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("prompt", "out", "agent", "prompt")
                .build();

        // No input on "in" port, no query in context → prompt template becomes user message
        when(llmExecutor.execute(any(), any())).thenAnswer(invocation -> {
            WorkflowNodeEntity tempNode = invocation.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            // systemPrompt should be null (moved to user message)
            assertFalse(config.has("systemPrompt"),
                    "systemPrompt should be removed when used as user message");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        // Empty input — no query, no message, no text
        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    // ------------------------------------------------------------------
    // User message extraction
    // ------------------------------------------------------------------

    @Test
    void agentExtractsTelegramMessage() throws Exception {
        WorkflowBuilder.Result wf = minimalAgentWorkflow(NodeType.AGENT_LLM);
        stubLlmSuccess();

        // Telegram-style nested message.text
        ExecutionContext ctx = contextWithInput("""
                {"message":{"text":"hello from telegram"}}""");

        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));
        assertTrue(result.isSuccess());

        // After execution, context input should have query set
        JsonNode input = ctx.getInput();
        assertEquals("hello from telegram", input.get("query").asText());
    }

    @Test
    void agentExtractsStandardFields() throws Exception {
        // "query" field
        WorkflowBuilder.Result wf = minimalAgentWorkflow(NodeType.AGENT_LLM);
        stubLlmSuccess();
        ExecutionContext ctx = contextWithInput("{\"query\":\"hello\"}");
        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));
        assertTrue(result.isSuccess());
        assertEquals("hello", ctx.getInput().get("query").asText());

        // "text" field
        wf = minimalAgentWorkflow(NodeType.AGENT_LLM);
        stubLlmSuccess();
        ctx = contextWithInput("{\"text\":\"hello text\"}");
        result = agentExecutor.execute(ctx, wf.node("agent"));
        assertTrue(result.isSuccess());
        assertEquals("hello text", ctx.getInput().get("query").asText());

        // "prompt" field
        wf = minimalAgentWorkflow(NodeType.AGENT_LLM);
        stubLlmSuccess();
        ctx = contextWithInput("{\"prompt\":\"hello prompt\"}");
        result = agentExecutor.execute(ctx, wf.node("agent"));
        assertTrue(result.isSuccess());
        assertEquals("hello prompt", ctx.getInput().get("query").asText());
    }

    // ------------------------------------------------------------------
    // Tool resolution
    // ------------------------------------------------------------------

    @Test
    void agentResolvesToolNodes() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("tool-resolve")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("tool1", NodeType.TOOL, """
                        {"toolName":"get_weather","description":"Get weather"}""")
                .node("tool2", NodeType.TOOL, """
                        {"toolName":"search","description":"Search the web"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("tool1", "out", "agent", "tools")
                .edge("tool2", "out", "agent", "tools")
                .build();

        // Stub tool executor to return tool definitions
        when(toolExecutor.execute(any(), any())).thenAnswer(invocation -> {
            WorkflowNodeEntity toolNode = invocation.getArgument(1);
            ObjectNode toolDef = objectMapper.createObjectNode();
            toolDef.put("type", "function");
            ObjectNode func = objectMapper.createObjectNode();
            func.put("name", objectMapper.readTree(toolNode.configuration).get("toolName").asText());
            toolDef.set("function", func);
            return NodeExecutionResult.success(toolDef);
        });

        // Stub LLM to verify tools were passed
        when(llmExecutor.execute(any(), any())).thenAnswer(invocation -> {
            WorkflowNodeEntity tempNode = invocation.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertTrue(config.has("tools"), "merged config should contain tools");
            assertEquals(2, config.get("tools").size(), "should have 2 tools");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"weather?\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentSkipsNonToolNodesOnToolsPort() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("non-tool-skip")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("wrongType", NodeType.FUNCTION) // Not a TOOL node
                .edge("llm", "out", "agent", "llm")
                .edge("wrongType", "out", "agent", "tools")
                .build();

        // LLM should be called with no tools (the non-TOOL node is skipped)
        when(llmExecutor.execute(any(), any())).thenAnswer(invocation -> {
            WorkflowNodeEntity tempNode = invocation.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertFalse(config.has("tools"), "non-TOOL nodes should be skipped");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    // ------------------------------------------------------------------
    // Memory resolution
    // ------------------------------------------------------------------

    @Test
    void agentResolvesMemoryNode() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("memory-resolve")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("mem", NodeType.MEMORY, """
                        {"cutoffMode":"message","maxMessages":20}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mem", "out", "agent", "memory")
                .build();

        stubLlmSuccess();
        when(contextMemoryStore.getMessagesByCount(any(), any(int.class)))
                .thenReturn(new java.util.ArrayList<>());

        ExecutionContext ctx = contextWithInput("""
                {"query":"hi","threadId":"thread-123"}""");

        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));

        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput().get("memoryNodeId"));
        assertEquals(wf.node("mem").id.toString(),
                result.getOutput().get("memoryNodeId").asText());
    }

    @Test
    void agentResolvesMemoryOnContextPort() throws Exception {
        // Memory connected via "context" port name instead of "memory"
        WorkflowBuilder.Result wf = WorkflowBuilder.create("memory-context-port")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("mem", NodeType.MEMORY, """
                        {"cutoffMode":"message","maxMessages":20}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mem", "out", "agent", "context")
                .build();

        stubLlmSuccess();
        when(contextMemoryStore.getMessagesByCount(any(), any(int.class)))
                .thenReturn(new java.util.ArrayList<>());

        ExecutionContext ctx = contextWithInput("""
                {"query":"hi","threadId":"thread-456"}""");

        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));

        assertTrue(result.isSuccess());
        assertNotNull(result.getOutput().get("memoryNodeId"),
                "Memory node connected via 'context' port should be resolved");
    }

    // ------------------------------------------------------------------
    // Agent tool iteration, memory save, RAG context, config merging
    // ------------------------------------------------------------------

    @Test
    void agentToolIterationLoop() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("tool-loop")
                .node("agent", NodeType.AGENT, """
                        {"maxIterations":5}""")
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("tool", NodeType.TOOL, """
                        {"toolName":"calc","description":"Calculate"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("tool", "out", "agent", "tools")
                .build();

        // ToolExecutor returns a tool definition
        when(toolExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tn = inv.getArgument(1);
            ObjectNode def = objectMapper.createObjectNode();
            def.put("type", "function");
            ObjectNode fn = objectMapper.createObjectNode();
            fn.put("name", objectMapper.readTree(tn.configuration).get("toolName").asText());
            def.set("function", fn);
            def.put("nodeId", tn.id.toString());
            return NodeExecutionResult.success(def);
        });

        // LLM executor: capture the merged config to verify tools present
        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertTrue(config.has("tools"), "merged config should have tools");
            assertTrue(config.has("maxToolIterations"), "maxIterations should merge");
            assertEquals(5, config.get("maxToolIterations").asInt());
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"compute 2+2\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
        verify(llmExecutor).execute(any(), any());
    }

    @Test
    void agentMaxIterationsMergedIntoConfig() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("max-iter")
                .node("agent", NodeType.AGENT, """
                        {"maxIterations":5}""")
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .edge("llm", "out", "agent", "llm")
                .build();

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertEquals(5, config.get("maxToolIterations").asInt(),
                    "Agent maxIterations should map to maxToolIterations in merged config");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentMemorySavesMessages() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mem-save")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("mem", NodeType.MEMORY, """
                        {"cutoffMode":"message","maxMessages":10}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mem", "out", "agent", "memory")
                .build();

        when(contextMemoryStore.getMessagesByCount(any(), anyInt()))
                .thenReturn(new ArrayList<>());

        ObjectNode llmOutput = objectMapper.createObjectNode();
        llmOutput.put("content", "assistant reply");
        llmOutput.put("response", "assistant reply");
        when(llmExecutor.execute(any(), any()))
                .thenReturn(NodeExecutionResult.success(llmOutput));

        ExecutionContext ctx = contextWithInput(
                "{\"query\":\"user msg\",\"threadId\":\"t-1\"}");
        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));

        assertTrue(result.isSuccess());
        // Agent should save user message + assistant message
        verify(contextMemoryStore).addMessage(eq("t-1"), argThat(msg ->
                msg.getRole() == LlmMessage.Role.USER && "user msg".equals(msg.getContent())));
        verify(contextMemoryStore).addMessage(eq("t-1"), argThat(msg ->
                msg.getRole() == LlmMessage.Role.ASSISTANT && "assistant reply".equals(msg.getContent())));
    }

    @Test
    void agentRagContextInjected() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("rag-inject")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4"}""")
                .node("retriever", NodeType.RETRIEVER)
                .edge("llm", "out", "agent", "llm")
                .edge("retriever", "out", "agent", "retriever")
                .build();

        // Put retriever output into context
        ObjectNode retrieverOutput = objectMapper.createObjectNode();
        retrieverOutput.put("context", "Document about quantum computing.");
        retrieverOutput.put("query", "what is quantum");

        ExecutionContext ctx = contextWithInput("{}");
        ctx.setNodeOutput(wf.node("retriever").id, retrieverOutput);

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            String systemPrompt = config.get("systemPrompt").asText();
            assertTrue(systemPrompt.contains("Retrieved Context"),
                    "System prompt should contain RAG section");
            assertTrue(systemPrompt.contains("Document about quantum computing"),
                    "System prompt should contain actual context");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(ctx, wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentMergesAllLlmConfigFields() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("merge-all")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"anthropic","model":"claude-3","temperature":0.5,"maxTokens":2048,"apiKeyPath":"anthropic/key"}""")
                .edge("llm", "out", "agent", "llm")
                .build();

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertEquals("anthropic", config.get("provider").asText());
            assertEquals("claude-3", config.get("model").asText());
            assertEquals(0.5, config.get("temperature").asDouble(), 0.001);
            assertEquals(2048, config.get("maxTokens").asInt());
            assertEquals("anthropic/key", config.get("apiKeyPath").asText());
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"hello\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private WorkflowBuilder.Result minimalAgentWorkflow(NodeType llmType) {
        return WorkflowBuilder.create("minimal")
                .node("agent", NodeType.AGENT)
                .node("llm", llmType, """
                        {"provider":"openai","model":"gpt-4"}""")
                .edge("llm", "out", "agent", "llm")
                .build();
    }

    private void stubLlmSuccess() throws Exception {
        when(llmExecutor.execute(any(), any()))
                .thenReturn(NodeExecutionResult.success(cannedLlmOutput));
    }

    private ExecutionContext contextWithInput(String inputJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson;
        return new ExecutionContext(execution);
    }
}
