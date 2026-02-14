package com.nuraly.workflows.triggers.connectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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
 * Telegram Bot connector supporting both long-polling and webhook modes.
 *
 * Configuration options:
 * - botToken: Telegram Bot API token (required)
 * - mode: "polling" or "webhook" (optional, default: "polling")
 * - allowedUpdates: List of update types to receive (optional)
 * - pollingTimeout: Long-polling timeout in seconds (optional, default: 30)
 * - allowedChatIds: Comma-separated chat IDs to filter (optional)
 * - allowedUserIds: Comma-separated user IDs to filter (optional)
 */
@ApplicationScoped
public class TelegramConnector implements TriggerConnector {

    private static final Logger LOG = Logger.getLogger(TelegramConnector.class);
    private static final String TELEGRAM_API_BASE = "https://api.telegram.org/bot";

    @ConfigProperty(name = "workflows.trigger.telegram.polling-timeout-s", defaultValue = "30")
    int defaultPollingTimeout;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<UUID, TelegramConnection> connections = new ConcurrentHashMap<>();
    private final Map<UUID, TelegramWebhookConnection> webhookConnections = new ConcurrentHashMap<>();

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
                String mode = config.has("mode") ? config.get("mode").asText() : "polling";

                List<String> allowedUpdates = new ArrayList<>();
                if (config.has("allowedUpdates") && config.get("allowedUpdates").isArray()) {
                    for (JsonNode update : config.get("allowedUpdates")) {
                        allowedUpdates.add(update.asText());
                    }
                }

