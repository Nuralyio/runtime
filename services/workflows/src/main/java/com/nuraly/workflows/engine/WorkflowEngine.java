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
import java.util.ArrayList;
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
            // Find start node based on trigger type
            WorkflowNodeEntity startNode = findStartNode(execution.workflow, execution.triggerType);
            if (startNode == null) {
                throw new WorkflowExecutionException("No START node found in workflow for trigger type: " + execution.triggerType);
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

        // Emit node started event for real-time tracking
        eventService.logNodeStarted(nodeExecution);

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
        if (node.type == NodeType.END || node.type == NodeType.HTTP_END) {
            return;
        }

        // Find next node(s) - may be multiple for parallel execution
        List<WorkflowNodeEntity> nextNodes = findNextNodes(context, node, result.getNextEdgeLabel());

        if (nextNodes.isEmpty()) {
            return;
        }

        // Execute all next nodes (sequentially for transaction safety)
        // Pass the current node's output as input to the next node
        for (WorkflowNodeEntity nextNode : nextNodes) {
            // Set the output of the current node as input for the next node
            if (result.getOutput() != null) {
                context.setInput(result.getOutput());
            }
            executeFromNode(context, nextNode);
        }
    }

    private NodeExecutionResult executeNodeWithRetry(ExecutionContext context, WorkflowNodeEntity node,
                                                      NodeExecutionEntity nodeExecution) {
        int maxRetries = node.maxRetries != null ? node.maxRetries : configuration.nodeRetryMax;
        int retryDelay = node.retryDelayMs != null ? node.retryDelayMs : configuration.nodeRetryDelay;

        NodeExecutor executor = nodeExecutorFactory.getExecutor(node.type);
        String lastError = null;

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                nodeExecution.attemptNumber = attempt;
                nodeExecution.persist();

                NodeExecutionResult result = executor.execute(context, node);

                if (result.isSuccess() || !result.isShouldRetry()) {
                    return result;
                }

                // Store the error for reporting if retries exhausted
                lastError = result.getErrorMessage();

                // Retry
                if (attempt <= maxRetries) {
                    System.out.println("Node '" + node.name + "' failed (" + lastError + "), retrying (attempt " + (attempt + 1) + ")...");
                    Thread.sleep(retryDelay);
                }

            } catch (Exception e) {
                lastError = e.getMessage();
                if (attempt > maxRetries) {
                    return NodeExecutionResult.failure(lastError);
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

        return NodeExecutionResult.failure("Max retries exceeded" + (lastError != null ? ": " + lastError : ""));
    }

    /**
     * Find the appropriate start node based on trigger type.
     * - "chat" trigger -> CHAT_START node
     * - "http_trigger" or "webhook" trigger -> HTTP_START node
     * - Otherwise -> START node (fallback)
     */
    private WorkflowNodeEntity findStartNode(WorkflowEntity workflow, String triggerType) {
        NodeType targetType;

        if (triggerType != null) {
            String normalizedTrigger = triggerType.toLowerCase();
            if (normalizedTrigger.contains("chat")) {
                targetType = NodeType.CHAT_START;
            } else if (normalizedTrigger.contains("http") || normalizedTrigger.contains("webhook")) {
                targetType = NodeType.HTTP_START;
            } else {
                targetType = NodeType.START;
            }

            // Try to find the specific trigger node
            Optional<WorkflowNodeEntity> specificNode = workflow.nodes.stream()
                    .filter(n -> n.type == targetType)
                    .findFirst();

            if (specificNode.isPresent()) {
                return specificNode.get();
            }
        }

        // Fallback: look for any start node (START, HTTP_START, or CHAT_START)
        return workflow.nodes.stream()
                .filter(n -> n.type == NodeType.START ||
                            n.type == NodeType.HTTP_START ||
                            n.type == NodeType.CHAT_START)
                .findFirst()
                .orElse(null);
    }

    /**
     * Find next nodes to execute.
     * - For CONDITION nodes: returns ALL nodes connected to the matching path (true or false)
     * - For other nodes: returns ALL connected nodes for execution
     */
    private List<WorkflowNodeEntity> findNextNodes(ExecutionContext context, WorkflowNodeEntity currentNode,
                                                    String preferredLabel) {
        List<WorkflowEdgeEntity> outgoingEdges = currentNode.workflow.edges.stream()
                .filter(e -> e.sourceNode.id.equals(currentNode.id))
                .sorted(Comparator.comparingInt(e -> e.priority != null ? e.priority : 0))
                .toList();

        if (outgoingEdges.isEmpty()) {
            return List.of();
        }

        // For CONDITION nodes, return ALL nodes connected to the matching path
        if (currentNode.type == NodeType.CONDITION && preferredLabel != null) {
            List<WorkflowNodeEntity> matchingNodes = outgoingEdges.stream()
                    .filter(e -> preferredLabel.equals(e.label) || preferredLabel.equals(e.sourcePortId))
                    .map(e -> e.targetNode)
                    .toList();

            if (!matchingNodes.isEmpty()) {
                return matchingNodes;
            }
            // Fallback to first edge if no match
            return List.of(outgoingEdges.get(0).targetNode);
        }

        // For all other nodes, return ALL connected nodes for execution
        List<WorkflowNodeEntity> nextNodes = new ArrayList<>();
        for (WorkflowEdgeEntity edge : outgoingEdges) {
            // If edge has a condition, only include if condition matches
            if (edge.condition != null && !edge.condition.isEmpty()) {
                if (evaluateEdgeCondition(context, edge.condition)) {
                    nextNodes.add(edge.targetNode);
                }
            } else {
                // No condition - always include
                nextNodes.add(edge.targetNode);
            }
        }

        return nextNodes;
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
