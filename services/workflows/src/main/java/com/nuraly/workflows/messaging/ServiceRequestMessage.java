package com.nuraly.workflows.messaging;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Generic service request message for RabbitMQ.
 * Used for external services like OCR, Crawl, etc.
 *
 * Follows the same request-reply pattern as WorkflowExecutionMessage.
 */
public class ServiceRequestMessage implements Serializable {

    private String requestId;
    private String serviceType;      // "ocr", "crawl", etc.
    private String payload;          // JSON payload for the service
    private Instant queuedAt;

    // Tenant/isolation info
    private String workflowId;
    private String executionId;
    private String userId;
    private String isolationKey;

    // Reply queue info (for sync requests)
    private String replyTo;
    private String correlationId;

    public ServiceRequestMessage() {
        this.requestId = UUID.randomUUID().toString();
        this.queuedAt = Instant.now();
    }

    public ServiceRequestMessage(String serviceType, String payload) {
        this();
        this.serviceType = serviceType;
        this.payload = payload;
    }

    // Getters and setters
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Instant getQueuedAt() {
        return queuedAt;
    }

    public void setQueuedAt(Instant queuedAt) {
        this.queuedAt = queuedAt;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getExecutionId() {
        return executionId;
    }

    public void setExecutionId(String executionId) {
        this.executionId = executionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getIsolationKey() {
        return isolationKey;
    }

    public void setIsolationKey(String isolationKey) {
        this.isolationKey = isolationKey;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    @Override
    public String toString() {
        return "ServiceRequestMessage{" +
                "requestId='" + requestId + '\'' +
                ", serviceType='" + serviceType + '\'' +
                ", workflowId='" + workflowId + '\'' +
                ", queuedAt=" + queuedAt +
                '}';
    }
}