                if ("webhook".equals(mode)) {
                    connectWebhook(trigger, config, botToken, allowedUpdates, handler);
                } else {
                    connectPolling(trigger, config, botToken, allowedUpdates, handler);
                }

            } catch (Exception e) {
                LOG.errorf(e, "Failed to start Telegram connection for trigger %s", trigger.id);
                throw new RuntimeException("Failed to connect to Telegram", e);
            }
        });
    }

    private void connectPolling(WorkflowTriggerEntity trigger, JsonNode config,
                                String botToken, List<String> allowedUpdates,
                                TriggerMessageHandler handler) {
        int pollingTimeout = config.has("pollingTimeout")
            ? config.get("pollingTimeout").asInt()
            : defaultPollingTimeout;

        // Parse filter config
        Set<Long> allowedChatIds = parseLongSet(config, "allowedChatIds");
        Set<Long> allowedUserIds = parseLongSet(config, "allowedUserIds");

        TelegramConnection connection = new TelegramConnection(
            trigger, botToken, handler, pollingTimeout, allowedUpdates,
            allowedChatIds, allowedUserIds
        );
        connections.put(trigger.id, connection);
        connection.start();

        LOG.infof("Telegram polling connection started for trigger %s", trigger.id);
    }

    private void connectWebhook(WorkflowTriggerEntity trigger, JsonNode config,
                                String botToken, List<String> allowedUpdates,
                                TriggerMessageHandler handler) throws Exception {
        String webhookToken = trigger.webhookToken;
        if (webhookToken == null || webhookToken.isEmpty()) {
            throw new IllegalStateException("Webhook token not generated for trigger " + trigger.id);
        }

        String webhookUrl = configuration.webhookBaseUrl + "/api/v1/webhooks/" + webhookToken;

        // Generate a secret token for this webhook
        String secretToken = UUID.randomUUID().toString().replace("-", "");

        int maxConnections = configuration.telegramWebhookMaxConnections;
        boolean dropPendingUpdates = configuration.telegramWebhookDropPendingUpdates;

        // Parse filter config
        Set<Long> allowedChatIds = parseLongSet(config, "allowedChatIds");
        Set<Long> allowedUserIds = parseLongSet(config, "allowedUserIds");

        // Call Telegram setWebhook API
        setTelegramWebhook(botToken, webhookUrl, secretToken, allowedUpdates,
                           maxConnections, dropPendingUpdates);

        TelegramWebhookConnection webhookConn = new TelegramWebhookConnection(
            trigger, botToken, secretToken, webhookUrl, handler,
            allowedChatIds, allowedUserIds
        );
        webhookConnections.put(trigger.id, webhookConn);

        LOG.infof("Telegram webhook connection started for trigger %s (url: %s)", trigger.id, webhookUrl);
    }

    @Override
    public CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget) {
        return CompletableFuture.runAsync(() -> {
            // Disconnect polling connection
            TelegramConnection connection = connections.remove(trigger.id);
            if (connection != null) {
                connection.stop();
                LOG.infof("Telegram polling connection stopped for trigger %s", trigger.id);
            }

            // Disconnect webhook connection
            TelegramWebhookConnection webhookConn = webhookConnections.remove(trigger.id);
            if (webhookConn != null) {
                try {
                    deleteTelegramWebhook(webhookConn.botToken);
                } catch (Exception e) {
                    LOG.warnf(e, "Failed to delete Telegram webhook for trigger %s", trigger.id);
                }
                LOG.infof("Telegram webhook connection stopped for trigger %s", trigger.id);
            }
        });
    }

    @Override
    public boolean isConnected(WorkflowTriggerEntity trigger) {
        TelegramConnection connection = connections.get(trigger.id);
        if (connection != null && connection.isRunning()) {
            return true;
        }

        TelegramWebhookConnection webhookConn = webhookConnections.get(trigger.id);
        return webhookConn != null;
    }

    @Override
    public HealthStatus checkHealth(WorkflowTriggerEntity trigger) {
        // Check polling connection
        TelegramConnection connection = connections.get(trigger.id);
        if (connection != null) {
            if (!connection.isRunning()) {
                return HealthStatus.unhealthy("Polling connection stopped");
            }

            Instant lastUpdate = connection.getLastUpdateTime();
            if (lastUpdate != null) {
                long secondsSinceUpdate = Instant.now().getEpochSecond() - lastUpdate.getEpochSecond();
                if (secondsSinceUpdate > 120) {
                    return HealthStatus.degraded("No updates in " + secondsSinceUpdate + " seconds");
                }
            }

            return HealthStatus.healthy("Polling active");
        }

        // Check webhook connection
        TelegramWebhookConnection webhookConn = webhookConnections.get(trigger.id);
        if (webhookConn != null) {
            try {
                JsonNode webhookInfo = getWebhookInfo(webhookConn.botToken);
                String currentUrl = webhookInfo.path("result").path("url").asText("");
                if (webhookConn.webhookUrl.equals(currentUrl)) {
                    int pendingCount = webhookInfo.path("result").path("pending_update_count").asInt(0);
                    String lastError = webhookInfo.path("result").path("last_error_message").asText("");
                    if (!lastError.isEmpty()) {
                        return HealthStatus.degraded("Webhook active, last error: " + lastError
                            + ", pending: " + pendingCount);
                    }
                    return HealthStatus.healthy("Webhook active, pending: " + pendingCount);
                } else {
                    return HealthStatus.unhealthy("Webhook URL mismatch: expected "
                        + webhookConn.webhookUrl + " but got " + currentUrl);
                }
            } catch (Exception e) {
                return HealthStatus.degraded("Failed to check webhook info: " + e.getMessage());
            }
        }

        return HealthStatus.unhealthy("Not connected");
    }

    @Override
    public ValidationResult validateConfiguration(JsonNode configuration) {
        ValidationResult result = ValidationResult.valid();

        if (!configuration.has("botToken") || configuration.get("botToken").asText().isEmpty()) {
            result.addError("botToken is required");
        }

        if (configuration.has("mode")) {
            String mode = configuration.get("mode").asText();
            if (!"polling".equals(mode) && !"webhook".equals(mode)) {
                result.addError("mode must be 'polling' or 'webhook'");
            }
        }

        if (configuration.has("pollingTimeout")) {
            int timeout = configuration.get("pollingTimeout").asInt();
            if (timeout < 1 || timeout > 60) {
                result.addWarning("pollingTimeout should be between 1 and 60 seconds");
            }
        }

        return result;
    }

    /**
     * Get the webhook connection for a trigger (used for secret validation).
     */
    public TelegramWebhookConnection getWebhookConnection(UUID triggerId) {
        return webhookConnections.get(triggerId);
    }

    /**
     * Process an incoming webhook update for a trigger.
     */
    public void processWebhookUpdate(UUID triggerId, JsonNode update) {
        TelegramWebhookConnection webhookConn = webhookConnections.get(triggerId);
        if (webhookConn == null) {
            LOG.warnf("No webhook connection found for trigger %s", triggerId);
            return;
        }

        webhookConn.lastUpdateTime = Instant.now();

        // Apply filters
        if (!shouldProcessUpdate(update, webhookConn.allowedChatIds, webhookConn.allowedUserIds)) {
            LOG.debugf("Update filtered out for trigger %s", triggerId);
            return;
        }

        // Process the update
        processUpdate(webhookConn.trigger, update, webhookConn.handler);
    }

    // =====================================================
    // Telegram API helpers
    // =====================================================

    private void setTelegramWebhook(String botToken, String url, String secretToken,
                                     List<String> allowedUpdates, int maxConnections,
                                     boolean dropPendingUpdates) throws Exception {
        String apiUrl = TELEGRAM_API_BASE + botToken + "/setWebhook";

        ObjectNode body = objectMapper.createObjectNode();
        body.put("url", url);
        body.put("secret_token", secretToken);
        body.put("max_connections", maxConnections);
        body.put("drop_pending_updates", dropPendingUpdates);

        if (!allowedUpdates.isEmpty()) {
            ArrayNode arr = body.putArray("allowed_updates");
            allowedUpdates.forEach(arr::add);
        }

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(apiUrl);
            request.setEntity(new StringEntity(
                objectMapper.writeValueAsString(body),
                ContentType.APPLICATION_JSON
            ));

            var response = client.execute(request);
            String responseBody = EntityUtils.toString(response.getEntity());
            JsonNode result = objectMapper.readTree(responseBody);

            if (!result.has("ok") || !result.get("ok").asBoolean()) {
                String description = result.path("description").asText("Unknown error");
                throw new RuntimeException("Failed to set Telegram webhook: " + description);
            }

            LOG.infof("Telegram webhook set successfully: %s", url);
        }
    }

    private void deleteTelegramWebhook(String botToken) throws Exception {
        String apiUrl = TELEGRAM_API_BASE + botToken + "/deleteWebhook";

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpPost request = new HttpPost(apiUrl);
            request.setEntity(new StringEntity("{}", ContentType.APPLICATION_JSON));

            var response = client.execute(request);
            String responseBody = EntityUtils.toString(response.getEntity());
            JsonNode result = objectMapper.readTree(responseBody);

            if (!result.has("ok") || !result.get("ok").asBoolean()) {
                String description = result.path("description").asText("Unknown error");
                LOG.warnf("Failed to delete Telegram webhook: %s", description);
            } else {
                LOG.info("Telegram webhook deleted successfully");
            }
        }
    }

    private JsonNode getWebhookInfo(String botToken) throws Exception {
        String apiUrl = TELEGRAM_API_BASE + botToken + "/getWebhookInfo";

        try (CloseableHttpClient client = HttpClients.createDefault()) {
            HttpGet request = new HttpGet(apiUrl);
            var response = client.execute(request);
            String responseBody = EntityUtils.toString(response.getEntity());
            return objectMapper.readTree(responseBody);
        }
    }

    // =====================================================
    // Filtering
    // =====================================================

    private boolean shouldProcessUpdate(JsonNode update, Set<Long> allowedChatIds, Set<Long> allowedUserIds) {
        if (allowedChatIds.isEmpty() && allowedUserIds.isEmpty()) {
            return true;
        }

        // Extract chat ID and user ID from the update
        Long chatId = extractChatId(update);
        Long userId = extractUserId(update);

        if (!allowedChatIds.isEmpty() && chatId != null && !allowedChatIds.contains(chatId)) {
            return false;
        }

        if (!allowedUserIds.isEmpty() && userId != null && !allowedUserIds.contains(userId)) {
            return false;
        }

        return true;
    }

    private Long extractChatId(JsonNode update) {
        // Check common update structures for chat info
        String[] chatPaths = {"message", "edited_message", "channel_post", "edited_channel_post",
                              "callback_query.message", "my_chat_member", "chat_member", "chat_join_request"};

        for (String path : chatPaths) {
            JsonNode node = update;
            for (String part : path.split("\\.")) {
                node = node.path(part);
            }
            if (!node.isMissingNode() && node.has("chat") && node.get("chat").has("id")) {
                return node.get("chat").get("id").asLong();
            }
        }
        return null;
    }

    private Long extractUserId(JsonNode update) {
        // Check common update structures for user info
        JsonNode message = update.path("message");
        if (!message.isMissingNode() && message.has("from")) {
            return message.get("from").get("id").asLong();
        }

        JsonNode callbackQuery = update.path("callback_query");
        if (!callbackQuery.isMissingNode() && callbackQuery.has("from")) {
            return callbackQuery.get("from").get("id").asLong();
        }

        JsonNode inlineQuery = update.path("inline_query");
        if (!inlineQuery.isMissingNode() && inlineQuery.has("from")) {
            return inlineQuery.get("from").get("id").asLong();
        }

        return null;
    }

    private Set<Long> parseLongSet(JsonNode config, String fieldName) {
        Set<Long> result = new HashSet<>();
        if (config.has(fieldName)) {
            String value = config.get(fieldName).asText("").trim();
            if (!value.isEmpty()) {
                for (String part : value.split(",")) {
                    String trimmed = part.trim();
                    if (!trimmed.isEmpty()) {
                        try {
                            result.add(Long.parseLong(trimmed));
                        } catch (NumberFormatException e) {
                            LOG.warnf("Invalid ID in %s: %s", fieldName, trimmed);
                        }
                    }
                }
            }
        }
        return result;
    }

    // =====================================================
    // Shared update processing
    // =====================================================

    private void processUpdate(WorkflowTriggerEntity trigger, JsonNode update, TriggerMessageHandler handler) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("updateId", update.get("update_id").asLong());
            metadata.put("timestamp", Instant.now());
            metadata.put("source", "telegram");

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
     * Lightweight state holder for webhook connections.
     * No polling thread needed — Telegram pushes updates to the webhook URL.
     */
    public static class TelegramWebhookConnection {
        final WorkflowTriggerEntity trigger;
        final String botToken;
        final String secretToken;
        final String webhookUrl;
        final TriggerMessageHandler handler;
        final Set<Long> allowedChatIds;
        final Set<Long> allowedUserIds;
        final Instant connectedAt;
        volatile Instant lastUpdateTime;

        TelegramWebhookConnection(WorkflowTriggerEntity trigger, String botToken,
                                   String secretToken, String webhookUrl,
                                   TriggerMessageHandler handler,
                                   Set<Long> allowedChatIds, Set<Long> allowedUserIds) {
            this.trigger = trigger;
            this.botToken = botToken;
            this.secretToken = secretToken;
            this.webhookUrl = webhookUrl;
            this.handler = handler;
            this.allowedChatIds = allowedChatIds;
            this.allowedUserIds = allowedUserIds;
            this.connectedAt = Instant.now();
        }

        public String getSecretToken() {
            return secretToken;
        }
    }

    /**
     * Internal class managing a single Telegram bot polling connection.
     */
    private class TelegramConnection {
        private final WorkflowTriggerEntity trigger;
        private final String botToken;
        private final TriggerMessageHandler handler;
        private final int pollingTimeout;
        private final List<String> allowedUpdates;
        private final Set<Long> allowedChatIds;
        private final Set<Long> allowedUserIds;

        private final AtomicBoolean running = new AtomicBoolean(false);
        private final ExecutorService executor = Executors.newSingleThreadExecutor();
        private long lastUpdateId = 0;
        private volatile Instant lastUpdateTime;
        private volatile Instant lastPollTime;

        TelegramConnection(WorkflowTriggerEntity trigger, String botToken,
                          TriggerMessageHandler handler, int pollingTimeout,
                          List<String> allowedUpdates,
                          Set<Long> allowedChatIds, Set<Long> allowedUserIds) {
            this.trigger = trigger;
            this.botToken = botToken;
            this.handler = handler;
            this.pollingTimeout = pollingTimeout;
            this.allowedUpdates = allowedUpdates;
            this.allowedChatIds = allowedChatIds;
            this.allowedUserIds = allowedUserIds;
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

                        // Apply filters
                        if (!shouldProcessUpdate(update, allowedChatIds, allowedUserIds)) {
                            continue;
                        }

                        processUpdate(trigger, update, handler);
                    }

                } catch (Exception e) {
                    if (running.get()) {
                        LOG.errorf(e, "Error in Telegram polling loop for trigger %s", trigger.id);
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
    }
}
