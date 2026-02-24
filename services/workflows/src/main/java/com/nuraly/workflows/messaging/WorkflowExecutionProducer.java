package com.nuraly.workflows.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;

@ApplicationScoped
public class WorkflowExecutionProducer {

    private static final Logger LOG = Logger.getLogger(WorkflowExecutionProducer.class);

    @Inject
    RabbitMQConnectionManager connectionManager;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper;

    public WorkflowExecutionProducer() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Publish a workflow execution message (async mode).
     */
    public void publishExecution(WorkflowExecutionMessage message) {
        try (Channel channel = connectionManager.createChannel()) {
            String messageJson = objectMapper.writeValueAsString(message);

            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .deliveryMode(2) // Persistent
                    .correlationId(message.getExecutionId().toString())
                    .build();

            channel.basicPublish(
                    configuration.rabbitmqExchange,
                    configuration.rabbitmqExecutionsRoutingKey,
                    properties,
                    messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.infof("Published workflow execution message: executionId=%s, workflowId=%s",
                    message.getExecutionId(), message.getWorkflowId());

        } catch (Exception e) {
            LOG.errorf(e, "Failed to publish workflow execution message: %s", message);
            throw new RuntimeException("Failed to publish workflow execution", e);
        }
    }

    /**
     * Publish a workflow execution message for synchronous execution.
     * Includes replyTo queue and correlationId for response routing.
     *
     * @param message       The execution message
     * @param replyTo       The reply queue name
     * @param correlationId The correlation ID for matching request/response
     */
    public void publishSyncExecution(WorkflowExecutionMessage message, String replyTo, String correlationId) {
        // Set sync execution fields on the message
        message.setReplyTo(replyTo);
        message.setCorrelationId(correlationId);
        message.setSyncExecution(true);

        try (Channel channel = connectionManager.createChannel()) {
            String messageJson = objectMapper.writeValueAsString(message);

            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .deliveryMode(2) // Persistent
                    .correlationId(correlationId)
                    .replyTo(replyTo)
                    .build();

            channel.basicPublish(
                    configuration.rabbitmqExchange,
                    configuration.rabbitmqExecutionsRoutingKey,
                    properties,
                    messageJson.getBytes(StandardCharsets.UTF_8)
            );

            LOG.infof("Published sync workflow execution: executionId=%s, workflowId=%s, replyTo=%s, correlationId=%s",
                    message.getExecutionId(), message.getWorkflowId(), replyTo, correlationId);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to publish sync workflow execution message: %s", message);
            throw new RuntimeException("Failed to publish sync workflow execution", e);
        }
    }
}
