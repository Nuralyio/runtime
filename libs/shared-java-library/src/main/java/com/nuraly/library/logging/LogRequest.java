package com.nuraly.library.logging;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Request object for creating log entries.
 */
public class LogRequest {

    private Instant timestamp;
    private String service;
    private String type;
    private String level = "INFO";
    private UUID correlationId;
    private Map<String, Object> data;

    // Getters and Setters

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public UUID getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(UUID correlationId) {
        this.correlationId = correlationId;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
