package com.nuraly.workflows.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.HttpWorkflowResponse;
import com.nuraly.workflows.engine.WorkflowEngine;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.service.WorkflowEventService;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class WorkflowExecutionConsumer {

    private static final Logger LOG = Logger.getLogger(WorkflowExecutionConsumer.class);

    @Inject
    RabbitMQConnectionManager connectionManager;

    @Inject
    Configuration configuration;

    @Inject
    WorkflowEngine workflowEngine;

    @Inject
    WorkflowEventService eventService;

    private final ObjectMapper objectMapper;
    private Channel consumerChannel;
    private String consumerTag;

    public WorkflowExecutionConsumer() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    void onStart(@Observes @Priority(10) StartupEvent ev) {
        startConsuming();
    }

    void onStop(@Observes ShutdownEvent ev) {
        stopConsuming();
    }

    private void startConsuming() {
        try {
            consumerChannel = connectionManager.createChannel();
            consumerChannel.basicQos(1); // Process one message at a time

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String messageBody = new String(delivery.getBody(), StandardCharsets.UTF_8);
                long deliveryTag = delivery.getEnvelope().getDeliveryTag();

                // Extract replyTo and correlationId from message properties
                String replyTo = delivery.getProperties().getReplyTo();
                String correlationId = delivery.getProperties().getCorrelationId();

                try {
                    WorkflowExecutionMessage message = objectMapper.readValue(messageBody, WorkflowExecutionMessage.class);
                    LOG.infof("Received workflow execution message: executionId=%s, syncExecution=%s",
                            message.getExecutionId(), message.isSyncExecution());

                    // Use replyTo from properties if not in message
                    if (replyTo != null && message.getReplyTo() == null) {
                        message.setReplyTo(replyTo);
                    }
                    if (correlationId != null && message.getCorrelationId() == null) {
                        message.setCorrelationId(correlationId);
                    }

                    processExecution(message);

                    consumerChannel.basicAck(deliveryTag, false);
                    LOG.infof("Successfully processed execution: %s", message.getExecutionId());

                } catch (Exception e) {
                    LOG.errorf(e, "Failed to process workflow execution message: %s", messageBody);

                    // If sync execution, send error reply
                    if (replyTo != null && correlationId != null) {
                        sendErrorReply(replyTo, correlationId, null, e.getMessage());
                    }

                    // Reject and don't requeue (move to DLQ if configured)
                    consumerChannel.basicNack(deliveryTag, false, false);
                }
            };

            consumerTag = consumerChannel.basicConsume(
                    configuration.rabbitmqExecutionsQueue,
                    false, // Manual ack
                    deliverCallback,
                    consumerTag -> LOG.warn("Consumer cancelled: " + consumerTag)
            );

            LOG.infof("Started consuming from queue: %s", configuration.rabbitmqExecutionsQueue);

        } catch (IOException e) {
            LOG.error("Failed to start consuming: " + e.getMessage(), e);
        }
    }

    @Transactional
    void processExecution(WorkflowExecutionMessage message) {
        // Retry logic to handle race condition where execution might not be committed yet
        WorkflowExecutionEntity execution = null;
        int maxRetries = 5;
        int retryDelayMs = 100;

        for (int i = 0; i < maxRetries; i++) {
            execution = WorkflowExecutionEntity.findById(message.getExecutionId());
            if (execution != null) {
                break;
            }
            LOG.debugf("Execution not found, retry %d/%d: %s", i + 1, maxRetries, message.getExecutionId());
            try {
                Thread.sleep(retryDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        if (execution == null) {
            LOG.errorf("Execution not found after %d retries: %s", maxRetries, message.getExecutionId());

            // Send error reply if sync execution
            if (message.isSyncExecution()) {
                sendErrorReply(message.getReplyTo(), message.getCorrelationId(),
                        message.getExecutionId(), "Execution not found");
            }
            return;
        }

        if (execution.status != ExecutionStatus.PENDING && execution.status != ExecutionStatus.QUEUED) {
            LOG.warnf("Execution %s is not in PENDING/QUEUED state, skipping. Current status: %s",
                    message.getExecutionId(), execution.status);
            return;
        }

        try {
            workflowEngine.execute(execution);

            // If sync execution, send success reply
            if (message.isSyncExecution()) {
                sendSuccessReply(message.getReplyTo(), message.getCorrelationId(), execution);
            }

        } catch (Exception e) {
            LOG.errorf(e, "Workflow execution failed: %s", message.getExecutionId());

            // If sync execution, send error reply
            if (message.isSyncExecution()) {
                sendErrorReply(message.getReplyTo(), message.getCorrelationId(),
                        message.getExecutionId(), e.getMessage());
            }
            // The engine already handles marking execution as failed
        }
    }

    /**
     * Send success reply with HTTP_END output.
     */
    private void sendSuccessReply(String replyTo, String correlationId, WorkflowExecutionEntity execution) {
        try {
            LOG.infof("Building response for execution: %s, outputData length: %d, outputData: %s",
                    execution.id,
                    execution.outputData != null ? execution.outputData.length() : 0,
                    execution.outputData != null ? execution.outputData.substring(0, Math.min(500, execution.outputData.length())) : "null");
            HttpWorkflowResponse response = buildHttpResponse(execution);
            LOG.infof("Built response: statusCode=%d, body=%s", response.getStatusCode(), response.getBody());
            response.setCorrelationId(correlationId);
            connectionManager.publishReply(replyTo, correlationId, response);
            LOG.debugf("Sent success reply for execution: %s", execution.id);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send success reply for execution: %s", execution.id);
        }
    }

    /**
     * Send error reply.
     */
    private void sendErrorReply(String replyTo, String correlationId,
                                 java.util.UUID executionId, String errorMessage) {
        try {
            HttpWorkflowResponse response = HttpWorkflowResponse.error(correlationId, executionId, errorMessage);
            connectionManager.publishReply(replyTo, correlationId, response);
            LOG.debugf("Sent error reply: %s", errorMessage);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send error reply: %s", errorMessage);
        }
    }

    /**
     * Build HTTP response from execution output.
     * Extracts HTTP_END node output if available.
     */
    private HttpWorkflowResponse buildHttpResponse(WorkflowExecutionEntity execution) {
        HttpWorkflowResponse.HttpWorkflowResponseBuilder builder = HttpWorkflowResponse.builder()
                .executionId(execution.id)
                .success(execution.status == ExecutionStatus.COMPLETED)
                .durationMs(execution.durationMs);

        if (execution.status == ExecutionStatus.COMPLETED && execution.outputData != null) {
            try {
                JsonNode output = objectMapper.readTree(execution.outputData);

                // Look for httpResponse in variables (set by HTTP_END node)
                JsonNode httpResponse = output.has("httpResponse") ? output.get("httpResponse") : output;

                // Check if output is from HTTP_END node (has statusCode, headers, body)
                if (httpResponse.has("statusCode")) {
                    builder.statusCode(httpResponse.get("statusCode").asInt(200));
                } else {
                    builder.statusCode(200);
                }

                if (httpResponse.has("headers") && httpResponse.get("headers").isObject()) {
                    Map<String, String> headers = new HashMap<>();
                    httpResponse.get("headers").fields().forEachRemaining(entry -> {
                        headers.put(entry.getKey(), entry.getValue().asText());
                    });
                    builder.headers(headers);
                }

                if (httpResponse.has("contentType")) {
                    builder.contentType(httpResponse.get("contentType").asText("application/json"));
                }

                if (httpResponse.has("body")) {
                    builder.body(httpResponse.get("body"));
                } else {
                    // Use full output as body
                    builder.body(httpResponse);
                }

            } catch (Exception e) {
                LOG.warnf("Failed to parse execution output: %s", e.getMessage());
                builder.statusCode(200);
                try {
                    builder.body(objectMapper.readTree("{\"result\": \"" + execution.outputData + "\"}"));
                } catch (Exception ignored) {
                }
            }
        } else if (execution.status == ExecutionStatus.FAILED) {
            builder.statusCode(500);
            builder.error(execution.errorMessage);
        } else {
            builder.statusCode(200);
        }

        return builder.build();
    }

    private void stopConsuming() {
        try {
            if (consumerChannel != null && consumerChannel.isOpen()) {
                if (consumerTag != null) {
                    consumerChannel.basicCancel(consumerTag);
                }
                consumerChannel.close();
                LOG.info("Stopped consuming workflow executions");
            }
        } catch (Exception e) {
            LOG.error("Error stopping consumer: " + e.getMessage(), e);
        }
    }
}
