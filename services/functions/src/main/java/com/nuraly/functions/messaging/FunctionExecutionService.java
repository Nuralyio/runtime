package com.nuraly.functions.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.functions.configuration.Configuration;
import com.rabbitmq.client.*;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

/**
 * Service for executing functions via RabbitMQ and Deno workers.
 *
 * Publishes execution requests to the functions.execute queue and
 * consumes results from the functions.results queue.
 */
@ApplicationScoped
public class FunctionExecutionService {

    private static final Logger LOG = Logger.getLogger(FunctionExecutionService.class);
    private static final String REPLY_QUEUE_PREFIX = "functions.reply.";

    @Inject
    Configuration configuration;

    private Connection connection;
    private Channel publishChannel;
    private Channel consumeChannel;
    private final Object connectionLock = new Object();
    private final ObjectMapper objectMapper;

    // Pending results waiting for completion
    private final ConcurrentHashMap<String, CompletableFuture<ExecutionResult>> pendingResults = new ConcurrentHashMap<>();

    // Reply channels for synchronous execution
    private final ConcurrentHashMap<String, Channel> replyChannels = new ConcurrentHashMap<>();

    private volatile boolean initialized = false;
    private volatile boolean shuttingDown = false;

    public FunctionExecutionService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    void onStart(@Observes @Priority(1) StartupEvent ev) {
        try {
            initializeConnection();
            declareQueues();
            startResultsConsumer();
            initialized = true;
            LOG.info("FunctionExecutionService initialized successfully");
        } catch (Exception e) {
            LOG.error("Failed to initialize FunctionExecutionService: " + e.getMessage(), e);
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        shuttingDown = true;

        // Complete all pending futures with timeout
        for (Map.Entry<String, CompletableFuture<ExecutionResult>> entry : pendingResults.entrySet()) {
            entry.getValue().completeExceptionally(new RuntimeException("Service shutting down"));
        }
        pendingResults.clear();

        // Cleanup reply channels
        for (Channel channel : replyChannels.values()) {
            try {
                if (channel.isOpen()) {
                    channel.close();
                }
            } catch (Exception e) {
                LOG.debug("Error closing reply channel: " + e.getMessage());
            }
        }
        replyChannels.clear();

        closeConnection();
    }

    private void initializeConnection() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(configuration.rabbitmqHost);
        factory.setPort(configuration.rabbitmqPort);
        configuration.rabbitmqUsername.ifPresent(factory::setUsername);
        configuration.rabbitmqPassword.ifPresent(factory::setPassword);
        factory.setAutomaticRecoveryEnabled(true);
        factory.setNetworkRecoveryInterval(5000);

        this.connection = factory.newConnection();
        this.publishChannel = connection.createChannel();
        this.consumeChannel = connection.createChannel();

        LOG.infof("Connected to RabbitMQ at %s:%d", configuration.rabbitmqHost, configuration.rabbitmqPort);
    }

    private void declareQueues() throws IOException {
        // Declare execute queue with DLQ
        publishChannel.queueDeclare(
            configuration.functionsExecuteQueue,
            true,  // durable
            false, // not exclusive
            false, // no auto-delete
            Map.of(
                "x-dead-letter-exchange", "",
                "x-dead-letter-routing-key", configuration.functionsDlqQueue
            )
        );

        // Declare results queue
        publishChannel.queueDeclare(
            configuration.functionsResultsQueue,
            true,
            false,
            false,
            null
        );

        // Declare DLQ
        publishChannel.queueDeclare(
            configuration.functionsDlqQueue,
            true,
            false,
            false,
            null
        );

        LOG.infof("Declared queues: %s, %s, %s",
            configuration.functionsExecuteQueue,
            configuration.functionsResultsQueue,
            configuration.functionsDlqQueue);
    }

    private void startResultsConsumer() throws IOException {
        consumeChannel.basicConsume(
            configuration.functionsResultsQueue,
            false, // manual ack
            (consumerTag, delivery) -> {
                try {
                    String messageBody = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    ExecutionResult result = objectMapper.readValue(messageBody, ExecutionResult.class);

                    String correlationId = result.correlationId();
                    CompletableFuture<ExecutionResult> future = pendingResults.remove(correlationId);

                    if (future != null) {
                        future.complete(result);
                        LOG.debugf("Completed result for correlationId: %s", correlationId);
                    } else {
                        LOG.warnf("Received result for unknown correlationId: %s", correlationId);
                    }

                    consumeChannel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

                } catch (Exception e) {
                    LOG.errorf(e, "Error processing execution result");
                    consumeChannel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
                }
            },
            consumerTag -> LOG.warn("Results consumer cancelled")
        );

        LOG.info("Started results consumer on queue: " + configuration.functionsResultsQueue);
    }

