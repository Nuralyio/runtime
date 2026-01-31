package com.nuraly.workflows.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.executors.NodeExecutor;
import com.nuraly.workflows.entity.*;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.exception.WorkflowExecutionException;
import com.nuraly.workflows.dto.revision.RevisionSnapshotDTO;
import com.nuraly.workflows.exception.RevisionNotFoundException;
import com.nuraly.workflows.monitoring.WorkflowMetricsService;
import com.nuraly.workflows.redis.ExecutionCheckpointService;
import com.nuraly.workflows.redis.ExecutionCheckpointService.ExecutionCheckpoint;
import com.nuraly.workflows.redis.WorkflowCacheService;
import com.nuraly.workflows.service.WorkflowEventService;
import com.nuraly.workflows.service.WorkflowRevisionService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.*;

/**
 * Workflow execution engine with Redis-backed checkpointing.
 * Supports crash recovery by resuming from the last completed node.
 */
@ApplicationScoped
public class WorkflowEngine {

    private static final Logger LOG = Logger.getLogger(WorkflowEngine.class);

    @Inject
    NodeExecutorFactory nodeExecutorFactory;

    @Inject
    WorkflowEventService eventService;

    @Inject
    Configuration configuration;

    @Inject
    WorkflowCacheService workflowCacheService;

    @Inject
    ExecutionCheckpointService checkpointService;

    @Inject
    WorkflowMetricsService metricsService;

