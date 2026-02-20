package com.nuraly.workflows.triggers.connectors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.HealthStatus;
import com.nuraly.workflows.triggers.ValidationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class McpConnectorTest {

    private McpConnector connector;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        connector = new McpConnector();
    }

    // ------------------------------------------------------------------
    // Supported types
    // ------------------------------------------------------------------

    @Test
    void supportsMcpTriggerType() {
        Set<TriggerType> types = connector.getSupportedTypes();
        assertEquals(1, types.size());
        assertTrue(types.contains(TriggerType.MCP));
    }

    // ------------------------------------------------------------------
    // Resource key
    // ------------------------------------------------------------------

    @Test
    void resourceKeyBasedOnServerUrl() {
        WorkflowTriggerEntity trigger = createTrigger(
                "{\"serverUrl\":\"http://localhost:3000/mcp\"}");

        String key = connector.getResourceKey(trigger);
        assertTrue(key.startsWith("mcp:"));
        assertEquals(20, key.length()); // "mcp:" + 16 hex chars
    }

    @Test
    void resourceKeyDifferentForDifferentUrls() {
        WorkflowTriggerEntity trigger1 = createTrigger(
                "{\"serverUrl\":\"http://server-a/mcp\"}");
        WorkflowTriggerEntity trigger2 = createTrigger(
                "{\"serverUrl\":\"http://server-b/mcp\"}");

        assertNotEquals(
                connector.getResourceKey(trigger1),
                connector.getResourceKey(trigger2)
        );
    }

    @Test
    void resourceKeySameForSameUrl() {
        WorkflowTriggerEntity trigger1 = createTrigger(
                "{\"serverUrl\":\"http://same-server/mcp\"}");
        WorkflowTriggerEntity trigger2 = createTrigger(
                "{\"serverUrl\":\"http://same-server/mcp\"}");

        assertEquals(
                connector.getResourceKey(trigger1),
                connector.getResourceKey(trigger2)
        );
    }

    @Test
    void resourceKeyFallbackOnBadConfig() {
        WorkflowTriggerEntity trigger = new WorkflowTriggerEntity();
        trigger.id = UUID.randomUUID();
        trigger.configuration = "not json";

        String key = connector.getResourceKey(trigger);
        assertTrue(key.startsWith("mcp:"));
    }

    // ------------------------------------------------------------------
    // Configuration validation
    // ------------------------------------------------------------------

    @Test
    void validConfigurationAccepted() {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("serverUrl", "http://localhost:3000/mcp");
        config.put("transportType", "streamable_http");

        ValidationResult result = connector.validateConfiguration(config);
        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void validConfigurationWithSseTransport() {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("serverUrl", "http://localhost:3000/sse");
        config.put("transportType", "sse");

        ValidationResult result = connector.validateConfiguration(config);
        assertTrue(result.isValid());
    }

    @Test
    void missingServerUrlRejected() {
        ObjectNode config = objectMapper.createObjectNode();

        ValidationResult result = connector.validateConfiguration(config);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("serverUrl")));
    }

    @Test
    void emptyServerUrlRejected() {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("serverUrl", "");

        ValidationResult result = connector.validateConfiguration(config);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("serverUrl")));
    }

    @Test
    void invalidTransportTypeRejected() {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("serverUrl", "http://localhost:3000/mcp");
        config.put("transportType", "websocket");

        ValidationResult result = connector.validateConfiguration(config);
        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("transportType")));
    }

    @Test
    void missingTransportTypeAccepted() {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("serverUrl", "http://localhost:3000/mcp");

        ValidationResult result = connector.validateConfiguration(config);
        assertTrue(result.isValid());
    }

    // ------------------------------------------------------------------
    // Health check (no active connection)
    // ------------------------------------------------------------------

    @Test
    void healthUnhealthyWhenNotConnected() {
        WorkflowTriggerEntity trigger = createTrigger(
                "{\"serverUrl\":\"http://localhost:3000/mcp\"}");

        HealthStatus health = connector.checkHealth(trigger);
        assertEquals(HealthStatus.Status.UNHEALTHY, health.getStatus());
        assertTrue(health.getMessage().contains("Not connected"));
    }

    // ------------------------------------------------------------------
    // isConnected (no active connection)
    // ------------------------------------------------------------------

    @Test
    void notConnectedByDefault() {
        WorkflowTriggerEntity trigger = createTrigger(
                "{\"serverUrl\":\"http://localhost:3000/mcp\"}");

        assertFalse(connector.isConnected(trigger));
    }

    // ------------------------------------------------------------------
    // getConnection
    // ------------------------------------------------------------------

    @Test
    void getConnectionReturnsNullForUnknownTrigger() {
        assertNull(connector.getConnection(UUID.randomUUID()));
    }

    // ------------------------------------------------------------------
    // getConnectionForNode
    // ------------------------------------------------------------------

    @Test
    void getConnectionForNodeReturnsNullWhenNodeIsNull() {
        assertNull(connector.getConnectionForNode(null));
    }

    @Test
    void getConnectionForNodeReturnsNullWhenWorkflowIsNull() {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.MCP;
        node.workflow = null;

        assertNull(connector.getConnectionForNode(node));
    }

    @Test
    void getConnectionForNodeReturnsNullWhenNoTriggers() {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.MCP;
        node.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.triggers = new ArrayList<>();
        node.workflow = workflow;

        assertNull(connector.getConnectionForNode(node));
    }

    @Test
    void getConnectionForNodeReturnsNullWhenTriggersAreNull() {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.MCP;
        node.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.triggers = null;
        node.workflow = workflow;

        assertNull(connector.getConnectionForNode(node));
    }

    @Test
    void getConnectionForNodeReturnsNullWhenTriggerNotConnected() {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.MCP;
        node.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

        WorkflowTriggerEntity trigger = new WorkflowTriggerEntity();
        trigger.id = UUID.randomUUID();
        trigger.type = TriggerType.MCP;
        trigger.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.triggers = List.of(trigger);
        node.workflow = workflow;

        // No active connection exists in the connector
        assertNull(connector.getConnectionForNode(node));
    }

    @Test
    void getConnectionForNodeSkipsNonMcpTriggers() {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.MCP;
        node.configuration = "{\"serverUrl\":\"http://localhost:3000/mcp\"}";

        WorkflowTriggerEntity telegramTrigger = new WorkflowTriggerEntity();
        telegramTrigger.id = UUID.randomUUID();
        telegramTrigger.type = TriggerType.TELEGRAM_BOT;
        telegramTrigger.configuration = "{\"botToken\":\"abc\"}";

        WorkflowEntity workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.triggers = List.of(telegramTrigger);
        node.workflow = workflow;

        assertNull(connector.getConnectionForNode(node));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private WorkflowTriggerEntity createTrigger(String config) {
        WorkflowTriggerEntity trigger = new WorkflowTriggerEntity();
        trigger.id = UUID.randomUUID();
        trigger.type = TriggerType.MCP;
        trigger.configuration = config;
        return trigger;
    }
}
