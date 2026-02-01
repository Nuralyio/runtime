package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Frame node executor - a no-op executor for visual grouping nodes.
 * Frame nodes are visual containers used to organize and group related nodes.
 * They have no ports and should never be executed, but this executor
 * exists as a safety fallback in case one is somehow reached.
 */
@ApplicationScoped
public class FrameNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.FRAME;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        // Frame nodes are purely visual grouping containers - pass through input unchanged
        ObjectNode output = objectMapper.createObjectNode();
        output.put("type", "annotation");
        output.put("nodeType", "FRAME");
        output.put("message", "Frame nodes are visual-only containers and do not perform any execution");

        return NodeExecutionResult.success(output);
    }
}
