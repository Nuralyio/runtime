package com.nuraly.workflows.triggers.connectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.*;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Telegram Bot connector using long-polling.
 *
 * Configuration options:
 * - botToken: Telegram Bot API token (required)
 * - allowedUpdates: List of update types to receive (optional)
 * - pollingTimeout: Long-polling timeout in seconds (optional, default: 30)
 */
@ApplicationScoped
public class TelegramConnector implements TriggerConnector {

    private static final Logger LOG = Logger.getLogger(TelegramConnector.class);
    private static final String TELEGRAM_API_BASE = "https://api.telegram.org/bot";

    @ConfigProperty(name = "workflows.trigger.telegram.polling-timeout-s", defaultValue = "30")
    int defaultPollingTimeout;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<UUID, TelegramConnection> connections = new ConcurrentHashMap<>();

    @Override
    public Set<TriggerType> getSupportedTypes() {
        return Set.of(TriggerType.TELEGRAM_BOT);
    }

    @Override
    public String getResourceKey(WorkflowTriggerEntity trigger) {
        try {
            JsonNode config = objectMapper.readTree(trigger.configuration);
            String botToken = config.get("botToken").asText();
            // Hash the token for the key (don't expose full token)
            return "telegram:" + hashToken(botToken);
        } catch (Exception e) {
            return "telegram:" + trigger.id.toString().substring(0, 8);
        }
    }

    @Override
    public CompletableFuture<Void> connect(WorkflowTriggerEntity trigger, TriggerMessageHandler handler) {
        return CompletableFuture.runAsync(() -> {
            try {
                JsonNode config = objectMapper.readTree(trigger.configuration);
                String botToken = config.get("botToken").asText();

                int pollingTimeout = config.has("pollingTimeout")
                    ? config.get("pollingTimeout").asInt()
                    : defaultPollingTimeout;

                List<String> allowedUpdates = new ArrayList<>();
                if (config.has("allowedUpdates") && config.get("allowedUpdates").isArray()) {
                    for (JsonNode update : config.get("allowedUpdates")) {
                        allowedUpdates.add(update.asText());
                    }
                }

                TelegramConnection connection = new TelegramConnection(
                    trigger, botToken, handler, pollingTimeout, allowedUpdates
                );
                connections.put(trigger.id, connection);
                connection.start();

                LOG.infof("Telegram connection started for trigger %s", trigger.id);

            } catch (Exception e) {
                LOG.errorf(e, "Failed to start Telegram connection for trigger %s", trigger.id);
                throw new RuntimeException("Failed to connect to Telegram", e);
            }
        });
    }