    @Inject
    WorkflowRevisionService revisionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public void execute(WorkflowExecutionEntity execution) throws WorkflowExecutionException {
        metricsService.recordExecutionStart();
        long startTime = System.currentTimeMillis();

        ExecutionContext context = new ExecutionContext(execution);

        // Load revision snapshot if executing a specific revision
        if (execution.revision != null) {
            try {
                RevisionSnapshotDTO snapshot = revisionService.getRevisionSnapshot(
                        execution.workflow.id, execution.revision);
                context.setRevisionSnapshot(snapshot);
                LOG.infof("Executing workflow %s with revision %d snapshot",
                        execution.workflow.id, execution.revision);
            } catch (RevisionNotFoundException e) {
                throw new WorkflowExecutionException(
                        "Revision " + execution.revision + " not found for workflow " + execution.workflow.id);
            }
        }

        execution.status = ExecutionStatus.RUNNING;
        execution.persist();

        try {
            // Check for existing checkpoint (resume after crash)
            Optional<ExecutionCheckpoint> checkpoint = checkpointService.getCheckpoint(execution.id);
            if (checkpoint.isPresent()) {
                LOG.infof("Resuming execution %s from checkpoint (last node: %s)",
                        execution.id, checkpoint.get().lastCompletedNodeId);
                resumeFromCheckpoint(context, checkpoint.get());
            } else {
                // Fresh execution - start from beginning with trigger type
                executeFromStart(context);
            }

            // Mark as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.outputData = context.getVariablesAsString();
            execution.variables = context.getVariablesAsString();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            // Clean up checkpoint
            checkpointService.deleteCheckpoint(execution.id);

            // Cache workflow for future executions
            workflowCacheService.cacheWorkflow(execution.workflow);

            eventService.logExecutionCompleted(execution);
            metricsService.recordExecutionComplete(ExecutionStatus.COMPLETED,
                    System.currentTimeMillis() - startTime);

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            // Keep checkpoint for potential manual retry
            // checkpointService.deleteCheckpoint(execution.id);

            eventService.logExecutionFailed(execution, e.getMessage());
            metricsService.recordExecutionComplete(ExecutionStatus.FAILED,
                    System.currentTimeMillis() - startTime);

            throw new WorkflowExecutionException("Workflow execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * Execute workflow from the start node.
     */
    private void executeFromStart(ExecutionContext context) throws Exception {
        WorkflowExecutionEntity execution = context.getExecution();
        WorkflowNodeEntity startNode = findStartNode(execution.workflow, execution.triggerType);
        if (startNode == null) {
            throw new WorkflowExecutionException("No START node found in workflow for trigger type: " + execution.triggerType);
        }
        executeFromNode(context, startNode);
    }

    /**
     * Resume execution from a checkpoint (after worker crash).
     */
    private void resumeFromCheckpoint(ExecutionContext context, ExecutionCheckpoint checkpoint) throws Exception {
        // Restore context from checkpoint
        if (checkpoint.nodeOutputs != null) {
            for (Map.Entry<UUID, JsonNode> entry : checkpoint.nodeOutputs.entrySet()) {
                context.setNodeOutput(entry.getKey(), entry.getValue());
            }
        }

        if (checkpoint.variables != null) {
            context.restoreVariables(checkpoint.variables);
        }

        // Find the node to resume from (next node after last completed)
        WorkflowNodeEntity lastCompletedNode = findNodeById(
                context.getExecution().workflow, checkpoint.lastCompletedNodeId);

        if (lastCompletedNode == null) {
            LOG.warnf("Last completed node %s not found, restarting from beginning",
                    checkpoint.lastCompletedNodeId);
            executeFromStart(context);
            return;
        }

        // If there was a node in progress when crash happened, re-execute it
        if (checkpoint.currentNodeId != null) {
            WorkflowNodeEntity currentNode = findNodeById(
                    context.getExecution().workflow, checkpoint.currentNodeId);
            if (currentNode != null) {
                LOG.infof("Re-executing interrupted node: %s", currentNode.name);
                executeFromNode(context, currentNode);
                return;
            }
        }

        // Find and execute next nodes after last completed
        List<WorkflowNodeEntity> nextNodes = findNextNodes(context, lastCompletedNode, null);
        for (WorkflowNodeEntity nextNode : nextNodes) {
            executeFromNode(context, nextNode);
        }
    }

    @Transactional
    public void resume(WorkflowExecutionEntity execution) throws WorkflowExecutionException {
        // Check for checkpoint first
        if (checkpointService.hasCheckpoint(execution.id)) {
            execute(execution);
        } else {
            // No checkpoint, restart from beginning
            execute(execution);
        }
    }

    /**
     * Execute workflow starting from a specific node (partial execution).
     * Used for testing specific workflow branches (e.g., Document Loader with test data).
     */
    @Transactional
    public void executeFromStartNode(WorkflowExecutionEntity execution, UUID startNodeId) throws WorkflowExecutionException {
        metricsService.recordExecutionStart();
        long startTime = System.currentTimeMillis();

        ExecutionContext context = new ExecutionContext(execution);

        // Load revision snapshot if executing a specific revision
        if (execution.revision != null) {
            try {
                RevisionSnapshotDTO snapshot = revisionService.getRevisionSnapshot(
                        execution.workflow.id, execution.revision);
                context.setRevisionSnapshot(snapshot);
                LOG.infof("Executing workflow %s with revision %d snapshot from node %s",
                        execution.workflow.id, execution.revision, startNodeId);
            } catch (RevisionNotFoundException e) {
                throw new WorkflowExecutionException(
                        "Revision " + execution.revision + " not found for workflow " + execution.workflow.id);
            }
        }

        // Find the specific start node
        WorkflowNodeEntity startNode = findNodeById(execution.workflow, startNodeId);
        if (startNode == null) {
            throw new WorkflowExecutionException("Start node not found with id: " + startNodeId);
        }

        LOG.infof("Starting partial execution of workflow %s from node '%s' (%s)",
                execution.workflow.id, startNode.name, startNode.type);

        execution.status = ExecutionStatus.RUNNING;
        execution.persist();

        try {
            executeFromNode(context, startNode);

            // Mark as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.outputData = context.getVariablesAsString();
            execution.variables = context.getVariablesAsString();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            // Clean up checkpoint
            checkpointService.deleteCheckpoint(execution.id);

            // Cache workflow for future executions
            workflowCacheService.cacheWorkflow(execution.workflow);

            eventService.logExecutionCompleted(execution);
            metricsService.recordExecutionComplete(ExecutionStatus.COMPLETED,
                    System.currentTimeMillis() - startTime);

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            metricsService.recordExecutionComplete(ExecutionStatus.FAILED,
                    System.currentTimeMillis() - startTime);

            throw new WorkflowExecutionException("Workflow execution from node failed: " + e.getMessage(), e);
        }
    }

    /**
     * Retry a specific node within an execution.
     * Restores the execution context from before the node failed and re-executes it.
     */
    @Transactional
    public void retryNode(WorkflowExecutionEntity execution, UUID nodeId) throws WorkflowExecutionException {
        metricsService.recordExecutionStart();
        long startTime = System.currentTimeMillis();

        ExecutionContext context = new ExecutionContext(execution);

        // Load revision snapshot if executing a specific revision
        if (execution.revision != null) {
            try {
                RevisionSnapshotDTO snapshot = revisionService.getRevisionSnapshot(
                        execution.workflow.id, execution.revision);
                context.setRevisionSnapshot(snapshot);
            } catch (RevisionNotFoundException e) {
                throw new WorkflowExecutionException(
                        "Revision " + execution.revision + " not found for workflow " + execution.workflow.id);
            }
        }

        // Find the node to retry
        WorkflowNodeEntity nodeToRetry = findNodeById(execution.workflow, nodeId);
        if (nodeToRetry == null) {
            throw new WorkflowExecutionException("Node not found with id: " + nodeId);
        }

        // Restore context from checkpoint if available
        Optional<ExecutionCheckpoint> checkpoint = checkpointService.getCheckpoint(execution.id);
        if (checkpoint.isPresent()) {
            LOG.infof("Restoring context from checkpoint for node retry");
            if (checkpoint.get().nodeOutputs != null) {
                for (Map.Entry<UUID, JsonNode> entry : checkpoint.get().nodeOutputs.entrySet()) {
                    context.setNodeOutput(entry.getKey(), entry.getValue());
                }
            }
            if (checkpoint.get().variables != null) {
                context.restoreVariables(checkpoint.get().variables);
            }
        }

        execution.status = ExecutionStatus.RUNNING;
        execution.errorMessage = null; // Clear previous error
        execution.persist();

        try {
            LOG.infof("Retrying node '%s' in execution %s", nodeToRetry.name, execution.id);
            executeFromNode(context, nodeToRetry);

            // Mark as completed
            execution.status = ExecutionStatus.COMPLETED;
            execution.outputData = context.getVariablesAsString();
            execution.variables = context.getVariablesAsString();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            // Clean up checkpoint
            checkpointService.deleteCheckpoint(execution.id);

            eventService.logExecutionCompleted(execution);
            metricsService.recordExecutionComplete(ExecutionStatus.COMPLETED,
                    System.currentTimeMillis() - startTime);

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            metricsService.recordExecutionComplete(ExecutionStatus.FAILED,
                    System.currentTimeMillis() - startTime);

            throw new WorkflowExecutionException("Node retry failed: " + e.getMessage(), e);
        }
    }

    private void executeFromNode(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (context.isCancelled()) {
            return;
        }

        context.setCurrentNode(node);
        long nodeStartTime = System.currentTimeMillis();

        // Mark node as in-progress for crash detection
        checkpointService.markNodeInProgress(context.getExecution().id, node.id);

        // Override node configuration from snapshot if doing revision execution
        // This allows executing with historical node configurations
        String originalConfiguration = node.configuration;
        if (context.isRevisionExecution()) {
            String snapshotConfig = context.getNodeConfiguration(node.id, node.configuration);
            if (snapshotConfig != null) {
                node.configuration = snapshotConfig;
                LOG.debugf("Using snapshot configuration for node %s (revision execution)", node.name);
            }
        }

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

        // Execute node with retry logic - use try-finally to ensure config is restored
        NodeExecutionResult result;
        try {
            result = executeNodeWithRetry(context, node, nodeExecution);
        } finally {
            // Restore original configuration to avoid JPA dirty checking issues
            node.configuration = originalConfiguration;
        }

        // Update node execution record
        nodeExecution.completedAt = Instant.now();
        nodeExecution.durationMs = nodeExecution.completedAt.toEpochMilli() - nodeExecution.startedAt.toEpochMilli();

        if (result.isSuccess()) {
            nodeExecution.status = ExecutionStatus.COMPLETED;
            if (result.getOutput() != null) {
                nodeExecution.outputData = objectMapper.writeValueAsString(result.getOutput());
                context.setNodeOutput(node.id, result.getOutput());
            }

            // Save checkpoint after successful node execution
            checkpointService.saveCheckpoint(
                    context.getExecution().id,
                    node.id,
                    context.getVariablesAsString(),
                    context.getNodeOutputs()
            );
            checkpointService.clearCurrentNode(context.getExecution().id);

        } else {
            nodeExecution.status = ExecutionStatus.FAILED;
            nodeExecution.errorMessage = result.getErrorMessage();
        }

        nodeExecution.persist();
        eventService.logNodeExecuted(nodeExecution);

        // Record node metrics
        metricsService.recordNodeExecution(
                node.type.name(),
                result.isSuccess(),
                System.currentTimeMillis() - nodeStartTime
        );

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
                    LOG.infof("Node '%s' failed (%s), retrying (attempt %d)...", node.name, lastError, attempt + 1);
                    Thread.sleep(retryDelay);
                }

            } catch (Exception e) {
                lastError = e.getMessage();
                if (attempt > maxRetries) {
                    return NodeExecutionResult.failure(lastError);
                }

                LOG.infof("Node '%s' threw exception, retrying (attempt %d): %s",
                        node.name, attempt + 1, e.getMessage());
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

    private WorkflowNodeEntity findNodeById(WorkflowEntity workflow, UUID nodeId) {
        if (nodeId == null) return null;
        return workflow.nodes.stream()
                .filter(n -> n.id.equals(nodeId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Find next nodes to execute.
     * - For CONDITION nodes: returns ALL nodes connected to the matching path (true or false)
     * - For other nodes: returns ALL connected nodes for execution
     * - For nodes with multiple INPUT ports: only returns node if ALL INPUT ports have received data
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
                // Filter by join readiness
                return matchingNodes.stream()
                        .filter(node -> areAllInputPortsReady(context, node))
                        .toList();
            }
            // Fallback to first edge if no match
            WorkflowNodeEntity fallbackNode = outgoingEdges.get(0).targetNode;
            if (areAllInputPortsReady(context, fallbackNode)) {
                return List.of(fallbackNode);
            }
            return List.of();
        }

        // For all other nodes, return ALL connected nodes for execution
        // but only if their INPUT ports are all ready (join pattern)
        List<WorkflowNodeEntity> nextNodes = new ArrayList<>();
        for (WorkflowEdgeEntity edge : outgoingEdges) {
            // If edge has a condition, only include if condition matches
            if (edge.condition != null && !edge.condition.isEmpty()) {
                if (evaluateEdgeCondition(context, edge.condition)) {
                    // Check if all INPUT ports are ready for this target node
                    if (areAllInputPortsReady(context, edge.targetNode)) {
                        nextNodes.add(edge.targetNode);
                    }
                }
            } else {
                // No condition - check if all INPUT ports are ready
                if (areAllInputPortsReady(context, edge.targetNode)) {
                    nextNodes.add(edge.targetNode);
                }
            }
        }

        return nextNodes;
    }

    /**
     * Check if all INPUT ports of a node have received data.
     * This implements "join" semantics for nodes with multiple input connections.
     *
     * INPUT ports are data-flow ports (like "in", "retriever") that must all have data.
     * CONFIG ports (like "llm", "prompt", "memory", "tools") are optional configuration connections.
     */
    private boolean areAllInputPortsReady(ExecutionContext context, WorkflowNodeEntity targetNode) {
        // Find all edges targeting this node
        List<WorkflowEdgeEntity> incomingEdges = targetNode.workflow.edges.stream()
                .filter(e -> e.targetNode.id.equals(targetNode.id))
                .toList();

        if (incomingEdges.isEmpty()) {
            return true; // No incoming edges, ready to execute
        }

        // Group edges by target port - we only care about INPUT ports, not CONFIG ports
        // INPUT ports: "in", "retriever", "input", or any port that's not a known CONFIG port
        // CONFIG ports: "llm", "prompt", "memory", "tools", "config"
        Set<String> configPorts = Set.of("llm", "prompt", "memory", "tools", "config");

        // Find all unique INPUT port connections (non-config ports)
        Set<UUID> inputSourceNodes = new HashSet<>();
        for (WorkflowEdgeEntity edge : incomingEdges) {
            String portId = edge.targetPortId;
            // If no portId specified, assume it's the main input
            if (portId == null || portId.isEmpty()) {
                portId = "in";
            }

            // Only track INPUT ports, not CONFIG ports
            if (!configPorts.contains(portId.toLowerCase())) {
                inputSourceNodes.add(edge.sourceNode.id);
            }
        }

        // If only 0 or 1 INPUT sources, no join needed
        if (inputSourceNodes.size() <= 1) {
            return true;
        }

        // Check if ALL INPUT source nodes have completed (have output in context)
        for (UUID sourceNodeId : inputSourceNodes) {
            if (context.getNodeOutput(sourceNodeId) == null) {
                LOG.debugf("Node %s waiting for input from node %s (join pattern)",
                        targetNode.name, sourceNodeId);
                return false;
            }
        }

        LOG.debugf("Node %s has all %d INPUT ports ready, proceeding with execution",
                targetNode.name, inputSourceNodes.size());
        return true;
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