    /**
     * Execute a function asynchronously via Deno workers.
     *
     * @param functionId The function UUID
     * @param functionName The function name (for context)
     * @param handler The JavaScript handler code
     * @param inputJson The input data as JSON
     * @return CompletableFuture that completes with the execution result
     */
    public CompletableFuture<ExecutionResult> executeAsync(
            String functionId,
            String functionName,
            String handler,
            Object inputBody) {

        if (!initialized) {
            return CompletableFuture.failedFuture(
                new RuntimeException("FunctionExecutionService not initialized")
            );
        }

        String correlationId = UUID.randomUUID().toString();
        String invocationId = UUID.randomUUID().toString();

        // Build message
        ExecuteMessage.Context context = new ExecuteMessage.Context(
            functionId,
            functionName,
            invocationId
        );

        ExecuteMessage.Input input = new ExecuteMessage.Input(inputBody, context);

        List<String> allowedHosts = Arrays.asList(
            configuration.denoDefaultAllowedHosts.split(",")
        );

        ExecuteMessage.Permissions permissions = new ExecuteMessage.Permissions(
            allowedHosts,
            List.of() // No env vars allowed by default
        );

        ExecuteMessage message = new ExecuteMessage(
            correlationId,
            functionId,
            invocationId,
            handler,
            input,
            configuration.denoExecutionTimeoutMs,
            permissions
        );

        // Create future and register it
        CompletableFuture<ExecutionResult> future = new CompletableFuture<>();
        pendingResults.put(correlationId, future);

        // Set timeout for the future
        future.orTimeout(configuration.functionsResultTimeoutMs, TimeUnit.MILLISECONDS)
            .exceptionally(ex -> {
                pendingResults.remove(correlationId);
                LOG.warnf("Execution timed out for correlationId: %s", correlationId);
                return new ExecutionResult(
                    correlationId,
                    false,
                    null,
                    "Execution timed out after " + configuration.functionsResultTimeoutMs + "ms",
                    null,
                    configuration.functionsResultTimeoutMs
                );
            });

        // Publish message
        try {
            String messageJson = objectMapper.writeValueAsString(message);

            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                .contentType("application/json")
                .correlationId(correlationId)
                .deliveryMode(2) // persistent
                .build();

            publishChannel.basicPublish(
                "",
                configuration.functionsExecuteQueue,
                properties,
                messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.debugf("Published execution request: correlationId=%s, functionId=%s", correlationId, functionId);

        } catch (Exception e) {
            pendingResults.remove(correlationId);
            future.completeExceptionally(e);
        }

        return future;
    }

    /**
     * Execute a function synchronously (blocking).
     *
     * @param functionId The function UUID
     * @param functionName The function name (for context)
     * @param handler The JavaScript handler code
     * @param inputBody The input data
     * @return The execution result as JSON string
     * @throws Exception if execution fails
     */
    public String executeSync(
            String functionId,
            String functionName,
            String handler,
            Object inputBody) throws Exception {

        ExecutionResult result = executeAsync(functionId, functionName, handler, inputBody)
            .get(configuration.functionsResultTimeoutMs, TimeUnit.MILLISECONDS);

        if (!result.success()) {
            String errorMsg = result.error() != null ? result.error() : "Unknown error";
            if (result.stack() != null) {
                errorMsg += "\n" + result.stack();
            }
            throw new RuntimeException("Function execution failed: " + errorMsg);
        }

        // Return result as JSON string
        return objectMapper.writeValueAsString(result.result());
    }

    /**
     * Check if the service is initialized and ready.
     */
    public boolean isReady() {
        return initialized && !shuttingDown && connection != null && connection.isOpen();
    }

    private Connection getConnection() {
        synchronized (connectionLock) {
            if (connection == null || !connection.isOpen()) {
                try {
                    initializeConnection();
                } catch (Exception e) {
                    LOG.error("Failed to reconnect to RabbitMQ: " + e.getMessage(), e);
                    throw new RuntimeException("Failed to connect to RabbitMQ", e);
                }
            }
            return connection;
        }
    }

    private void closeConnection() {
        synchronized (connectionLock) {
            try {
                if (publishChannel != null && publishChannel.isOpen()) {
                    publishChannel.close();
                }
                if (consumeChannel != null && consumeChannel.isOpen()) {
                    consumeChannel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                    LOG.info("RabbitMQ connection closed");
                }
            } catch (Exception e) {
                LOG.error("Error closing RabbitMQ connection: " + e.getMessage(), e);
            }
        }
    }
}
