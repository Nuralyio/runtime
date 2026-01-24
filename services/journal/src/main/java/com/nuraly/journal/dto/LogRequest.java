package com.nuraly.journal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Request object for creating log entries.
 */
@Data
public class LogRequest {

    /**
     * Optional timestamp. If not provided, current time is used.
     */
    private Instant timestamp;

    /**
     * Source service name (required)
     */
    @NotBlank(message = "Service name is required")
    private String service;

    /**
     * Log type (required) - e.g., execution, node, llm, http, error
     */
    @NotBlank(message = "Log type is required")
    private String type;

    /**
     * Log level (optional, defaults to INFO)
     */
    private String level = "INFO";

    /**
     * Correlation ID for request tracing (optional)
     */
    private UUID correlationId;

    /**
     * Flexible payload data (required)
     */
    @NotNull(message = "Data payload is required")
    private Map<String, Object> data;
}
