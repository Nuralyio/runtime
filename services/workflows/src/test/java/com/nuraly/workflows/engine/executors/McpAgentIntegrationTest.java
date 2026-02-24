package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.service.WorkflowEventService;
import com.nuraly.workflows.test.WorkflowBuilder;
import com.nuraly.workflows.triggers.connectors.McpConnection;
import com.nuraly.workflows.triggers.connectors.McpConnector;
import io.modelcontextprotocol.spec.McpSchema;
import io.modelcontextprotocol.spec.McpSchema.ListToolsResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests that Agent correctly discovers and passes MCP tools to the LLM executor.
 * Uses the same pattern as WorkflowExecutionTest.
 */
@ExtendWith(MockitoExtension.class)
class McpAgentIntegrationTest {

    @Mock
    private LlmNodeExecutor llmExecutor;

    @Mock
    private ToolNodeExecutor toolExecutor;

    @Mock
    private WorkflowEventService eventService;

    @Mock
    private ContextMemoryStore contextMemoryStore;

    @Mock
    private McpConnector mcpConnector;

    @InjectMocks
    private AgentNodeExecutor agentExecutor;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ObjectNode cannedLlmOutput;

    @BeforeEach
    void setUp() {
        cannedLlmOutput = objectMapper.createObjectNode();
        cannedLlmOutput.put("content", "I called the MCP tool.");
        cannedLlmOutput.put("response", "I called the MCP tool.");
    }

    // ------------------------------------------------------------------
    // Helper: create an MCP Tool using the builder API
    // ------------------------------------------------------------------

    private McpSchema.Tool mcpTool(String name, String description, McpSchema.JsonSchema inputSchema) {
        return McpSchema.Tool.builder()
                .name(name)
                .description(description)
                .inputSchema(inputSchema)
                .build();
    }

    private McpSchema.JsonSchema jsonSchema(String type) {
        return new McpSchema.JsonSchema(type, null, null, null, null, null);
    }

    private McpSchema.JsonSchema objectSchema() {
        return jsonSchema("object");
    }

    // ------------------------------------------------------------------
    // MCP tool discovery
    // ------------------------------------------------------------------

