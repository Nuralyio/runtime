package com.nuraly.workflows.engine.executors;

import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;

public interface NodeExecutor {

    NodeType getType();

    NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception;
}
