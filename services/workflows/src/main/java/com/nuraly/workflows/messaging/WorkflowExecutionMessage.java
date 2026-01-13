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

    @Override
    public String toString() {
        return "WorkflowExecutionMessage{" +
                "executionId=" + executionId +
                ", workflowId=" + workflowId +
                ", triggeredBy='" + triggeredBy + '\'' +
                ", triggerType='" + triggerType + '\'' +
                ", queuedAt=" + queuedAt +
                '}';
    }
}
