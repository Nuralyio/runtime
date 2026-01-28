package com.nuraly.functions.messaging;

import java.util.List;

/**
 * Message sent to the functions.execute queue for Deno worker execution.
 */
public record ExecuteMessage(
    String correlationId,
    String functionId,
    String invocationId,
    String handler,
    Input input,
    long timeout,
    Permissions permissions
) {
    public record Input(
        Object body,
        Context context
    ) {}

    public record Context(
        String functionId,
        String functionName,
        String invocationId
    ) {}

    public record Permissions(
        List<String> allowNet,
        List<String> allowEnv
    ) {}
}
