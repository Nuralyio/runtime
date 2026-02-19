package com.nuraly.workflows.triggers.connectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.*;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MCP Server connector - maintains persistent connections to MCP servers.
 *
 * Implements TriggerConnector to integrate with TriggerManagerService lifecycle.
 * Also exposes getConnectionForNode() for Agent/LLM nodes to access MCP tools.
 *
 * Configuration options:
 * - serverUrl: MCP server URL (required)
 * - transportType: "streamable_http" or "sse" (optional, default: "streamable_http")
 */
@ApplicationScoped
public class McpConnector implements TriggerConnector {

    private static final Logger LOG = Logger.getLogger(McpConnector.class);

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<UUID, McpConnection> connections = new ConcurrentHashMap<>();

    @Override
    public Set<TriggerType> getSupportedTypes() {
        return Set.of(TriggerType.MCP);
    }

    @Override
    public String getResourceKey(WorkflowTriggerEntity trigger) {
        try {
            JsonNode config = objectMapper.readTree(trigger.configuration);
            String serverUrl = config.get("serverUrl").asText();
            return "mcp:" + hashString(serverUrl);
        } catch (Exception e) {
            return "mcp:" + trigger.id.toString().substring(0, 8);
        }
    }

    @Override
    public CompletableFuture<Void> connect(WorkflowTriggerEntity trigger, TriggerMessageHandler handler) {
        return CompletableFuture.runAsync(() -> {
            try {
                JsonNode config = objectMapper.readTree(trigger.configuration);
                String serverUrl = config.get("serverUrl").asText();
                String transportType = config.has("transportType")
                        ? config.get("transportType").asText()
                        : "streamable_http";

                McpConnection connection = new McpConnection(serverUrl, transportType);
                connection.connect();

                connections.put(trigger.id, connection);

                // Notify handler that MCP server is connected (with tool list as payload)
                if (handler != null) {
                    ObjectNode message = objectMapper.createObjectNode();
                    message.put("event", "mcp_connected");
                    message.put("serverUrl", serverUrl);
                    message.put("toolCount", connection.getTools() != null
                            ? connection.getTools().tools().size() : 0);

                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("source", "mcp");
                    metadata.put("timestamp", Instant.now());

                    handler.handleMessage(trigger, message, metadata);
                }

                LOG.infof("MCP connection started for trigger %s -> %s", trigger.id, serverUrl);

            } catch (Exception e) {
                LOG.errorf(e, "Failed to start MCP connection for trigger %s", trigger.id);
                throw new RuntimeException("Failed to connect to MCP server", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget) {
        return CompletableFuture.runAsync(() -> {
            McpConnection connection = connections.remove(trigger.id);
            if (connection != null) {
                connection.disconnect();
                LOG.infof("MCP connection stopped for trigger %s", trigger.id);
            }
        });
    }

    @Override
    public boolean isConnected(WorkflowTriggerEntity trigger) {
        McpConnection connection = connections.get(trigger.id);
        return connection != null && connection.isConnected();
    }

    @Override
    public HealthStatus checkHealth(WorkflowTriggerEntity trigger) {
        McpConnection connection = connections.get(trigger.id);
        if (connection == null) {
            return HealthStatus.unhealthy("Not connected");
        }

        if (!connection.isConnected()) {
            String error = connection.getLastError();
            return HealthStatus.unhealthy(error != null ? error : "Connection lost");
        }

        int toolCount = connection.getTools() != null ? connection.getTools().tools().size() : 0;
        return HealthStatus.healthy("Connected, " + toolCount + " tools available");
    }

    @Override
    public ValidationResult validateConfiguration(JsonNode configuration) {
        ValidationResult result = ValidationResult.valid();

        if (!configuration.has("serverUrl") || configuration.get("serverUrl").asText().isEmpty()) {
            result.addError("serverUrl is required");
        }

        if (configuration.has("transportType")) {
            String transport = configuration.get("transportType").asText();
            if (!"streamable_http".equals(transport) && !"sse".equals(transport)) {
                result.addError("transportType must be 'streamable_http' or 'sse'");
            }
        }

        return result;
    }

    // =====================================================
    // Public API for Agent/LLM nodes
    // =====================================================

    /**
     * Get the MCP connection for a given trigger ID.
     * Used by Agent/LLM nodes to access MCP tools.
     */
    public McpConnection getConnection(UUID triggerId) {
        return connections.get(triggerId);
    }

    /**
     * Get the MCP connection for a workflow node.
     * Looks up the MCP trigger for the workflow and returns its connection.
     */
    public McpConnection getConnectionForNode(WorkflowNodeEntity node) {
        if (node == null || node.workflow == null || node.workflow.triggers == null) {
            return null;
        }

        // Try to match by MCP node configuration (serverUrl) against trigger config
        String nodeServerUrl = extractServerUrl(node);

        for (var trigger : node.workflow.triggers) {
            if (trigger.type == TriggerType.MCP) {
                McpConnection conn = connections.get(trigger.id);
                if (conn != null && conn.isConnected()) {
                    // If we have a serverUrl, match it
                    if (nodeServerUrl != null && nodeServerUrl.equals(conn.getServerUrl())) {
                        return conn;
                    }
                    // Otherwise return the first connected MCP trigger
                    if (nodeServerUrl == null) {
                        return conn;
                    }
                }
            }
        }

        return null;
    }

    private String extractServerUrl(WorkflowNodeEntity node) {
        if (node.configuration == null) return null;
        try {
            JsonNode config = objectMapper.readTree(node.configuration);
            return config.has("serverUrl") ? config.get("serverUrl").asText() : null;
        } catch (Exception e) {
            return null;
        }
    }

    // =====================================================
    // Internal helpers
    // =====================================================

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return input.substring(0, Math.min(input.length(), 16));
        }
    }
}
