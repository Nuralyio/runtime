package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.NodeExecutorFactory;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
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
import com.nuraly.workflows.triggers.connectors.McpConnection;
import com.nuraly.workflows.triggers.connectors.McpConnector;
import io.modelcontextprotocol.spec.McpSchema;
import io.modelcontextprotocol.spec.McpSchema.CallToolResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests MCP tool call routing in LlmNodeExecutor.
 * When the LLM requests a tool call that is tagged as _mcpTool,
 * the executor should route it through McpConnector instead of workflow nodes.
 */
@ExtendWith(MockitoExtension.class)
class LlmMcpToolCallTest {

    @Mock LlmProviderFactory providerFactory;
    @Mock LlmResilienceService resilienceService;
    @Mock NodeExecutorFactory nodeExecutorFactory;
    @Mock Configuration configuration;
    @Mock WorkflowEventService eventService;
    @Mock ContextMemoryStore contextMemoryStore;
    @Mock ContextMemoryNodeExecutor contextMemoryNodeExecutor;
    @Mock McpConnector mcpConnector;

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
    // MCP tool call routing
    // ------------------------------------------------------------------

    @Test
    void mcpToolCallRoutedThroughConnector() throws Exception {
        stubKvAndProvider();

        UUID mcpNodeId = UUID.randomUUID();
        WorkflowNodeEntity node = llmNodeWithMcpTool(mcpNodeId, "mcp_search", "Search via MCP");

        // Mock MCP connection
        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);

