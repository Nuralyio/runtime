package com.nuraly.workflows.engine;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodeExecutionResult {

    private boolean success;
    private JsonNode output;
    private String errorMessage;
    private boolean shouldRetry;
    private String nextEdgeLabel; // For condition nodes to specify which path to take

    public static NodeExecutionResult success(JsonNode output) {
        NodeExecutionResult result = new NodeExecutionResult();
        result.success = true;
        result.output = output;
        return result;
    }

    public static NodeExecutionResult success(JsonNode output, String nextEdgeLabel) {
        NodeExecutionResult result = new NodeExecutionResult();
        result.success = true;
        result.output = output;
        result.nextEdgeLabel = nextEdgeLabel;
        return result;
    }

    public static NodeExecutionResult failure(String errorMessage) {
        NodeExecutionResult result = new NodeExecutionResult();
        result.success = false;
        result.errorMessage = errorMessage;
        return result;
    }

    public static NodeExecutionResult failure(String errorMessage, boolean shouldRetry) {
        NodeExecutionResult result = new NodeExecutionResult();
        result.success = false;
        result.errorMessage = errorMessage;
        result.shouldRetry = shouldRetry;
        return result;
    }
}
