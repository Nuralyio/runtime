package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.entity.NodeExecutionEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@ApplicationScoped
public class WorkflowEventService {

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper;

    public WorkflowEventService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void logWorkflowCreated(WorkflowEntity workflow) {
        sendEvent("WORKFLOW_CREATED", Map.of(
                "workflowId", String.valueOf(workflow.id),
                "name", workflow.name,
                "applicationId", workflow.applicationId != null ? workflow.applicationId : "",
                "createdBy", workflow.createdBy != null ? workflow.createdBy : ""
        ));
    }

    public void logWorkflowUpdated(WorkflowEntity workflow) {
        sendEvent("WORKFLOW_UPDATED", Map.of(
                "workflowId", String.valueOf(workflow.id),
                "name", workflow.name,
                "status", workflow.status.name()
        ));
    }

    public void logWorkflowPublished(WorkflowEntity workflow) {
        sendEvent("WORKFLOW_PUBLISHED", Map.of(
                "workflowId", String.valueOf(workflow.id),
                "name", workflow.name
        ));
    }

    public void logWorkflowPaused(WorkflowEntity workflow) {
        sendEvent("WORKFLOW_PAUSED", Map.of(
                "workflowId", String.valueOf(workflow.id),
                "name", workflow.name
        ));
    }

    public void logWorkflowDeleted(WorkflowEntity workflow) {
        sendEvent("WORKFLOW_DELETED", Map.of(
                "workflowId", String.valueOf(workflow.id),
                "name", workflow.name
        ));
    }

    public void logExecutionStarted(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_STARTED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "triggerType", execution.triggerType != null ? execution.triggerType : ""
        ));
    }

    public void logExecutionCompleted(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_COMPLETED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "durationMs", execution.durationMs != null ? execution.durationMs : 0
        ));
    }

    public void logExecutionFailed(WorkflowExecutionEntity execution, String errorMessage) {
        sendEvent("EXECUTION_FAILED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "errorMessage", errorMessage != null ? errorMessage : ""
        ));
    }

    public void logExecutionCancelled(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_CANCELLED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name
        ));
    }

    public void logNodeExecuted(NodeExecutionEntity nodeExecution) {
        sendEvent("NODE_EXECUTED", Map.of(
                "nodeExecutionId", String.valueOf(nodeExecution.id),
                "executionId", String.valueOf(nodeExecution.execution.id),
                "nodeId", String.valueOf(nodeExecution.node.id),
                "nodeName", nodeExecution.node.name,
                "nodeType", nodeExecution.node.type.name(),
                "status", nodeExecution.status.name(),
                "durationMs", nodeExecution.durationMs != null ? nodeExecution.durationMs : 0
        ));
    }

    private void sendEvent(String eventType, Map<String, Object> data) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", eventType);
            event.put("timestamp", Instant.now().toString());
            event.put("data", data);

            String eventJson = objectMapper.writeValueAsString(event);
            sendToRabbitMQ(eventJson);
        } catch (Exception e) {
            System.err.println("Failed to send event: " + e.getMessage());
        }
    }

    private void sendToRabbitMQ(String message) {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(configuration.rabbitmqHost);
        factory.setPort(configuration.rabbitmqPort);
        configuration.rabbitmqUsername.ifPresent(factory::setUsername);
        configuration.rabbitmqPassword.ifPresent(factory::setPassword);

        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            channel.queueDeclare(configuration.rabbitmqEventsQueue, true, false, false, null);
            channel.basicPublish("", configuration.rabbitmqEventsQueue, null, message.getBytes(StandardCharsets.UTF_8));
        } catch (IOException | TimeoutException e) {
            System.err.println("Failed to send message to RabbitMQ: " + e.getMessage());
        }
    }
}
