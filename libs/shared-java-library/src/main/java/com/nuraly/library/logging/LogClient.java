package com.nuraly.library.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Client for sending logs to the Journal service via RabbitMQ.
 * Can be injected into any Nuraly service for centralized logging.
 *
 * Usage:
 * <pre>
 * &#64;Inject
 * LogClient logClient;
 *
 * logClient.info("execution", correlationId, Map.of(
 *     "execution_id", execId,
 *     "status", "COMPLETED"
 * ));
 * </pre>
 */
@ApplicationScoped
public class LogClient {

    private static final Logger LOGGER = Logger.getLogger(LogClient.class.getName());
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @ConfigProperty(name = "rabbitmq.host", defaultValue = "rabbitmq")
    String host;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    int port;

    @ConfigProperty(name = "rabbitmq.username", defaultValue = "guest")
    String username;

    @ConfigProperty(name = "rabbitmq.password", defaultValue = "guest")
    String password;

    @ConfigProperty(name = "journal.queue.logs", defaultValue = "journal-logs")
    String queueName;

    @ConfigProperty(name = "journal.service.name", defaultValue = "unknown")
    String serviceName;

    @ConfigProperty(name = "journal.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "journal.async", defaultValue = "true")
    boolean async;

    private Connection connection;
    private Channel channel;

    @PostConstruct
    void init() {
        if (!enabled) {
            return;
        }
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(host);
            factory.setPort(port);
            factory.setUsername(username);
            factory.setPassword(password);

            connection = factory.newConnection();
            channel = connection.createChannel();
            channel.queueDeclare(queueName, true, false, false, null);

            LOGGER.info("Connected to RabbitMQ and declared queue: " + queueName);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to connect to RabbitMQ: " + e.getMessage() + ". Logs will not be published.");
        }
    }

    @PreDestroy
    void cleanup() {
        try {
            if (channel != null && channel.isOpen()) {
                channel.close();
            }
            if (connection != null && connection.isOpen()) {
                connection.close();
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Error closing RabbitMQ connection", e);
        }
    }

    /**
     * Send a log entry with specified level.
     *
     * @param type          Log type (e.g., execution, node, llm, http, error)
     * @param level         Log level (DEBUG, INFO, WARN, ERROR)
     * @param correlationId Correlation ID for tracing (optional)
     * @param data          Flexible payload data
     */
    public void log(String type, String level, UUID correlationId, Map<String, Object> data) {
        if (!enabled) {
            return;
        }

        LogRequest request = new LogRequest();
        request.setTimestamp(Instant.now());
        request.setService(serviceName);
        request.setType(type);
        request.setLevel(level);
        request.setCorrelationId(correlationId);
        request.setData(data);

        if (async) {
            CompletableFuture.runAsync(() -> publishLog(request));
        } else {
            publishLog(request);
        }
    }

    /**
     * Send an INFO level log.
     */
    public void info(String type, UUID correlationId, Map<String, Object> data) {
        log(type, "INFO", correlationId, data);
    }

    /**
     * Send a DEBUG level log.
     */
    public void debug(String type, UUID correlationId, Map<String, Object> data) {
        log(type, "DEBUG", correlationId, data);
    }

    /**
     * Send a WARN level log.
     */
    public void warn(String type, UUID correlationId, Map<String, Object> data) {
        log(type, "WARN", correlationId, data);
    }

    /**
     * Send an ERROR level log.
     */
    public void error(String type, UUID correlationId, Map<String, Object> data) {
        log(type, "ERROR", correlationId, data);
    }

    /**
     * Log a workflow execution event.
     */
    public void logWorkflowExecution(UUID correlationId, String executionId, String workflowId,
                                      String status, Object input, Object output, long durationMs) {
        Map<String, Object> data = new HashMap<>();
        data.put("execution_id", executionId);
        data.put("workflow_id", workflowId);
        data.put("status", status);
        data.put("duration_ms", durationMs);
        if (input != null) data.put("input", input);
        if (output != null) data.put("output", output);

        String level = "FAILED".equals(status) ? "ERROR" : "INFO";
        log("execution", level, correlationId, data);
    }

    /**
     * Log a node execution event.
     */
    public void logNodeExecution(UUID correlationId, String executionId, String nodeId,
                                  String nodeType, String status, Object input, Object output,
                                  long durationMs, String error) {
        Map<String, Object> data = new HashMap<>();
        data.put("execution_id", executionId);
        data.put("node_id", nodeId);
        data.put("node_type", nodeType);
        data.put("status", status);
        data.put("duration_ms", durationMs);
        if (input != null) data.put("input", input);
        if (output != null) data.put("output", output);
        if (error != null) data.put("error", error);

        String level = "FAILED".equals(status) ? "ERROR" : "INFO";
        log("node", level, correlationId, data);
    }

    /**
     * Log an LLM call.
     */
    public void logLLMCall(UUID correlationId, String executionId, String nodeId,
                           String provider, String model, int tokensIn, int tokensOut,
                           long durationMs, String status, String error) {
        Map<String, Object> data = new HashMap<>();
        data.put("execution_id", executionId);
        data.put("node_id", nodeId);
        data.put("provider", provider);
        data.put("model", model);
        data.put("tokens_in", tokensIn);
        data.put("tokens_out", tokensOut);
        data.put("duration_ms", durationMs);
        data.put("status", status);
        if (error != null) data.put("error", error);

        String level = "FAILED".equals(status) ? "ERROR" : "INFO";
        log("llm", level, correlationId, data);
    }

    /**
     * Log an HTTP request/response.
     */
    public void logHttpRequest(UUID correlationId, String method, String path,
                                int statusCode, long durationMs, String userId) {
        Map<String, Object> data = new HashMap<>();
        data.put("method", method);
        data.put("path", path);
        data.put("status_code", statusCode);
        data.put("duration_ms", durationMs);
        if (userId != null) data.put("user_id", userId);

        String level = statusCode >= 500 ? "ERROR" : (statusCode >= 400 ? "WARN" : "INFO");
        log("http", level, correlationId, data);
    }

    /**
     * Send batch of logs. Each log is published as a separate message.
     */
    public void logBatch(List<LogRequest> logs) {
        if (!enabled || logs.isEmpty()) {
            return;
        }

        if (async) {
            CompletableFuture.runAsync(() -> logs.forEach(this::publishLog));
        } else {
            logs.forEach(this::publishLog);
        }
    }

    private void publishLog(LogRequest request) {
        if (channel == null || !channel.isOpen()) {
            LOGGER.fine("RabbitMQ channel not available, skipping log");
            return;
        }

        try {
            String message = objectMapper.writeValueAsString(request);
            channel.basicPublish("", queueName, null, message.getBytes(StandardCharsets.UTF_8));
            LOGGER.fine("Published log to queue: " + queueName);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to publish log to RabbitMQ: " + e.getMessage());
        }
    }
}
