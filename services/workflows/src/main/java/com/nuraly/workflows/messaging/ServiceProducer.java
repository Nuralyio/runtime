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
 * Producer for sending service requests via RabbitMQ.
 * Supports request-reply pattern with temporary reply queues.
 *
 * Used for external services: OCR, Crawl, etc.
 */
@ApplicationScoped
public class ServiceProducer {

    private static final Logger LOG = Logger.getLogger(ServiceProducer.class);
    private static final String REPLY_QUEUE_PREFIX = "service.reply.";

    @Inject
    RabbitMQConnectionManager connectionManager;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, Channel> replyChannels = new ConcurrentHashMap<>();

    public ServiceProducer() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Send service request and wait for response (synchronous).
     *
     * @param serviceType Service type ("ocr", "crawl")
     * @param message     The service request message
     * @param timeoutMs   Timeout in milliseconds
     * @return The service response, or error response if timeout/failure
     */
    public ServiceResponseMessage sendRequest(String serviceType, ServiceRequestMessage message, long timeoutMs) {
        String correlationId = UUID.randomUUID().toString();
        String replyQueueName = null;

        try {
            // Create reply queue
            replyQueueName = createReplyQueue(correlationId);

            // Set reply info
            message.setReplyTo(replyQueueName);
            message.setCorrelationId(correlationId);
            message.setServiceType(serviceType);

            // Get queue name for service type
            String queueName = getQueueName(serviceType);
            String routingKey = getRoutingKey(serviceType);

            // Publish the request
            publishRequest(message, queueName, routingKey, replyQueueName, correlationId);

            // Wait for reply
            return waitForReply(replyQueueName, correlationId, serviceType, timeoutMs);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to send %s request: %s", serviceType, message);
            return ServiceResponseMessage.failure(message.getRequestId(), serviceType,
                    "Failed to send request: " + e.getMessage());
        } finally {
            cleanupReplyQueue(correlationId);
        }
    }

    /**
     * Send service request asynchronously (fire and forget).
     */
    public void sendRequestAsync(String serviceType, ServiceRequestMessage message) {
        try {
            message.setServiceType(serviceType);
            String queueName = getQueueName(serviceType);
            String routingKey = getRoutingKey(serviceType);
            publishRequest(message, queueName, routingKey, null, null);
            LOG.infof("Published async %s request: %s", serviceType, message.getRequestId());
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send async %s request: %s", serviceType, message);
            throw new RuntimeException("Failed to send " + serviceType + " request", e);
        }
    }

    private String getQueueName(String serviceType) {
        return switch (serviceType.toLowerCase()) {
            case "ocr" -> configuration.rabbitmqOcrQueue;
            case "crawl" -> configuration.rabbitmqCrawlQueue;
            default -> "service-" + serviceType;
        };
    }

    private String getRoutingKey(String serviceType) {
        return switch (serviceType.toLowerCase()) {
            case "ocr" -> configuration.rabbitmqOcrRoutingKey;
            case "crawl" -> configuration.rabbitmqCrawlRoutingKey;
            default -> "service." + serviceType;
        };
    }

    private void publishRequest(ServiceRequestMessage message, String queueName, String routingKey,
                                 String replyTo, String correlationId) throws IOException {
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
                    routingKey,
                    propsBuilder.build(),
                    messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.infof("Published %s request: requestId=%s, queue=%s, replyTo=%s",
                    message.getServiceType(), message.getRequestId(), queueName, replyTo);
        }
    }

    private String createReplyQueue(String correlationId) throws IOException {
        String queueName = REPLY_QUEUE_PREFIX + correlationId;

        Channel channel = connectionManager.createChannel();
        replyChannels.put(correlationId, channel);

        // Declare exclusive, auto-delete queue
        channel.queueDeclare(queueName, false, true, true, null);

        LOG.debugf("Created service reply queue: %s", queueName);
        return queueName;
    }

    private ServiceResponseMessage waitForReply(String queueName, String correlationId,
                                                  String serviceType, long timeoutMs) {
        Channel channel = replyChannels.get(correlationId);
        if (channel == null || !channel.isOpen()) {
            return ServiceResponseMessage.failure(null, serviceType, "Reply channel not available");
        }

        CompletableFuture<ServiceResponseMessage> future = new CompletableFuture<>();

        try {
            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    String msgCorrelationId = delivery.getProperties().getCorrelationId();
                    if (correlationId.equals(msgCorrelationId)) {
                        String messageBody = new String(delivery.getBody(), StandardCharsets.UTF_8);
                        ServiceResponseMessage response = objectMapper.readValue(messageBody, ServiceResponseMessage.class);
                        future.complete(response);
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

            String consumerTag = channel.basicConsume(queueName, true, deliverCallback, cancelCallback);

            try {
                return future.get(timeoutMs, TimeUnit.MILLISECONDS);
            } catch (TimeoutException e) {
                channel.basicCancel(consumerTag);
                return ServiceResponseMessage.failure(null, serviceType,
                        "Request timed out after " + timeoutMs + "ms");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                channel.basicCancel(consumerTag);
                return ServiceResponseMessage.failure(null, serviceType, "Request interrupted");
            } catch (ExecutionException e) {
                return ServiceResponseMessage.failure(null, serviceType,
                        "Error processing response: " + e.getCause().getMessage());
            }

        } catch (IOException e) {
            return ServiceResponseMessage.failure(null, serviceType,
                    "Failed to receive response: " + e.getMessage());
        }
    }

    private void cleanupReplyQueue(String correlationId) {
        Channel channel = replyChannels.remove(correlationId);
        if (channel != null) {
            try {
                if (channel.isOpen()) {
                    channel.close();
                }
            } catch (Exception e) {
                LOG.debug("Error cleaning up reply channel: " + e.getMessage());
            }
        }
    }
}
