package com.nuraly.workflows.engine.executors;

import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class StartNodeExecutor implements NodeExecutor {

    @Override
    public NodeType getType() {
        return NodeType.START;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) {
        // Start node simply passes through the input
        return NodeExecutionResult.success(context.getInput());
    }
}
