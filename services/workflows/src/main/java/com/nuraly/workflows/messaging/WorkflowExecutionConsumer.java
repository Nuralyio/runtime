package com.nuraly.workflows.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
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
import java.time.Instant;

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

                try {
                    WorkflowExecutionMessage message = objectMapper.readValue(messageBody, WorkflowExecutionMessage.class);
                    LOG.infof("Received workflow execution message: executionId=%s", message.getExecutionId());

                    processExecution(message);

                    consumerChannel.basicAck(deliveryTag, false);
                    LOG.infof("Successfully processed execution: %s", message.getExecutionId());

                } catch (Exception e) {
                    LOG.errorf(e, "Failed to process workflow execution message: %s", messageBody);
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
            return;
        }

        if (execution.status != ExecutionStatus.PENDING && execution.status != ExecutionStatus.QUEUED) {
            LOG.warnf("Execution %s is not in PENDING/QUEUED state, skipping. Current status: %s",
                    message.getExecutionId(), execution.status);
            return;
        }

        try {
            workflowEngine.execute(execution);
        } catch (Exception e) {
            LOG.errorf(e, "Workflow execution failed: %s", message.getExecutionId());
            // The engine already handles marking execution as failed
        }
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
