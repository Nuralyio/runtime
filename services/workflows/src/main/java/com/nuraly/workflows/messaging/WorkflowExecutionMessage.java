package com.nuraly.workflows.messaging;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class WorkflowExecutionMessage implements Serializable {

    private UUID executionId;
    private UUID workflowId;
    private String triggeredBy;
    private String triggerType;
    private String inputData;
    private String variables;
    private Instant queuedAt;
    private Integer revision; // null = current draft, number = specific revision

    // Fields for synchronous HTTP workflow execution
    private String replyTo;        // Reply queue name
    private String correlationId;  // Correlation ID for matching request/response
    private boolean syncExecution; // Whether this is a synchronous execution

    // Field for node retry
    private UUID retryNodeId;      // Node ID to retry (null = full execution)

    public WorkflowExecutionMessage() {
    }

    public WorkflowExecutionMessage(UUID executionId, UUID workflowId, String triggeredBy,
                                     String triggerType, String inputData, String variables) {
        this.executionId = executionId;
        this.workflowId = workflowId;
        this.triggeredBy = triggeredBy;
        this.triggerType = triggerType;
        this.inputData = inputData;
        this.variables = variables;
        this.queuedAt = Instant.now();
        this.syncExecution = false;
        this.revision = null;
    }

    /**
     * Constructor for revision-based execution
     */
    public WorkflowExecutionMessage(UUID executionId, UUID workflowId, String triggeredBy,
                                     String triggerType, String inputData, String variables,
                                     Integer revision) {
        this(executionId, workflowId, triggeredBy, triggerType, inputData, variables);
        this.revision = revision;
    }

    /**
     * Constructor for synchronous execution with reply queue
     */
    public WorkflowExecutionMessage(UUID executionId, UUID workflowId, String triggeredBy,
                                     String triggerType, String inputData, String variables,
                                     String replyTo, String correlationId) {
        this(executionId, workflowId, triggeredBy, triggerType, inputData, variables);
        this.replyTo = replyTo;
        this.correlationId = correlationId;
        this.syncExecution = replyTo != null && !replyTo.isEmpty();
    }

    public UUID getExecutionId() {
        return executionId;
    }

    public void setExecutionId(UUID executionId) {
        this.executionId = executionId;
    }

    public UUID getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(UUID workflowId) {
        this.workflowId = workflowId;
    }

    public String getTriggeredBy() {
        return triggeredBy;
    }

    public void setTriggeredBy(String triggeredBy) {
        this.triggeredBy = triggeredBy;
    }

    public String getTriggerType() {
        return triggerType;
    }

    public void setTriggerType(String triggerType) {
        this.triggerType = triggerType;
    }

    public String getInputData() {
        return inputData;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public String getVariables() {
        return variables;
    }

    public void setVariables(String variables) {
        this.variables = variables;
    }

    public Instant getQueuedAt() {
        return queuedAt;
    }

    public void setQueuedAt(Instant queuedAt) {
        this.queuedAt = queuedAt;
    }

    public Integer getRevision() {
        return revision;
    }

    public void setRevision(Integer revision) {
        this.revision = revision;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
        this.syncExecution = replyTo != null && !replyTo.isEmpty();
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public boolean isSyncExecution() {
        return syncExecution;
    }

    public void setSyncExecution(boolean syncExecution) {
        this.syncExecution = syncExecution;
    }

    public UUID getRetryNodeId() {
        return retryNodeId;
    }

    public void setRetryNodeId(UUID retryNodeId) {
        this.retryNodeId = retryNodeId;
    }

    @Override
    public String toString() {
        return "WorkflowExecutionMessage{" +
                "executionId=" + executionId +
                ", workflowId=" + workflowId +
                ", triggeredBy='" + triggeredBy + '\'' +
                ", triggerType='" + triggerType + '\'' +
                ", queuedAt=" + queuedAt +
                ", revision=" + revision +
                ", syncExecution=" + syncExecution +
                ", replyTo='" + replyTo + '\'' +
                ", correlationId='" + correlationId + '\'' +
                '}';
    }
}
