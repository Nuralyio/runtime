package com.nuraly.workflows.messaging;

import java.io.Serializable;
import java.time.Instant;

/**
 * Generic service response message from RabbitMQ.
 * Used for responses from external services like OCR, Crawl, etc.
 */
public class ServiceResponseMessage implements Serializable {

    private String requestId;
    private String serviceType;
    private boolean success;
    private String payload;          // JSON response payload
    private String errorMessage;
    private Instant processedAt;

    public ServiceResponseMessage() {
        this.processedAt = Instant.now();
    }

    public static ServiceResponseMessage success(String requestId, String serviceType, String payload) {
        ServiceResponseMessage response = new ServiceResponseMessage();
        response.setRequestId(requestId);
        response.setServiceType(serviceType);
        response.setSuccess(true);
        response.setPayload(payload);
        return response;
    }

    public static ServiceResponseMessage failure(String requestId, String serviceType, String errorMessage) {
        ServiceResponseMessage response = new ServiceResponseMessage();
        response.setRequestId(requestId);
        response.setServiceType(serviceType);
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        return response;
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

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    @Override
    public String toString() {
        return "ServiceResponseMessage{" +
                "requestId='" + requestId + '\'' +
                ", serviceType='" + serviceType + '\'' +
                ", success=" + success +
                ", processedAt=" + processedAt +
                '}';
    }
}
