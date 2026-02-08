package com.nuraly.workflows.triggers.connectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.*;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Slack Socket Mode connector using WebSocket.
 *
 * Configuration options:
 * - appToken: Slack App-Level Token (xapp-...) (required)
 * - botToken: Slack Bot Token (xoxb-...) (required for API calls)
 * - eventTypes: List of event types to handle (optional)
 */
@ApplicationScoped
public class SlackSocketConnector implements TriggerConnector {

    private static final Logger LOG = Logger.getLogger(SlackSocketConnector.class);
    private static final String SLACK_CONNECTIONS_OPEN = "https://slack.com/api/apps.connections.open";

    @ConfigProperty(name = "workflows.trigger.slack.reconnect-delay-ms", defaultValue = "5000")
    long reconnectDelayMs;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<UUID, SlackSocketConnection> connections = new ConcurrentHashMap<>();

    @Override
    public Set<TriggerType> getSupportedTypes() {
        return Set.of(TriggerType.SLACK_SOCKET);
    }

    @Override
    public String getResourceKey(WorkflowTriggerEntity trigger) {
        try {
            JsonNode config = objectMapper.readTree(trigger.configuration);
            String appToken = config.get("appToken").asText();
            return "slack_socket:" + hashToken(appToken);
        } catch (Exception e) {
            return "slack_socket:" + trigger.id.toString().substring(0, 8);
        }
    }

