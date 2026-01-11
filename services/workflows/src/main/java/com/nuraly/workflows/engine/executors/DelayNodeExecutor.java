package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DelayNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.DELAY;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Delay node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        long duration = config.has("duration") ? config.get("duration").asLong() : 1000;
        String unit = config.has("unit") ? config.get("unit").asText() : "milliseconds";

        // Convert to milliseconds
        long durationMs = switch (unit.toLowerCase()) {
            case "seconds" -> duration * 1000;
            case "minutes" -> duration * 60 * 1000;
            case "hours" -> duration * 60 * 60 * 1000;
            default -> duration;
        };

        // Simple sleep implementation
        // In production, this should use async/reactive patterns or store state for resume
        Thread.sleep(durationMs);

        return NodeExecutionResult.success(
                objectMapper.createObjectNode()
                        .put("delayed", true)
                        .put("durationMs", durationMs)
        );
    }
}
