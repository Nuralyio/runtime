package com.nuraly.workflows.triggers.connectors;

import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientSseClientTransport;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.spec.McpSchema.CallToolRequest;
import io.modelcontextprotocol.spec.McpSchema.CallToolResult;
import io.modelcontextprotocol.spec.McpSchema.ListToolsResult;
import io.modelcontextprotocol.spec.McpClientTransport;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Persistent MCP client connection wrapper.
 *
 * Maintains a long-lived connection to an MCP server, caches tool definitions,
 * and provides callTool() for Agent/LLM nodes. Auto-reconnects on failure.
 */
public class McpConnection {

    private static final Logger LOG = Logger.getLogger(McpConnection.class);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);
    private static final long RECONNECT_DELAY_SECONDS = 10;

    private final String serverUrl;
    private final String transportType; // "streamable_http" or "sse"

    private final AtomicReference<McpSyncClient> clientRef = new AtomicReference<>();
    private final AtomicReference<ListToolsResult> cachedTools = new AtomicReference<>();
    private final AtomicBoolean connected = new AtomicBoolean(false);
    private final AtomicBoolean closed = new AtomicBoolean(false);
    private volatile Instant connectedAt;
    private volatile Instant lastToolCallAt;
    private volatile String lastError;

    private ScheduledExecutorService reconnectExecutor;

    public McpConnection(String serverUrl, String transportType) {
        this.serverUrl = serverUrl;
        this.transportType = transportType != null ? transportType : "streamable_http";
    }

    /**
     * Connect to the MCP server and cache available tools.
     */
    public void connect() {
        if (closed.get()) {
            throw new IllegalStateException("Connection has been closed");
        }

        try {
            LOG.infof("Connecting to MCP server: %s (transport: %s)", serverUrl, transportType);

            McpClientTransport transport = createTransport();

            McpSyncClient newClient = McpClient.sync(transport)
                    .requestTimeout(REQUEST_TIMEOUT)
                    .build();

            newClient.initialize();
            clientRef.set(newClient);

            // Cache tools on connect
            refreshTools();

            connected.set(true);
            connectedAt = Instant.now();
            lastError = null;

            // Start reconnect watcher
            startReconnectWatcher();

            LOG.infof("Connected to MCP server: %s (%d tools available)",
                    serverUrl, cachedTools.get() != null ? cachedTools.get().tools().size() : 0);

        } catch (Exception e) {
            connected.set(false);
            lastError = e.getMessage();
            LOG.errorf(e, "Failed to connect to MCP server: %s", serverUrl);
            throw new IllegalStateException("Failed to connect to MCP server: " + serverUrl, e);
        }
    }

    /**
     * Refresh the cached tool list from the MCP server.
     */
    public void refreshTools() {
        if (clientRef.get() == null) return;
        try {
            ListToolsResult tools = clientRef.get().listTools();
            cachedTools.set(tools);
            LOG.debugf("Refreshed MCP tools: %d tools available", tools.tools().size());
        } catch (Exception e) {
            LOG.warnf("Failed to refresh MCP tools: %s", e.getMessage());
        }
    }

    /**
     * Get cached tool definitions from the MCP server.
     */
    public ListToolsResult getTools() {
        return cachedTools.get();
    }

    /**
     * Call a tool on the MCP server.
     */
    public CallToolResult callTool(String name, Map<String, Object> arguments) {
        if (!connected.get() || clientRef.get() == null) {
            throw new IllegalStateException("Not connected to MCP server");
        }

        try {
            lastToolCallAt = Instant.now();
            return clientRef.get().callTool(new CallToolRequest(name, arguments));
        } catch (Exception e) {
            LOG.errorf("MCP tool call failed: %s - %s", name, e.getMessage());
            // Mark as disconnected if it's a connection error
            if (isConnectionError(e)) {
                connected.set(false);
                lastError = "Connection lost during tool call: " + e.getMessage();
            }
            throw new IllegalStateException("MCP tool call failed: " + name, e);
        }
    }

    /**
     * Gracefully disconnect from the MCP server.
     */
    public void disconnect() {
        closed.set(true);
        connected.set(false);

        if (reconnectExecutor != null) {
            reconnectExecutor.shutdownNow();
            reconnectExecutor = null;
        }

        closeClientQuietly(clientRef.getAndSet(null));

        cachedTools.set(null);
        LOG.infof("Disconnected from MCP server: %s", serverUrl);
    }

    public boolean isConnected() {
        return connected.get() && !closed.get();
    }

    public String getServerUrl() {
        return serverUrl;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public Instant getLastToolCallAt() {
        return lastToolCallAt;
    }

    public String getLastError() {
        return lastError;
    }

    // =====================================================
    // Internal helpers
    // =====================================================

    private McpClientTransport createTransport() {
        if ("sse".equalsIgnoreCase(transportType)) {
            return HttpClientSseClientTransport.builder(serverUrl).build();
        }
        // Default: Streamable HTTP
        return HttpClientStreamableHttpTransport.builder(serverUrl).build();
    }

    private void startReconnectWatcher() {
        if (reconnectExecutor != null) {
            reconnectExecutor.shutdownNow();
        }
        reconnectExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "mcp-reconnect-" + serverUrl.hashCode());
            t.setDaemon(true);
            return t;
        });

        reconnectExecutor.scheduleWithFixedDelay(() -> {
            if (closed.get()) return;
            if (!connected.get()) {
                LOG.infof("Attempting MCP reconnect to: %s", serverUrl);
                try {
                    McpClientTransport transport = createTransport();
                    McpSyncClient newClient = McpClient.sync(transport)
                            .requestTimeout(REQUEST_TIMEOUT)
                            .build();
                    newClient.initialize();

                    // Swap client
                    McpSyncClient oldClient = clientRef.getAndSet(newClient);
                    refreshTools();
                    connected.set(true);
                    lastError = null;

                    closeClientQuietly(oldClient);

                    LOG.infof("MCP reconnect successful: %s", serverUrl);
                } catch (Exception e) {
                    lastError = "Reconnect failed: " + e.getMessage();
                    LOG.warnf("MCP reconnect failed for %s: %s", serverUrl, e.getMessage());
                }
            }
        }, RECONNECT_DELAY_SECONDS, RECONNECT_DELAY_SECONDS, TimeUnit.SECONDS);
    }

    private static void closeClientQuietly(McpSyncClient client) {
        if (client != null) {
            try {
                client.close();
            } catch (Exception e) {
                LOG.warnf("Error closing MCP client: %s", e.getMessage());
            }
        }
    }

    private boolean isConnectionError(Exception e) {
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        return msg.contains("connection") || msg.contains("timeout") ||
               msg.contains("refused") || msg.contains("reset") ||
               msg.contains("closed") || msg.contains("eof");
    }
}
