package com.nuraly.workflows.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.CancelCallback;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.*;

/**
 * Producer for sending crawl requests to the external crawl service via RabbitMQ.
 * Uses request-reply pattern with temporary reply queues.
 */
@ApplicationScoped
public class CrawlProducer {

    private static final Logger LOG = Logger.getLogger(CrawlProducer.class);
    private static final String REPLY_QUEUE_PREFIX = "crawl.reply.";

    @Inject
    RabbitMQConnectionManager connectionManager;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper;

    // Track pending reply channels for cleanup
    private final ConcurrentHashMap<String, Channel> replyChannels = new ConcurrentHashMap<>();

    public CrawlProducer() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Send crawl request and wait for response (synchronous).
     *
     * @param message   The crawl request message
     * @param timeoutMs Timeout in milliseconds
     * @return The crawl response, or null if timeout
     */
    public CrawlResponseMessage sendCrawlRequest(CrawlRequestMessage message, long timeoutMs) {
        String correlationId = UUID.randomUUID().toString();
        String replyQueueName = null;

        try {
            // Create reply queue
            replyQueueName = createReplyQueue(correlationId);

            // Set reply info on message
            message.setReplyTo(replyQueueName);
            message.setCorrelationId(correlationId);

            // Publish the request
            publishCrawlRequest(message, replyQueueName, correlationId);

            // Wait for reply
            return waitForReply(replyQueueName, correlationId, timeoutMs);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send crawl request: %s", message);
            return createErrorResponse(message.getRequestId(), "Failed to send crawl request: " + e.getMessage());
        } finally {
            // Cleanup
            cleanupReplyQueue(correlationId);
        }
    }

    /**
     * Send crawl request asynchronously (fire and forget).
     */
    public void sendCrawlRequestAsync(CrawlRequestMessage message) {
        try {
            publishCrawlRequest(message, null, null);
            LOG.infof("Published async crawl request: %s", message.getRequestId());
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send async crawl request: %s", message);
            throw new RuntimeException("Failed to send crawl request", e);
        }
    }

    private void publishCrawlRequest(CrawlRequestMessage message, String replyTo, String correlationId) throws IOException {
        try (Channel channel = connectionManager.createChannel()) {
            String messageJson = objectMapper.writeValueAsString(message);

            AMQP.BasicProperties.Builder propsBuilder = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .deliveryMode(2); // Persistent

            if (correlationId != null) {
                propsBuilder.correlationId(correlationId);
            }
            if (replyTo != null) {
                propsBuilder.replyTo(replyTo);
            }

            channel.basicPublish(
                    configuration.rabbitmqExchange,
                    configuration.rabbitmqCrawlRoutingKey,
                    propsBuilder.build(),
                    messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.infof("Published crawl request: requestId=%s, urls=%d, replyTo=%s",
                    message.getRequestId(),
                    message.getUrls() != null ? message.getUrls().size() : 0,
                    replyTo);
        }
    }

    private String createReplyQueue(String correlationId) throws IOException {
        String queueName = REPLY_QUEUE_PREFIX + correlationId;

        Channel channel = connectionManager.createChannel();
        replyChannels.put(correlationId, channel);

        // Declare exclusive, auto-delete queue
        channel.queueDeclare(
                queueName,
                false,  // not durable
                true,   // exclusive
                true,   // auto-delete
                null
        );

        LOG.debugf("Created crawl reply queue: %s", queueName);
        return queueName;
    }

    private CrawlResponseMessage waitForReply(String queueName, String correlationId, long timeoutMs) {
        Channel channel = replyChannels.get(correlationId);
        if (channel == null || !channel.isOpen()) {
            LOG.errorf("Reply channel not found or closed for correlationId: %s", correlationId);
            return createErrorResponse(null, "Reply channel not available");
        }

        CompletableFuture<CrawlResponseMessage> future = new CompletableFuture<>();

        try {
            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    String msgCorrelationId = delivery.getProperties().getCorrelationId();
                    if (correlationId.equals(msgCorrelationId)) {
                        String messageBody = new String(delivery.getBody(), StandardCharsets.UTF_8);
                        CrawlResponseMessage response = objectMapper.readValue(messageBody, CrawlResponseMessage.class);
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
                LOG.debugf("Timeout waiting for crawl reply on queue: %s", queueName);
                channel.basicCancel(consumerTag);
                return createErrorResponse(null, "Crawl request timed out after " + timeoutMs + "ms");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                channel.basicCancel(consumerTag);
                return createErrorResponse(null, "Crawl request interrupted");
            } catch (ExecutionException e) {
                LOG.errorf(e.getCause(), "Error waiting for crawl reply: %s", e.getMessage());
                return createErrorResponse(null, "Error processing crawl response: " + e.getCause().getMessage());
            }

        } catch (IOException e) {
            LOG.errorf(e, "Failed to consume from crawl reply queue: %s", queueName);
            return createErrorResponse(null, "Failed to receive crawl response: " + e.getMessage());
        }
    }

    private void cleanupReplyQueue(String correlationId) {
        Channel channel = replyChannels.remove(correlationId);
        if (channel != null) {
            try {
                if (channel.isOpen()) {
                    channel.close();
                }
                LOG.debugf("Cleaned up crawl reply queue for correlationId: %s", correlationId);
            } catch (Exception e) {
                LOG.debug("Error cleaning up crawl reply channel: " + e.getMessage());
            }
        }
    }

    private CrawlResponseMessage createErrorResponse(String requestId, String errorMessage) {
        CrawlResponseMessage response = new CrawlResponseMessage();
        response.setRequestId(requestId);
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        response.setTotalPages(0);
        response.setTotalCharacters(0);
        return response;
    }
}
