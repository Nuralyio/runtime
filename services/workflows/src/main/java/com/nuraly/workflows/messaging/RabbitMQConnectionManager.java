package com.nuraly.workflows.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.HttpWorkflowResponse;
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
import java.util.Map;
import java.util.concurrent.*;

@ApplicationScoped
public class RabbitMQConnectionManager {

    private static final Logger LOG = Logger.getLogger(RabbitMQConnectionManager.class);
    private static final String REPLY_QUEUE_PREFIX = "workflow.reply.";

    @Inject
    Configuration configuration;

    private Connection connection;
    private final Object connectionLock = new Object();
    private final ObjectMapper objectMapper;

    // Track pending reply consumers for cleanup
    private final ConcurrentHashMap<String, Channel> replyChannels = new ConcurrentHashMap<>();

    public RabbitMQConnectionManager() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    void onStart(@Observes @Priority(1) StartupEvent ev) {
        try {
            initializeConnection();
            declareExchangeAndQueues();
            LOG.info("RabbitMQ connection initialized successfully");
        } catch (Exception e) {
            LOG.error("Failed to initialize RabbitMQ connection: " + e.getMessage(), e);
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        // Cleanup any remaining reply channels
        for (Map.Entry<String, Channel> entry : replyChannels.entrySet()) {
            try {
                if (entry.getValue().isOpen()) {
                    entry.getValue().close();
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
    }

    private void declareExchangeAndQueues() throws IOException, TimeoutException {
        try (Channel channel = connection.createChannel()) {
            // Declare direct exchange
            channel.exchangeDeclare(configuration.rabbitmqExchange, "direct", true);

            // Declare executions queue (durable, with dead-letter queue)
            channel.queueDeclare(configuration.rabbitmqExecutionsQueue, true, false, false, null);
            channel.queueBind(configuration.rabbitmqExecutionsQueue, configuration.rabbitmqExchange,
                    configuration.rabbitmqExecutionsRoutingKey);

            // Declare events queue
            channel.queueDeclare(configuration.rabbitmqEventsQueue, true, false, false, null);
            channel.queueBind(configuration.rabbitmqEventsQueue, configuration.rabbitmqExchange, "workflow.event");

            // Declare crawl requests queue (consumed by external crawl service)
            channel.queueDeclare(configuration.rabbitmqCrawlRequestsQueue, true, false, false, null);
            channel.queueBind(configuration.rabbitmqCrawlRequestsQueue, configuration.rabbitmqExchange,
                    configuration.rabbitmqCrawlRoutingKey);

            LOG.info("RabbitMQ exchange and queues declared successfully");
        }
    }

    public Connection getConnection() {
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

    public Channel createChannel() throws IOException {
        return getConnection().createChannel();
    }

    /**
     * Check if the RabbitMQ connection is currently open.
     * Used for health checks.
     */
    public boolean isConnected() {
        synchronized (connectionLock) {
            return connection != null && connection.isOpen();
        }
    }

    /**
     * Create a temporary reply queue for synchronous execution.
     * The queue is exclusive and auto-delete.
     *
     * @param correlationId Unique correlation ID for this request
     * @return The queue name
     */
    public String createReplyQueue(String correlationId) throws IOException {
        String queueName = REPLY_QUEUE_PREFIX + correlationId;

        Channel channel = createChannel();
        replyChannels.put(correlationId, channel);

        // Declare exclusive, auto-delete queue
        channel.queueDeclare(
                queueName,
                false,  // not durable
                true,   // exclusive
                true,   // auto-delete
                null
        );

        LOG.debugf("Created reply queue: %s", queueName);
        return queueName;
    }

    /**
     * Wait for a reply on the specified queue with timeout.
     *
     * @param queueName     The reply queue name
     * @param correlationId The correlation ID to match
     * @param timeoutMs     Timeout in milliseconds
     * @return The HTTP workflow response, or null if timeout
     */
    public HttpWorkflowResponse waitForReply(String queueName, String correlationId, long timeoutMs) {
        Channel channel = replyChannels.get(correlationId);
        if (channel == null || !channel.isOpen()) {
            LOG.errorf("Reply channel not found or closed for correlationId: %s", correlationId);
            return null;
        }

        CompletableFuture<HttpWorkflowResponse> future = new CompletableFuture<>();

        try {
            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    // Verify correlation ID matches
                    String msgCorrelationId = delivery.getProperties().getCorrelationId();
                    if (correlationId.equals(msgCorrelationId)) {
                        String messageBody = new String(delivery.getBody(), StandardCharsets.UTF_8);
                        HttpWorkflowResponse response = objectMapper.readValue(messageBody, HttpWorkflowResponse.class);
                        future.complete(response);
                    } else {
                        LOG.warnf("Received message with wrong correlationId. Expected: %s, Got: %s",
                                correlationId, msgCorrelationId);
                    }
                } catch (Exception e) {
                    future.completeExceptionally(e);
                }
            };

            CancelCallback cancelCallback = consumerTag -> {
                if (!future.isDone()) {
                    future.completeExceptionally(new RuntimeException("Consumer cancelled"));
                }
            };

            // Start consuming
            String consumerTag = channel.basicConsume(queueName, true, deliverCallback, cancelCallback);

            try {
                // Wait for response with timeout
                return future.get(timeoutMs, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                LOG.debugf("Timeout waiting for reply on queue: %s", queueName);
                channel.basicCancel(consumerTag);
                return null;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                channel.basicCancel(consumerTag);
                return null;
            } catch (ExecutionException e) {
                LOG.errorf(e.getCause(), "Error waiting for reply: %s", e.getMessage());
                return null;
            }

        } catch (IOException e) {
            LOG.errorf(e, "Failed to consume from reply queue: %s", queueName);
            return null;
        }
    }

    /**
     * Publish a reply to the specified queue.
     *
     * @param replyTo       The reply queue name
     * @param correlationId The correlation ID
     * @param response      The HTTP workflow response
     */
    public void publishReply(String replyTo, String correlationId, HttpWorkflowResponse response) {
        try (Channel channel = createChannel()) {
            String messageJson = objectMapper.writeValueAsString(response);

            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .correlationId(correlationId)
                    .build();

            // Publish directly to the reply queue (no exchange, empty routing key = queue name)
            channel.basicPublish(
                    "",       // Default exchange
                    replyTo,  // Queue name as routing key
                    properties,
                    messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.debugf("Published reply to queue: %s, correlationId: %s", replyTo, correlationId);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to publish reply to queue: %s", replyTo);
        }
    }

    /**
     * Cleanup reply queue and channel.
     *
     * @param correlationId The correlation ID
     */
    public void cleanupReplyQueue(String correlationId) {
        Channel channel = replyChannels.remove(correlationId);
        if (channel != null) {
            try {
                if (channel.isOpen()) {
                    // Queue will be auto-deleted when channel closes
                    channel.close();
                }
                LOG.debugf("Cleaned up reply queue for correlationId: %s", correlationId);
            } catch (Exception e) {
                LOG.debug("Error cleaning up reply channel: " + e.getMessage());
            }
        }
    }

    private void closeConnection() {
        synchronized (connectionLock) {
            if (connection != null && connection.isOpen()) {
                try {
                    connection.close();
                    LOG.info("RabbitMQ connection closed");
                } catch (IOException e) {
                    LOG.error("Error closing RabbitMQ connection: " + e.getMessage(), e);
                }
            }
        }
    }
}