    @Override
    public CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget) {
        return CompletableFuture.runAsync(() -> {
            TelegramConnection connection = connections.remove(trigger.id);
            if (connection != null) {
                connection.stop();
                LOG.infof("Telegram connection stopped for trigger %s", trigger.id);
            }
        });
    }

    @Override
    public boolean isConnected(WorkflowTriggerEntity trigger) {
        TelegramConnection connection = connections.get(trigger.id);
        return connection != null && connection.isRunning();
    }

    @Override
    public HealthStatus checkHealth(WorkflowTriggerEntity trigger) {
        TelegramConnection connection = connections.get(trigger.id);
        if (connection == null) {
            return HealthStatus.unhealthy("Not connected");
        }

        if (!connection.isRunning()) {
            return HealthStatus.unhealthy("Connection stopped");
        }

        // Check if we've received updates recently
        Instant lastUpdate = connection.getLastUpdateTime();
        if (lastUpdate != null) {
            long secondsSinceUpdate = Instant.now().getEpochSecond() - lastUpdate.getEpochSecond();
            if (secondsSinceUpdate > 120) {
                return HealthStatus.degraded("No updates in " + secondsSinceUpdate + " seconds");
            }
        }

        return HealthStatus.healthy("Polling active");
    }

    @Override
    public ValidationResult validateConfiguration(JsonNode configuration) {
        ValidationResult result = ValidationResult.valid();

        if (!configuration.has("botToken") || configuration.get("botToken").asText().isEmpty()) {
            result.addError("botToken is required");
        }

        if (configuration.has("pollingTimeout")) {
            int timeout = configuration.get("pollingTimeout").asInt();
            if (timeout < 1 || timeout > 60) {
                result.addWarning("pollingTimeout should be between 1 and 60 seconds");
            }
        }

        return result;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (int i = 0; i < 8; i++) { // First 8 bytes = 16 hex chars
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
     * Internal class managing a single Telegram bot connection.
     */
    private class TelegramConnection {
        private final WorkflowTriggerEntity trigger;
        private final String botToken;
        private final TriggerMessageHandler handler;
        private final int pollingTimeout;
        private final List<String> allowedUpdates;

        private final AtomicBoolean running = new AtomicBoolean(false);
        private final ExecutorService executor = Executors.newSingleThreadExecutor();
        private long lastUpdateId = 0;
        private volatile Instant lastUpdateTime;
        private volatile Instant lastPollTime;

        TelegramConnection(WorkflowTriggerEntity trigger, String botToken,
                          TriggerMessageHandler handler, int pollingTimeout,
                          List<String> allowedUpdates) {
            this.trigger = trigger;
            this.botToken = botToken;
            this.handler = handler;
            this.pollingTimeout = pollingTimeout;
            this.allowedUpdates = allowedUpdates;
        }

        void start() {
            running.set(true);
            executor.submit(this::pollingLoop);
        }

        void stop() {
            running.set(false);
            executor.shutdownNow();
        }

        boolean isRunning() {
            return running.get();
        }

        Instant getLastUpdateTime() {
            return lastUpdateTime;
        }

        private void pollingLoop() {
            LOG.infof("Starting Telegram polling loop for trigger %s", trigger.id);

            while (running.get()) {
                try {
                    List<JsonNode> updates = getUpdates();
                    lastPollTime = Instant.now();

                    for (JsonNode update : updates) {
                        if (!running.get()) break;

                        long updateId = update.get("update_id").asLong();
                        lastUpdateId = updateId;
                        lastUpdateTime = Instant.now();

                        // Process update asynchronously
                        processUpdate(update);
                    }

                } catch (Exception e) {
                    if (running.get()) {
                        LOG.errorf(e, "Error in Telegram polling loop for trigger %s", trigger.id);
                        // Back off on error
                        try {
                            Thread.sleep(5000);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                }
            }

            LOG.infof("Telegram polling loop ended for trigger %s", trigger.id);
        }

        private List<JsonNode> getUpdates() throws Exception {
            String url = TELEGRAM_API_BASE + botToken + "/getUpdates";

            // Build request body
            ObjectNode body = objectMapper.createObjectNode();
            body.put("offset", lastUpdateId + 1);
            body.put("timeout", pollingTimeout);

            if (!allowedUpdates.isEmpty()) {
                ArrayNode arr = body.putArray("allowed_updates");
                allowedUpdates.forEach(arr::add);
            }

            try (CloseableHttpClient client = HttpClients.createDefault()) {
                HttpPost request = new HttpPost(url);
                request.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(body),
                    ContentType.APPLICATION_JSON
                ));

                var response = client.execute(request);
                String responseBody = EntityUtils.toString(response.getEntity());

                JsonNode result = objectMapper.readTree(responseBody);
                if (result.has("ok") && result.get("ok").asBoolean() && result.has("result")) {
                    List<JsonNode> updates = new ArrayList<>();
                    for (JsonNode update : result.get("result")) {
                        updates.add(update);
                    }
                    return updates;
                }

                if (result.has("error_code")) {
                    LOG.warnf("Telegram API error: %s - %s",
                        result.get("error_code").asInt(),
                        result.path("description").asText());
                }

                return Collections.emptyList();
            }
        }

        private void processUpdate(JsonNode update) {
            try {
                // Build metadata
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("updateId", update.get("update_id").asLong());
                metadata.put("timestamp", Instant.now());
                metadata.put("source", "telegram");

                // Determine update type
                String updateType = determineUpdateType(update);
                metadata.put("updateType", updateType);

                // Extract chat/user info
                JsonNode message = update.path("message");
                if (!message.isMissingNode()) {
                    if (message.has("chat")) {
                        metadata.put("chatId", message.get("chat").get("id").asLong());
                        metadata.put("chatType", message.get("chat").path("type").asText());
                    }
                    if (message.has("from")) {
                        metadata.put("userId", message.get("from").get("id").asLong());
                        metadata.put("username", message.get("from").path("username").asText());
                    }
                }

                // Pass to handler
                handler.handleMessage(trigger, update, metadata)
                    .exceptionally(e -> {
                        LOG.errorf(e, "Error handling Telegram update for trigger %s", trigger.id);
                        return null;
                    });

            } catch (Exception e) {
                LOG.errorf(e, "Error processing Telegram update for trigger %s", trigger.id);
            }
        }

        private String determineUpdateType(JsonNode update) {
            if (update.has("message")) return "message";
            if (update.has("edited_message")) return "edited_message";
            if (update.has("channel_post")) return "channel_post";
            if (update.has("edited_channel_post")) return "edited_channel_post";
            if (update.has("inline_query")) return "inline_query";
            if (update.has("chosen_inline_result")) return "chosen_inline_result";
            if (update.has("callback_query")) return "callback_query";
            if (update.has("shipping_query")) return "shipping_query";
            if (update.has("pre_checkout_query")) return "pre_checkout_query";
            if (update.has("poll")) return "poll";
            if (update.has("poll_answer")) return "poll_answer";
            if (update.has("my_chat_member")) return "my_chat_member";
            if (update.has("chat_member")) return "chat_member";
            if (update.has("chat_join_request")) return "chat_join_request";
            return "unknown";
        }
    }
}
