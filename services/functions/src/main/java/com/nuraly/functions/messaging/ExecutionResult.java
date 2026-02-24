package com.nuraly.functions.messaging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Result received from the functions.results queue after Deno worker execution.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ExecutionResult(
    String correlationId,
    boolean success,
    Object result,
    String error,
    String stack,
    long executionTime
) {}
