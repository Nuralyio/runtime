package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.entity.NodeExecutionEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.messaging.RabbitMQConnectionManager;
import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.Channel;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class WorkflowEventService {

    private static final Logger LOG = Logger.getLogger(WorkflowEventService.class);

    @Inject
    Configuration configuration;

    @Inject
    RabbitMQConnectionManager connectionManager;

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

    public void logExecutionQueued(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_QUEUED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "triggerType", execution.triggerType != null ? execution.triggerType : "",
                "status", "QUEUED"
        ));
    }

    public void logExecutionStarted(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_STARTED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "triggerType", execution.triggerType != null ? execution.triggerType : "",
                "status", "RUNNING"
        ));
    }

    public void logExecutionResumed(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_RESUMED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "status", "QUEUED"
        ));
    }

    public void logExecutionCompleted(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_COMPLETED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "status", "COMPLETED",
                "durationMs", execution.durationMs != null ? execution.durationMs : 0,
                "outputData", execution.outputData != null ? execution.outputData : "{}"
        ));
    }

    public void logExecutionFailed(WorkflowExecutionEntity execution, String errorMessage) {
        sendEvent("EXECUTION_FAILED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "status", "FAILED",
                "errorMessage", errorMessage != null ? errorMessage : "",
                "durationMs", execution.durationMs != null ? execution.durationMs : 0
        ));
    }

    public void logExecutionCancelled(WorkflowExecutionEntity execution) {
        sendEvent("EXECUTION_CANCELLED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "workflowName", execution.workflow.name,
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "triggeredBy", execution.triggeredBy != null ? execution.triggeredBy : "",
                "status", "CANCELLED",
                "durationMs", execution.durationMs != null ? execution.durationMs : 0
        ));
    }

    public void logNodeExecuted(NodeExecutionEntity nodeExecution) {
        Map<String, Object> data = new HashMap<>();
        data.put("nodeExecutionId", String.valueOf(nodeExecution.id));
        data.put("executionId", String.valueOf(nodeExecution.execution.id));
        data.put("workflowId", String.valueOf(nodeExecution.execution.workflow.id));
        data.put("applicationId", nodeExecution.execution.workflow.applicationId != null ?
                nodeExecution.execution.workflow.applicationId : "");
        data.put("nodeId", String.valueOf(nodeExecution.node.id));
        data.put("nodeName", nodeExecution.node.name);
        data.put("nodeType", nodeExecution.node.type.name());
        data.put("status", nodeExecution.status.name());
        data.put("attemptNumber", nodeExecution.attemptNumber != null ? nodeExecution.attemptNumber : 1);
        data.put("durationMs", nodeExecution.durationMs != null ? nodeExecution.durationMs : 0);

        if (nodeExecution.errorMessage != null) {
            data.put("errorMessage", nodeExecution.errorMessage);
        }

        if (nodeExecution.outputData != null) {
            data.put("outputData", nodeExecution.outputData);
        }

        sendEvent("NODE_EXECUTED", data);
    }

    public void logNodeStarted(NodeExecutionEntity nodeExecution) {
        sendEvent("NODE_STARTED", Map.of(
                "nodeExecutionId", String.valueOf(nodeExecution.id),
                "executionId", String.valueOf(nodeExecution.execution.id),
                "workflowId", String.valueOf(nodeExecution.execution.workflow.id),
                "applicationId", nodeExecution.execution.workflow.applicationId != null ?
                        nodeExecution.execution.workflow.applicationId : "",
                "nodeId", String.valueOf(nodeExecution.node.id),
                "nodeName", nodeExecution.node.name,
                "nodeType", nodeExecution.node.type.name(),
                "status", "RUNNING"
        ));
    }

    /**
     * Log LLM call started - for agent UX feedback
     */
    public void logLlmCallStarted(WorkflowExecutionEntity execution, String nodeId, String nodeName, String provider, String model) {
        LOG.infof(">>> EMITTING LLM_CALL_STARTED: nodeId=%s, nodeName=%s, provider=%s, model=%s", nodeId, nodeName, provider, model);
        sendEvent("LLM_CALL_STARTED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "nodeName", nodeName,
                "provider", provider,
                "model", model
        ));
    }

    /**
     * Log LLM call completed - for agent UX feedback
     */
    public void logLlmCallCompleted(WorkflowExecutionEntity execution, String nodeId, String nodeName, String provider, String model, int iteration) {
        LOG.infof(">>> EMITTING LLM_CALL_COMPLETED: nodeId=%s, iteration=%d", nodeId, iteration);
        sendEvent("LLM_CALL_COMPLETED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "nodeName", nodeName,
                "provider", provider,
                "model", model,
                "iteration", iteration
        ));
    }

    /**
     * Log tool call started - for agent UX feedback
     */
    public void logToolCallStarted(WorkflowExecutionEntity execution, String nodeId, String nodeName, String toolName, String toolNodeId) {
        LOG.infof(">>> EMITTING TOOL_CALL_STARTED: nodeId=%s, toolName=%s, toolNodeId=%s", nodeId, toolName, toolNodeId);
        sendEvent("TOOL_CALL_STARTED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "nodeName", nodeName,
                "toolName", toolName,
                "toolNodeId", toolNodeId != null ? toolNodeId : ""
        ));
    }

    /**
     * Log tool call completed - for agent UX feedback
     */
    public void logToolCallCompleted(WorkflowExecutionEntity execution, String nodeId, String nodeName, String toolName, String toolNodeId, boolean success) {
        sendEvent("TOOL_CALL_COMPLETED", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "nodeName", nodeName,
                "toolName", toolName,
                "toolNodeId", toolNodeId != null ? toolNodeId : "",
                "success", success
        ));
    }

    /**
     * Send a chat message event - used by CHAT_OUTPUT nodes to send messages to chatbot in real-time
     */
    public void sendChatMessage(WorkflowExecutionEntity execution, String nodeId, String nodeName, String message, Map<String, Object> metadata) {
        Map<String, Object> data = new HashMap<>();
        data.put("executionId", String.valueOf(execution.id));
        data.put("workflowId", String.valueOf(execution.workflow.id));
        data.put("applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "");
        data.put("nodeId", nodeId);
        data.put("nodeName", nodeName);
        data.put("message", message);
        data.put("sender", "bot");
        if (metadata != null) {
            data.put("metadata", metadata);
        }
        sendEvent("CHAT_MESSAGE", data);
    }

    // ========================================================================
    // Streaming Chat Events - Token-by-token streaming from LLM to chat
    // ========================================================================

    /**
     * Start a streaming chat session - emitted when LLM streaming begins
     */
    public void sendChatStreamStart(WorkflowExecutionEntity execution, String nodeId, String nodeName, String streamId) {
        sendEvent("CHAT_STREAM_START", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "nodeName", nodeName,
                "streamId", streamId,
                "sender", "bot"
        ));
    }

    /**
     * Send a streaming chat token - emitted for each token from LLM
     */
    public void sendChatStreamToken(WorkflowExecutionEntity execution, String nodeId, String streamId, String token) {
        sendEvent("CHAT_STREAM_TOKEN", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "streamId", streamId,
                "token", token,
                "sender", "bot"
        ));
    }

    /**
     * End a streaming chat session - emitted when LLM streaming completes
     */
    public void sendChatStreamEnd(WorkflowExecutionEntity execution, String nodeId, String streamId,
                                   String fullContent, Map<String, Object> usage) {
        Map<String, Object> data = new HashMap<>();
        data.put("executionId", String.valueOf(execution.id));
        data.put("workflowId", String.valueOf(execution.workflow.id));
        data.put("applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "");
        data.put("nodeId", nodeId);
        data.put("streamId", streamId);
        data.put("content", fullContent);
        data.put("sender", "bot");
        if (usage != null) {
            data.put("usage", usage);
        }
        sendEvent("CHAT_STREAM_END", data);
    }

    /**
     * Signal a streaming error
     */
    public void sendChatStreamError(WorkflowExecutionEntity execution, String nodeId, String streamId, String error) {
        sendEvent("CHAT_STREAM_ERROR", Map.of(
                "executionId", String.valueOf(execution.id),
                "workflowId", String.valueOf(execution.workflow.id),
                "applicationId", execution.workflow.applicationId != null ? execution.workflow.applicationId : "",
                "nodeId", nodeId,
                "streamId", streamId,
                "error", error,
                "sender", "bot"
        ));
    }

    private void sendEvent(String eventType, Map<String, Object> data) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("type", eventType);
            event.put("timestamp", Instant.now().toString());
            event.put("data", data);

            String eventJson = objectMapper.writeValueAsString(event);
            sendToRabbitMQ(eventJson, eventType);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send event: %s", eventType);
        }
    }

    private void sendToRabbitMQ(String message, String eventType) {
        try (Channel channel = connectionManager.createChannel()) {
            AMQP.BasicProperties properties = new AMQP.BasicProperties.Builder()
                    .contentType("application/json")
                    .deliveryMode(2) // Persistent
                    .type(eventType)
                    .build();

            channel.basicPublish(
                    configuration.rabbitmqExchange,
                    "workflow.event",
                    properties,
                    message.getBytes(StandardCharsets.UTF_8)
            );

            LOG.debugf("Published event: %s", eventType);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to send message to RabbitMQ: %s", eventType);
        }
    }
}
