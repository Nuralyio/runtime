package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Note node executor - a no-op executor for annotation nodes.
 * Note nodes are visual-only elements used to document workflows.
 * They have no ports and should never be executed, but this executor
 * exists as a safety fallback in case one is somehow reached.
 */
@ApplicationScoped
public class NoteNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.NOTE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        // Note nodes are purely visual annotations - pass through input unchanged
        ObjectNode output = objectMapper.createObjectNode();
        output.put("type", "annotation");
        output.put("nodeType", "NOTE");
        output.put("message", "Note nodes are visual-only and do not perform any execution");

        return NodeExecutionResult.success(output);
    }
}
