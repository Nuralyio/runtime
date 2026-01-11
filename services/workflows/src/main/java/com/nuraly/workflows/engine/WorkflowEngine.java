package com.nuraly.workflows.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.executors.NodeExecutor;
import com.nuraly.workflows.entity.*;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.exception.WorkflowExecutionException;
import com.nuraly.workflows.service.WorkflowEventService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class WorkflowEngine {

    @Inject
    NodeExecutorFactory nodeExecutorFactory;

    @Inject
    WorkflowEventService eventService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public void execute(WorkflowExecutionEntity execution) throws WorkflowExecutionException {
        ExecutionContext context = new ExecutionContext(execution);

        execution.status = ExecutionStatus.RUNNING;
        execution.persist();

        try {
            // Find start node
            WorkflowNodeEntity startNode = findStartNode(execution.workflow);
            if (startNode == null) {
                throw new WorkflowExecutionException("No START node found in workflow");
            }

            // Execute workflow
            executeFromNode(context, startNode);

            // Mark as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.outputData = context.getVariablesAsString();
            execution.variables = context.getVariablesAsString();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionCompleted(execution);

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            throw new WorkflowExecutionException("Workflow execution failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void resume(WorkflowExecutionEntity execution) throws WorkflowExecutionException {
        // For now, just restart from the beginning
        // In production, you'd track the last completed node and resume from there
        execute(execution);
    }

    private void executeFromNode(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (context.isCancelled()) {
            return;
        }

        context.setCurrentNode(node);

        // Create node execution record
        NodeExecutionEntity nodeExecution = new NodeExecutionEntity();
        nodeExecution.execution = context.getExecution();
        nodeExecution.node = node;
        nodeExecution.status = ExecutionStatus.RUNNING;
        nodeExecution.startedAt = Instant.now();
        nodeExecution.attemptNumber = 1;

        try {
            nodeExecution.inputData = objectMapper.writeValueAsString(context.getInput());
        } catch (Exception e) {
            nodeExecution.inputData = "{}";
        }

        nodeExecution.persist();

        // Execute node with retry logic
        NodeExecutionResult result = executeNodeWithRetry(context, node, nodeExecution);

        // Update node execution record
        nodeExecution.completedAt = Instant.now();
        nodeExecution.durationMs = nodeExecution.completedAt.toEpochMilli() - nodeExecution.startedAt.toEpochMilli();

        if (result.isSuccess()) {
            nodeExecution.status = ExecutionStatus.COMPLETED;
            if (result.getOutput() != null) {
                nodeExecution.outputData = objectMapper.writeValueAsString(result.getOutput());
                context.setNodeOutput(node.id, result.getOutput());
            }
        } else {
            nodeExecution.status = ExecutionStatus.FAILED;
            nodeExecution.errorMessage = result.getErrorMessage();
        }

        nodeExecution.persist();
        eventService.logNodeExecuted(nodeExecution);

        if (!result.isSuccess()) {
            throw new WorkflowExecutionException("Node '" + node.name + "' failed: " + result.getErrorMessage());
        }

        // If this is an END node, we're done
        if (node.type == NodeType.END) {
            return;
        }

        // Find next node(s)
        WorkflowNodeEntity nextNode = findNextNode(context, node, result.getNextEdgeLabel());

        if (nextNode != null) {
            executeFromNode(context, nextNode);
        }
    }

    private NodeExecutionResult executeNodeWithRetry(ExecutionContext context, WorkflowNodeEntity node,
                                                      NodeExecutionEntity nodeExecution) {
        int maxRetries = node.maxRetries != null ? node.maxRetries : configuration.nodeRetryMax;
        int retryDelay = node.retryDelayMs != null ? node.retryDelayMs : configuration.nodeRetryDelay;

        NodeExecutor executor = nodeExecutorFactory.getExecutor(node.type);

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                nodeExecution.attemptNumber = attempt;
                nodeExecution.persist();

                NodeExecutionResult result = executor.execute(context, node);

                if (result.isSuccess() || !result.isShouldRetry()) {
                    return result;
                }

                // Retry
                if (attempt <= maxRetries) {
                    System.out.println("Node '" + node.name + "' failed, retrying (attempt " + (attempt + 1) + ")...");
                    Thread.sleep(retryDelay);
                }

            } catch (Exception e) {
                if (attempt > maxRetries) {
                    return NodeExecutionResult.failure(e.getMessage());
                }

                System.out.println("Node '" + node.name + "' threw exception, retrying (attempt " + (attempt + 1) + "): " + e.getMessage());
                try {
                    Thread.sleep(retryDelay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return NodeExecutionResult.failure("Interrupted during retry");
                }
            }
        }

        return NodeExecutionResult.failure("Max retries exceeded");
    }

    private WorkflowNodeEntity findStartNode(WorkflowEntity workflow) {
        return workflow.nodes.stream()
                .filter(n -> n.type == NodeType.START)
                .findFirst()
                .orElse(null);
    }

    private WorkflowNodeEntity findNextNode(ExecutionContext context, WorkflowNodeEntity currentNode,
                                            String preferredLabel) {
        List<WorkflowEdgeEntity> outgoingEdges = currentNode.workflow.edges.stream()
                .filter(e -> e.sourceNode.id.equals(currentNode.id))
                .sorted(Comparator.comparingInt(e -> e.priority != null ? e.priority : 0))
                .toList();

        if (outgoingEdges.isEmpty()) {
            return null;
        }

        // If there's a preferred label (from condition nodes), find that edge
        if (preferredLabel != null) {
            Optional<WorkflowEdgeEntity> matchingEdge = outgoingEdges.stream()
                    .filter(e -> preferredLabel.equals(e.label))
                    .findFirst();

            if (matchingEdge.isPresent()) {
                return matchingEdge.get().targetNode;
            }
        }

        // Otherwise, find first edge with matching condition or default
        for (WorkflowEdgeEntity edge : outgoingEdges) {
            if (edge.condition == null || edge.condition.isEmpty()) {
                // Default edge (no condition)
                return edge.targetNode;
            }

            // Evaluate condition
            if (evaluateEdgeCondition(context, edge.condition)) {
                return edge.targetNode;
            }
        }

        // Return first edge if no condition matched
        return outgoingEdges.get(0).targetNode;
    }

    private boolean evaluateEdgeCondition(ExecutionContext context, String condition) {
        // Simple evaluation - could be enhanced with JavaScript evaluation
        try {
            String resolved = context.resolveExpression(condition);
            return "true".equalsIgnoreCase(resolved) || "1".equals(resolved);
        } catch (Exception e) {
            return false;
        }
    }
}