    @Test
    void agentDiscoversMcpToolsFromConnectedNode() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-tools")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp","transportType":"streamable_http"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        // Mock MCP connection with 2 tools
        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);
        when(mockConn.getTools()).thenReturn(new ListToolsResult(List.of(
                mcpTool("get_weather", "Get weather for a location", objectSchema()),
                mcpTool("search", "Search the web", objectSchema())
        ), null));
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        // Capture LLM call to verify tools were passed
        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);

            assertTrue(config.has("tools"), "merged config should contain tools");
            assertEquals(2, config.get("tools").size(), "should have 2 MCP tools");

            // Verify tool format
            JsonNode tool0 = config.get("tools").get(0);
            assertEquals("function", tool0.get("type").asText());
            assertEquals("get_weather", tool0.get("function").get("name").asText());
            assertEquals("Get weather for a location", tool0.get("function").get("description").asText());
            assertTrue(tool0.has("_mcpTool"), "tool should be tagged as MCP");
            assertTrue(tool0.get("_mcpTool").asBoolean());
            assertTrue(tool0.has("nodeId"), "tool should have nodeId");

            JsonNode tool1 = config.get("tools").get(1);
            assertEquals("search", tool1.get("function").get("name").asText());

            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"What's the weather?\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
        verify(mcpConnector).getConnectionForNode(wf.node("mcp"));
    }

    @Test
    void agentSkipsMcpNodeWhenNotConnected() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-disconnected")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        // MCP connection is not connected
        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(false);
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            // No tools should be present since MCP is disconnected
            assertFalse(config.has("tools"), "disconnected MCP should not add tools");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentSkipsMcpNodeWhenConnectionIsNull() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-null-conn")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        // No connection exists
        when(mcpConnector.getConnectionForNode(any())).thenReturn(null);

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertFalse(config.has("tools"), "null connection should not add tools");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"hi\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentMixesMcpAndRegularTools() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-mixed-tools")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .node("tool", NodeType.TOOL, """
                        {"toolName":"calculator","description":"Do math"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .edge("tool", "out", "agent", "tools")
                .build();

        // Mock MCP connection with 1 tool
        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);
        when(mockConn.getTools()).thenReturn(new ListToolsResult(List.of(
                mcpTool("mcp_search", "Search via MCP", objectSchema())
        ), null));
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        // Regular tool executor returns a tool definition
        when(toolExecutor.execute(any(), any())).thenAnswer(inv -> {
            ObjectNode toolDef = objectMapper.createObjectNode();
            toolDef.put("type", "function");
            ObjectNode func = objectMapper.createObjectNode();
            func.put("name", "calculator");
            func.put("description", "Do math");
            toolDef.set("function", func);
            return NodeExecutionResult.success(toolDef);
        });

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertTrue(config.has("tools"), "merged config should contain tools");
            assertEquals(2, config.get("tools").size(), "should have 1 MCP + 1 regular tool");

            // Find MCP tool and regular tool
            boolean foundMcp = false, foundRegular = false;
            for (JsonNode tool : config.get("tools")) {
                String name = tool.get("function").get("name").asText();
                if ("mcp_search".equals(name)) {
                    assertTrue(tool.has("_mcpTool"), "MCP tool should be tagged");
                    foundMcp = true;
                }
                if ("calculator".equals(name)) {
                    foundRegular = true;
                }
            }
            assertTrue(foundMcp, "should have MCP tool");
            assertTrue(foundRegular, "should have regular tool");

            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"calculate and search\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentHandlesMcpToolWithNullDescription() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-null-desc")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);
        when(mockConn.getTools()).thenReturn(new ListToolsResult(List.of(
                mcpTool("no_desc_tool", null, null)
        ), null));
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);

            assertTrue(config.has("tools"));
            JsonNode tool = config.get("tools").get(0);
            assertEquals("no_desc_tool", tool.get("function").get("name").asText());
            // Null description should be replaced with empty string
            assertEquals("", tool.get("function").get("description").asText());

            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"test\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    @Test
    void agentHandlesMcpToolDiscoveryException() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-error")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        // MCP connection throws during tool discovery
        when(mcpConnector.getConnectionForNode(any()))
                .thenThrow(new RuntimeException("Connection timeout"));

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            // Agent should gracefully skip the erroring MCP node
            assertFalse(config.has("tools"), "erroring MCP should not add tools");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"test\"}"), wf.node("agent"));

        assertTrue(result.isSuccess(), "Agent should handle MCP discovery errors gracefully");
    }

    @Test
    void agentHandlesMcpToolsWithNullToolsList() throws Exception {
        WorkflowBuilder.Result wf = WorkflowBuilder.create("mcp-null-tools")
                .node("agent", NodeType.AGENT)
                .node("llm", NodeType.AGENT_LLM, """
                        {"provider":"openai","model":"gpt-4","apiKeyPath":"openai/key"}""")
                .node("mcp", NodeType.MCP, """
                        {"serverUrl":"http://localhost:3000/mcp"}""")
                .edge("llm", "out", "agent", "llm")
                .edge("mcp", "out", "agent", "tools")
                .build();

        McpConnection mockConn = mock(McpConnection.class);
        when(mockConn.isConnected()).thenReturn(true);
        when(mockConn.getTools()).thenReturn(null); // No tools cached yet
        when(mcpConnector.getConnectionForNode(any())).thenReturn(mockConn);

        when(llmExecutor.execute(any(), any())).thenAnswer(inv -> {
            WorkflowNodeEntity tempNode = inv.getArgument(1);
            JsonNode config = objectMapper.readTree(tempNode.configuration);
            assertFalse(config.has("tools"), "null tools should not add tools");
            return NodeExecutionResult.success(cannedLlmOutput);
        });

        NodeExecutionResult result = agentExecutor.execute(
                contextWithInput("{\"query\":\"test\"}"), wf.node("agent"));

        assertTrue(result.isSuccess());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private ExecutionContext contextWithInput(String inputJson) {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = inputJson;
        return new ExecutionContext(execution);
    }
}