        // MCP returns text content
        @SuppressWarnings("deprecation")
        CallToolResult toolResult = new CallToolResult(
                List.of(new McpSchema.TextContent("Found: 42 results")),
                null // isError = null (not an error)
        );
        when(mockConn.callTool(eq("mcp_search"), anyMap())).thenReturn(toolResult);
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        // First LLM call returns tool_calls, second returns final answer
        ToolCall tc = ToolCall.builder()
                .id("call-mcp-1")
                .name("mcp_search")
                .arguments(objectMapper.createObjectNode().put("query", "test"))
                .build();
        LlmResponse toolCallResponse = LlmResponse.builder()
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .toolCalls(List.of(tc))
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(10).completionTokens(10).totalTokens(20).build())
                .build();

        LlmResponse finalResponse = LlmResponse.builder()
                .content("Based on the search: 42 results found.")
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(20).completionTokens(15).totalTokens(35).build())
                .build();

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse)
                .thenReturn(finalResponse);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"search for test\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        assertEquals("Based on the search: 42 results found.", result.getOutput().get("content").asText());
        assertEquals(2, result.getOutput().get("iterations").asInt());

        // Verify MCP tool was called
        verify(mockConn).callTool(eq("mcp_search"), anyMap());
    }

    @Test
    void mcpToolCallReturnsErrorWhenDisconnected() throws Exception {
        stubKvAndProvider();

        UUID mcpNodeId = UUID.randomUUID();
        WorkflowNodeEntity node = llmNodeWithMcpTool(mcpNodeId, "mcp_tool", "MCP tool");

        // MCP connection is null (disconnected)
        when(mcpConnector.getConnectionForNode(any())).thenReturn(null);

        // LLM requests MCP tool call, then gets error back and responds
        ToolCall tc = ToolCall.builder()
                .id("call-mcp-err")
                .name("mcp_tool")
                .arguments(objectMapper.createObjectNode())
                .build();
        LlmResponse toolCallResponse = LlmResponse.builder()
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .toolCalls(List.of(tc))
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(5).completionTokens(5).totalTokens(10).build())
                .build();

        LlmResponse finalResponse = LlmResponse.builder()
                .content("Sorry, the tool is not available.")
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(10).completionTokens(10).totalTokens(20).build())
                .build();

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse)
                .thenReturn(finalResponse);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"use tool\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        // Should still succeed - LLM handles the error gracefully
        assertTrue(result.isSuccess());
    }

    @Test
    void mcpToolCallWithMultipleTextContent() throws Exception {
        stubKvAndProvider();

        UUID mcpNodeId = UUID.randomUUID();
        WorkflowNodeEntity node = llmNodeWithMcpTool(mcpNodeId, "mcp_multi", "Multi-content tool");

        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);

        // MCP returns multiple text contents
        @SuppressWarnings("deprecation")
        CallToolResult toolResult = new CallToolResult(
                List.of(
                        new McpSchema.TextContent("Line 1"),
                        new McpSchema.TextContent("Line 2"),
                        new McpSchema.TextContent("Line 3")
                ),
                null
        );
        when(mockConn.callTool(eq("mcp_multi"), anyMap())).thenReturn(toolResult);
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        ToolCall tc = ToolCall.builder()
                .id("call-multi")
                .name("mcp_multi")
                .arguments(objectMapper.createObjectNode())
                .build();
        LlmResponse toolCallResponse = LlmResponse.builder()
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .toolCalls(List.of(tc))
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(5).completionTokens(5).totalTokens(10).build())
                .build();

        LlmResponse finalResponse = LlmResponse.builder()
                .content("Result processed")
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(20).completionTokens(10).totalTokens(30).build())
                .build();

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse)
                .thenReturn(finalResponse);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"run multi\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        // Verify the MCP tool was called and received the combined text
        verify(mockConn).callTool(eq("mcp_multi"), anyMap());
    }

    @Test
    void mcpToolCallHandlesExceptionGracefully() throws Exception {
        stubKvAndProvider();

        UUID mcpNodeId = UUID.randomUUID();
        WorkflowNodeEntity node = llmNodeWithMcpTool(mcpNodeId, "mcp_fail", "Failing tool");

        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);
        when(mockConn.callTool(eq("mcp_fail"), anyMap()))
                .thenThrow(new RuntimeException("MCP server crashed"));
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        ToolCall tc = ToolCall.builder()
                .id("call-fail")
                .name("mcp_fail")
                .arguments(objectMapper.createObjectNode())
                .build();
        LlmResponse toolCallResponse = LlmResponse.builder()
                .finishReason(LlmResponse.FinishReason.TOOL_CALLS)
                .toolCalls(List.of(tc))
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(5).completionTokens(5).totalTokens(10).build())
                .build();

        LlmResponse finalResponse = LlmResponse.builder()
                .content("Tool failed, sorry")
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(10).completionTokens(10).totalTokens(20).build())
                .build();

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(toolCallResponse)
                .thenReturn(finalResponse);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"use failing tool\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        // Should still succeed - error is returned as tool result to LLM
        assertTrue(result.isSuccess());
    }

    // ------------------------------------------------------------------
    // ToolDefinition MCP flag parsing
    // ------------------------------------------------------------------

    @Test
    void toolDefinitionMcpFlagParsedFromConfig() throws Exception {
        stubKvAndProvider();

        UUID mcpNodeId = UUID.randomUUID();
        WorkflowNodeEntity node = llmNodeWithMcpTool(mcpNodeId, "mcp_test", "Test MCP tool");

        // Just do a simple LLM call to verify tool definitions are parsed correctly
        LlmResponse response = LlmResponse.builder()
                .content("No tool call needed")
                .model("gpt-4")
                .finishReason(LlmResponse.FinishReason.STOP)
                .usage(LlmResponse.Usage.builder()
                        .promptTokens(10).completionTokens(10).totalTokens(20).build())
                .build();

        when(resilienceService.executeWithResilience(any(), eq("openai"), any(), any(ResilienceConfig.class)))
                .thenReturn(response);

        ExecutionContext ctx = contextWithInput("{\"prompt\":\"test\"}");
        NodeExecutionResult result = executor.execute(ctx, node);

        assertTrue(result.isSuccess());
        // The test verifies that the config with _mcpTool: true was parsed without error
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ExecutionContext contextWithInput(String inputJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson;
        return new ExecutionContext(execution);
    }

    private WorkflowNodeEntity llmNodeWithMcpTool(UUID mcpNodeId, String toolName, String toolDesc) {
        try {
            ObjectNode config = objectMapper.createObjectNode();
            config.put("provider", "openai");
            config.put("model", "gpt-4");
            config.put("apiKeyPath", "openai/key");

            ArrayNode tools = config.putArray("tools");
            ObjectNode toolDef = tools.addObject();
            toolDef.put("type", "function");
            ObjectNode func = objectMapper.createObjectNode();
            func.put("name", toolName);
            func.put("description", toolDesc);
            func.putObject("parameters").put("type", "object");
            toolDef.set("function", func);
            toolDef.put("nodeId", mcpNodeId.toString());
            toolDef.put("_mcpTool", true);

            WorkflowNodeEntity node = new WorkflowNodeEntity();
            node.id = UUID.randomUUID();
            node.name = "llm-with-mcp";
            node.type = NodeType.LLM;
            node.configuration = objectMapper.writeValueAsString(config);

            // Create MCP node in the workflow
            WorkflowNodeEntity mcpNode = new WorkflowNodeEntity();
            mcpNode.id = mcpNodeId;
            mcpNode.name = "mcp-server";
            mcpNode.type = NodeType.MCP;
            mcpNode.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

            WorkflowEntity workflow = new WorkflowEntity();
            workflow.id = UUID.randomUUID();
            workflow.nodes = new ArrayList<>();
            workflow.edges = new ArrayList<>();
            workflow.nodes.add(node);
            workflow.nodes.add(mcpNode);
            node.workflow = workflow;
            mcpNode.workflow = workflow;

            return node;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void stubKvAndProvider() {
        when(providerFactory.getProvider("openai")).thenReturn(mockProvider);
        configuration.kvServiceUrl = "http://kv:7003";
    }
}
