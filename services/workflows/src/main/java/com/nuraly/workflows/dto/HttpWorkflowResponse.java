package com.nuraly.workflows.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for synchronous HTTP workflow execution.
 * Contains the HTTP response data from the HTTP_END node.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HttpWorkflowResponse implements Serializable {

    /**
     * Correlation ID for matching request/response
     */
    private String correlationId;

    /**
     * Execution ID
     */
    private UUID executionId;

    /**
     * Whether the workflow completed successfully
     */
    private boolean success;

    /**
     * HTTP status code from HTTP_END node
     */
    @Builder.Default
    private int statusCode = 200;

    /**
     * Response headers from HTTP_END node
     */
    private Map<String, String> headers;

    /**
     * Response body from HTTP_END node
     */
    private JsonNode body;

    /**
     * Content type
     */
    @Builder.Default
    private String contentType = "application/json";

    /**
     * Error message if workflow failed
     */
    private String error;

    /**
     * Execution duration in milliseconds
     */
    private Long durationMs;

    /**
     * Create an error response
     */
    public static HttpWorkflowResponse error(String correlationId, UUID executionId, String errorMessage) {
        return HttpWorkflowResponse.builder()
                .correlationId(correlationId)
                .executionId(executionId)
                .success(false)
                .statusCode(500)
                .error(errorMessage)
                .build();
    }

    /**
     * Create a timeout response
     */
    public static HttpWorkflowResponse timeout(String correlationId, UUID executionId, long timeoutMs) {
        return HttpWorkflowResponse.builder()
                .correlationId(correlationId)
                .executionId(executionId)
                .success(false)
                .statusCode(504)
                .error("Workflow execution timed out after " + timeoutMs + "ms")
                .build();
    }
}