    @Override
    public CompletableFuture<Void> connect(WorkflowTriggerEntity trigger, TriggerMessageHandler handler) {
        return CompletableFuture.runAsync(() -> {
            try {
                JsonNode config = objectMapper.readTree(trigger.configuration);
                String appToken = config.get("appToken").asText();
                String botToken = config.has("botToken") ? config.get("botToken").asText() : null;

                SlackSocketConnection connection = new SlackSocketConnection(
                    trigger, appToken, botToken, handler
                );
                connections.put(trigger.id, connection);
                connection.connect();

                LOG.infof("Slack Socket Mode connection started for trigger %s", trigger.id);

            } catch (Exception e) {
                LOG.errorf(e, "Failed to start Slack Socket Mode connection for trigger %s", trigger.id);
                throw new RuntimeException("Failed to connect to Slack", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget) {
        return CompletableFuture.runAsync(() -> {
            SlackSocketConnection connection = connections.remove(trigger.id);
            if (connection != null) {
                connection.disconnect();
                LOG.infof("Slack Socket Mode connection stopped for trigger %s", trigger.id);
            }
        });
    }

    @Override
    public boolean isConnected(WorkflowTriggerEntity trigger) {
        SlackSocketConnection connection = connections.get(trigger.id);
        return connection != null && connection.isConnected();
    }

    @Override
    public HealthStatus checkHealth(WorkflowTriggerEntity trigger) {
        SlackSocketConnection connection = connections.get(trigger.id);
        if (connection == null) {
            return HealthStatus.unhealthy("Not connected");
        }

        if (!connection.isConnected()) {
            return HealthStatus.unhealthy("WebSocket disconnected");
        }

        Instant lastMessage = connection.getLastMessageTime();
        if (lastMessage != null) {
            long secondsSince = Instant.now().getEpochSecond() - lastMessage.getEpochSecond();
            if (secondsSince > 120) {
                return HealthStatus.degraded("No messages in " + secondsSince + " seconds");
            }
        }

        return HealthStatus.healthy("WebSocket connected");
    }

    @Override
    public ValidationResult validateConfiguration(JsonNode configuration) {
        ValidationResult result = ValidationResult.valid();

        if (!configuration.has("appToken") || configuration.get("appToken").asText().isEmpty()) {
            result.addError("appToken is required (Slack App-Level Token starting with xapp-)");
        } else {
            String appToken = configuration.get("appToken").asText();
            if (!appToken.startsWith("xapp-")) {
                result.addWarning("appToken should start with 'xapp-'");
            }
        }

        if (configuration.has("botToken")) {
            String botToken = configuration.get("botToken").asText();
            if (!botToken.startsWith("xoxb-")) {
                result.addWarning("botToken should start with 'xoxb-'");
            }
        }

        return result;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                String hex = Integer.toHexString(0xff & hash[i]);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return token.substring(0, Math.min(token.length(), 8));
        }
    }

    /**
     * Internal class managing a single Slack Socket Mode connection.
     */
    private class SlackSocketConnection {
        private final WorkflowTriggerEntity trigger;
        private final String appToken;
        private final String botToken;
        private final TriggerMessageHandler handler;

        private final AtomicBoolean running = new AtomicBoolean(false);
        private final AtomicBoolean connected = new AtomicBoolean(false);
        private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        private Session webSocketSession;
        private volatile Instant lastMessageTime;

        SlackSocketConnection(WorkflowTriggerEntity trigger, String appToken,
                             String botToken, TriggerMessageHandler handler) {
            this.trigger = trigger;
            this.appToken = appToken;
            this.botToken = botToken;
            this.handler = handler;
        }

        void connect() {
            running.set(true);
            doConnect();
        }

        void disconnect() {
            running.set(false);
            scheduler.shutdownNow();
            closeWebSocket();
        }

        boolean isConnected() {
            return connected.get() && webSocketSession != null && webSocketSession.isOpen();
        }

        Instant getLastMessageTime() {
            return lastMessageTime;
        }

        private void doConnect() {
            try {
                // Get WebSocket URL from Slack
                String wsUrl = getWebSocketUrl();
                if (wsUrl == null) {
                    scheduleReconnect();
                    return;
                }

                // Connect via WebSocket
                WebSocketContainer container = ContainerProvider.getWebSocketContainer();
                webSocketSession = container.connectToServer(
                    new SlackWebSocketClient(),
                    URI.create(wsUrl)
                );

                connected.set(true);
                LOG.infof("Slack WebSocket connected for trigger %s", trigger.id);

            } catch (Exception e) {
                LOG.errorf(e, "Failed to connect Slack WebSocket for trigger %s", trigger.id);
                connected.set(false);
                scheduleReconnect();
            }
        }

        private String getWebSocketUrl() {
            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpPost request = new HttpPost(SLACK_CONNECTIONS_OPEN);
                request.addHeader("Authorization", "Bearer " + appToken);
                request.addHeader("Content-Type", "application/x-www-form-urlencoded");

                var response = client.execute(request);
                String responseBody = EntityUtils.toString(response.getEntity());

                JsonNode result = objectMapper.readTree(responseBody);
                if (result.has("ok") && result.get("ok").asBoolean() && result.has("url")) {
                    return result.get("url").asText();
                }

                LOG.warnf("Failed to get Slack WebSocket URL: %s",
                    result.path("error").asText("unknown error"));
                return null;

            } catch (Exception e) {
                LOG.errorf(e, "Error getting Slack WebSocket URL");
                return null;
            }
        }

        private void scheduleReconnect() {
            if (running.get()) {
                LOG.infof("Scheduling Slack reconnect in %dms for trigger %s", reconnectDelayMs, trigger.id);
                scheduler.schedule(this::doConnect, reconnectDelayMs, TimeUnit.MILLISECONDS);
            }
        }

        private void closeWebSocket() {
            if (webSocketSession != null) {
                try {
                    webSocketSession.close();
                } catch (Exception e) {
                    LOG.warnf("Error closing WebSocket: %s", e.getMessage());
                }
                webSocketSession = null;
            }
            connected.set(false);
        }

        @ClientEndpoint
        private class SlackWebSocketClient {

            @OnOpen
            public void onOpen(Session session) {
                LOG.infof("Slack WebSocket opened for trigger %s", trigger.id);
            }

            @OnMessage
            public void onMessage(String message) {
                try {
                    lastMessageTime = Instant.now();
                    JsonNode event = objectMapper.readTree(message);

                    String type = event.path("type").asText();

                    switch (type) {
                        case "hello" -> handleHello(event);
                        case "disconnect" -> handleDisconnect(event);
                        case "events_api" -> handleEventsApi(event);
                        case "interactive" -> handleInteractive(event);
                        case "slash_commands" -> handleSlashCommand(event);
                        default -> LOG.debugf("Unknown Slack message type: %s", type);
                    }

                } catch (Exception e) {
                    LOG.errorf(e, "Error processing Slack WebSocket message");
                }
            }

            @OnClose
            public void onClose(Session session, CloseReason reason) {
                LOG.infof("Slack WebSocket closed for trigger %s: %s", trigger.id, reason.getReasonPhrase());
                connected.set(false);
                scheduleReconnect();
            }

            @OnError
            public void onError(Session session, Throwable error) {
                LOG.errorf(error, "Slack WebSocket error for trigger %s", trigger.id);
                connected.set(false);
                scheduleReconnect();
            }

            private void handleHello(JsonNode event) {
                LOG.infof("Received Slack hello for trigger %s, connection_info: %s",
                    trigger.id, event.path("connection_info"));
            }

            private void handleDisconnect(JsonNode event) {
                String reason = event.path("reason").asText("unknown");
                LOG.infof("Received Slack disconnect for trigger %s: %s", trigger.id, reason);
                closeWebSocket();
                scheduleReconnect();
            }

            private void handleEventsApi(JsonNode event) {
                try {
                    // Acknowledge the event
                    String envelopeId = event.path("envelope_id").asText();
                    sendAck(envelopeId);

                    // Extract payload
                    JsonNode payload = event.path("payload");

                    // Build metadata
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("envelopeId", envelopeId);
                    metadata.put("timestamp", Instant.now());
                    metadata.put("source", "slack_socket");
                    metadata.put("eventType", payload.path("event").path("type").asText());

                    if (payload.has("team_id")) {
                        metadata.put("teamId", payload.get("team_id").asText());
                    }
                    if (payload.path("event").has("user")) {
                        metadata.put("userId", payload.path("event").get("user").asText());
                    }
                    if (payload.path("event").has("channel")) {
                        metadata.put("channelId", payload.path("event").get("channel").asText());
                    }

                    // Pass to handler
                    handler.handleMessage(trigger, payload, metadata)
                        .exceptionally(e -> {
                            LOG.errorf(e, "Error handling Slack event for trigger %s", trigger.id);
                            return null;
                        });

                } catch (Exception e) {
                    LOG.errorf(e, "Error handling Slack events_api message");
                }
            }

            private void handleInteractive(JsonNode event) {
                try {
                    String envelopeId = event.path("envelope_id").asText();
                    sendAck(envelopeId);

                    JsonNode payload = event.path("payload");

                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("envelopeId", envelopeId);
                    metadata.put("timestamp", Instant.now());
                    metadata.put("source", "slack_socket");
                    metadata.put("interactionType", payload.path("type").asText());

                    handler.handleMessage(trigger, payload, metadata);

                } catch (Exception e) {
                    LOG.errorf(e, "Error handling Slack interactive message");
                }
            }

            private void handleSlashCommand(JsonNode event) {
                try {
                    String envelopeId = event.path("envelope_id").asText();
                    sendAck(envelopeId);

                    JsonNode payload = event.path("payload");

                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("envelopeId", envelopeId);
                    metadata.put("timestamp", Instant.now());
                    metadata.put("source", "slack_socket");
                    metadata.put("command", payload.path("command").asText());

                    handler.handleMessage(trigger, payload, metadata);

                } catch (Exception e) {
                    LOG.errorf(e, "Error handling Slack slash command");
                }
            }

            private void sendAck(String envelopeId) {
                try {
                    ObjectNode ack = objectMapper.createObjectNode();
                    ack.put("envelope_id", envelopeId);
                    webSocketSession.getBasicRemote().sendText(objectMapper.writeValueAsString(ack));
                } catch (Exception e) {
                    LOG.warnf("Failed to send Slack ack: %s", e.getMessage());
                }
            }
        }
    }
}
