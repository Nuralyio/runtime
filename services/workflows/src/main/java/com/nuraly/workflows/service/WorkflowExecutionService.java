package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.ExecuteWorkflowRequest;
import com.nuraly.workflows.dto.NodeExecutionDTO;
import com.nuraly.workflows.dto.WorkflowExecutionDTO;
import com.nuraly.workflows.dto.mapper.NodeExecutionDTOMapper;
import com.nuraly.workflows.dto.mapper.WorkflowExecutionDTOMapper;
import com.nuraly.workflows.engine.WorkflowEngine;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.dto.revision.WorkflowRevisionDTO;
import com.nuraly.workflows.exception.ExecutionNotFoundException;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.messaging.WorkflowExecutionMessage;
import com.nuraly.workflows.messaging.WorkflowExecutionProducer;
import com.nuraly.library.logging.LogClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class WorkflowExecutionService {

    @Inject
    WorkflowEngine workflowEngine;

    @Inject
    WorkflowExecutionDTOMapper executionDTOMapper;

    @Inject
    NodeExecutionDTOMapper nodeExecutionDTOMapper;

    @Inject
    WorkflowEventService eventService;

    @Inject
    WorkflowExecutionProducer executionProducer;

    @Inject
    WorkflowRevisionService revisionService;

    @Inject
    LogClient logClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WorkflowExecutionDTO executeWorkflow(UUID workflowId, ExecuteWorkflowRequest request, String userUuid)
            throws WorkflowNotFoundException, InvalidWorkflowException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Allow execution for ACTIVE and DRAFT (testing) workflows
        // Only block ARCHIVED or PAUSED workflows
        if (workflow.status == WorkflowStatus.ARCHIVED || workflow.status == WorkflowStatus.PAUSED) {
            throw new InvalidWorkflowException("Workflow cannot be executed. Current status: " + workflow.status);
        }

        // Snapshot current workflow state as a revision
        WorkflowRevisionDTO revisionDTO = revisionService.createRevision(
                workflowId, userUuid != null ? userUuid : "system", null);

        // Create execution record
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = workflow;
        execution.status = ExecutionStatus.PENDING;
        execution.triggeredBy = userUuid != null ? userUuid : "system";
        execution.triggerType = "manual";
        execution.revision = revisionDTO.getRevision();
        execution.startedAt = Instant.now();

        String inputData = "{}";
        String variables = null;

        if (request != null && request.getInput() != null) {
            try {
                inputData = objectMapper.writeValueAsString(request.getInput());
            } catch (Exception e) {
                inputData = "{}";
            }
        }
        execution.inputData = inputData;

        if (request != null && request.getVariables() != null) {
            variables = request.getVariables();
            execution.variables = variables;
        }

        execution.persist();

        // Log event - execution created
        eventService.logExecutionQueued(execution);

        // Queue execution for async processing via RabbitMQ
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    workflow.id,
                    execution.triggeredBy,
                    execution.triggerType,
                    inputData,
                    variables
            );

            // Set startNodeId if provided (for partial execution from a specific node)
            if (request != null && request.getStartNodeId() != null) {
                message.setStartNodeId(request.getStartNodeId());
            }

            executionProducer.publishExecution(message);

            // Update status to QUEUED
            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            logClient.info("execution", null, Map.of(
                    "action", "queued",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "trigger_type", "manual"
            ));

        } catch (Exception e) {
            // If queueing fails, mark as failed
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue execution: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());

            logClient.error("execution", null, Map.of(
                    "action", "queue_failed",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));
        }

        return executionDTOMapper.toDTO(execution);
    }

    /**
     * Execute a specific revision of a workflow.
     * The revision snapshot will be used instead of the current workflow state.
     */
    public WorkflowExecutionDTO executeWorkflowRevision(UUID workflowId, Integer revision,
                                                         ExecuteWorkflowRequest request, String userUuid)
            throws WorkflowNotFoundException, InvalidWorkflowException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Create execution record with revision
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = workflow;
        execution.status = ExecutionStatus.PENDING;
        execution.triggeredBy = userUuid != null ? userUuid : "system";
        execution.triggerType = "manual";
        execution.revision = revision;
        execution.startedAt = Instant.now();

        String inputData = "{}";
        String variables = null;

        if (request != null && request.getInput() != null) {
            try {
                inputData = objectMapper.writeValueAsString(request.getInput());
            } catch (Exception e) {
                inputData = "{}";
            }
        }
        execution.inputData = inputData;

        if (request != null && request.getVariables() != null) {
            variables = request.getVariables();
            execution.variables = variables;
        }

        execution.persist();

        // Log event - execution created
        eventService.logExecutionQueued(execution);

        // Queue execution for async processing via RabbitMQ with revision info
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    workflow.id,
                    execution.triggeredBy,
                    execution.triggerType,
                    inputData,
                    variables,
                    revision
            );
            executionProducer.publishExecution(message);

            // Update status to QUEUED
            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            logClient.info("execution", null, Map.of(
                    "action", "queued",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "trigger_type", "manual",
                    "revision", String.valueOf(revision)
            ));

        } catch (Exception e) {
            // If queueing fails, mark as failed
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue execution: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());

            logClient.error("execution", null, Map.of(
                    "action", "queue_failed",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));
        }

        return executionDTOMapper.toDTO(execution);
    }

    public List<WorkflowExecutionDTO> getExecutions(UUID workflowId) {
        List<WorkflowExecutionEntity> executions = WorkflowExecutionEntity.list(
                "workflow.id = ?1 order by startedAt desc", workflowId);
        return executionDTOMapper.toDTOList(executions);
    }

    public WorkflowExecutionDTO getExecution(UUID executionId) throws ExecutionNotFoundException {
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);
        if (execution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }
        return executionDTOMapper.toDTO(execution);
    }

    public List<NodeExecutionDTO> getNodeExecutions(UUID executionId) throws ExecutionNotFoundException {
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);
        if (execution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }
        return nodeExecutionDTOMapper.toDTOList(execution.nodeExecutions);
    }

    public void cancelExecution(UUID executionId) throws ExecutionNotFoundException {
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);
        if (execution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }

        if (execution.status == ExecutionStatus.RUNNING || execution.status == ExecutionStatus.PENDING) {
            execution.status = ExecutionStatus.CANCELLED;
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionCancelled(execution);

            logClient.info("execution", null, Map.of(
                    "action", "cancelled",
                    "execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(execution.workflow.id)
            ));
        }
    }

    public WorkflowExecutionDTO retryExecution(UUID executionId) throws ExecutionNotFoundException, InvalidWorkflowException {
        WorkflowExecutionEntity originalExecution = WorkflowExecutionEntity.findById(executionId);
        if (originalExecution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }

        if (originalExecution.status != ExecutionStatus.FAILED) {
            throw new InvalidWorkflowException("Can only retry failed executions. Current status: " + originalExecution.status);
        }

        // Create new execution with same input
        WorkflowExecutionEntity newExecution = new WorkflowExecutionEntity();
        newExecution.workflow = originalExecution.workflow;
        newExecution.status = ExecutionStatus.PENDING;
        newExecution.triggeredBy = originalExecution.triggeredBy;
        newExecution.triggerType = "retry";
        newExecution.inputData = originalExecution.inputData;
        newExecution.variables = originalExecution.variables;
        newExecution.startedAt = Instant.now();
        newExecution.persist();

        // Log event
        eventService.logExecutionQueued(newExecution);

        // Queue for async execution
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    newExecution.id,
                    newExecution.workflow.id,
                    newExecution.triggeredBy,
                    newExecution.triggerType,
                    newExecution.inputData,
                    newExecution.variables
            );
            executionProducer.publishExecution(message);

            newExecution.status = ExecutionStatus.QUEUED;
            newExecution.persist();

            logClient.info("execution", null, Map.of(
                    "action", "retry_queued",
                    "execution_id", String.valueOf(newExecution.id),
                    "original_execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(newExecution.workflow.id)
            ));

        } catch (Exception e) {
            newExecution.status = ExecutionStatus.FAILED;
            newExecution.errorMessage = "Failed to queue retry execution: " + e.getMessage();
            newExecution.completedAt = Instant.now();
            newExecution.durationMs = newExecution.completedAt.toEpochMilli() - newExecution.startedAt.toEpochMilli();
            newExecution.persist();

            eventService.logExecutionFailed(newExecution, e.getMessage());

            logClient.error("execution", null, Map.of(
                    "action", "retry_queue_failed",
                    "execution_id", String.valueOf(newExecution.id),
                    "workflow_id", String.valueOf(newExecution.workflow.id),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));
        }

        return executionDTOMapper.toDTO(newExecution);
    }

    public WorkflowExecutionDTO resumeExecution(UUID executionId) throws ExecutionNotFoundException, InvalidWorkflowException {
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);
        if (execution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }

        if (execution.status != ExecutionStatus.PAUSED && execution.status != ExecutionStatus.WAITING) {
            throw new InvalidWorkflowException("Can only resume paused or waiting executions. Current status: " + execution.status);
        }

        // Log event
        eventService.logExecutionResumed(execution);

        // Queue for async execution
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    execution.workflow.id,
                    execution.triggeredBy,
                    "resume",
                    execution.inputData,
                    execution.variables
            );
            executionProducer.publishExecution(message);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            logClient.info("execution", null, Map.of(
                    "action", "resumed",
                    "execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(execution.workflow.id)
            ));

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue resume execution: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());

            logClient.error("execution", null, Map.of(
                    "action", "resume_failed",
                    "execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(execution.workflow.id),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));
        }

        return executionDTOMapper.toDTO(execution);
    }

    /**
     * Retry a specific node within an execution.
     * This restores the execution context and re-runs the node from its current state.
     */
    public WorkflowExecutionDTO retryNode(UUID executionId, UUID nodeId) throws ExecutionNotFoundException, InvalidWorkflowException {
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);
        if (execution == null) {
            throw new ExecutionNotFoundException("Execution not found with id: " + executionId);
        }

        // Allow retry for failed, completed, or queued (previous retry) executions
        if (execution.status != ExecutionStatus.FAILED &&
            execution.status != ExecutionStatus.COMPLETED &&
            execution.status != ExecutionStatus.QUEUED) {
            throw new InvalidWorkflowException("Can only retry nodes in failed, completed, or queued executions. Current status: " + execution.status);
        }

        // Queue for async execution with node retry info
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    execution.workflow.id,
                    execution.triggeredBy,
                    "node_retry",
                    execution.inputData,
                    execution.variables
            );
            message.setRetryNodeId(nodeId);
            executionProducer.publishExecution(message);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            logClient.info("execution", null, Map.of(
                    "action", "node_retry_queued",
                    "execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(execution.workflow.id),
                    "node_id", String.valueOf(nodeId)
            ));

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue node retry: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());

            logClient.error("execution", null, Map.of(
                    "action", "node_retry_failed",
                    "execution_id", String.valueOf(executionId),
                    "workflow_id", String.valueOf(execution.workflow.id),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));
        }

        return executionDTOMapper.toDTO(execution);
    }

    /**
     * Get the latest execution for a workflow (completed or failed).
     * Returns execution with node executions included.
     */
    public WorkflowExecutionDTO getLatestExecution(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Find the latest completed or failed execution
        WorkflowExecutionEntity latestExecution = WorkflowExecutionEntity
                .find("workflow.id = ?1 AND status IN (?2, ?3) ORDER BY completedAt DESC",
                        workflowId, ExecutionStatus.COMPLETED, ExecutionStatus.FAILED)
                .firstResult();

        if (latestExecution == null) {
            return null;
        }

        return executionDTOMapper.toDTO(latestExecution);
    }

    /**
     * Get the latest successful execution's node outputs for a workflow.
     * Returns a map of nodeId -> parsed outputData for variable discovery.
     */
    public java.util.Map<String, JsonNode> getLatestNodeOutputs(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Find the latest completed or failed execution (we want real output data)
        WorkflowExecutionEntity latestExecution = WorkflowExecutionEntity
                .find("workflow.id = ?1 AND status IN (?2, ?3) ORDER BY completedAt DESC",
                        workflowId, ExecutionStatus.COMPLETED, ExecutionStatus.FAILED)
                .firstResult();

        java.util.Map<String, JsonNode> nodeOutputs = new java.util.HashMap<>();

        if (latestExecution == null) {
            return nodeOutputs; // No executions yet
        }

        // Get all node executions for this execution
        for (var nodeExecution : latestExecution.nodeExecutions) {
            if (nodeExecution.outputData != null && !nodeExecution.outputData.isEmpty()) {
                try {
                    JsonNode output = objectMapper.readTree(nodeExecution.outputData);
                    nodeOutputs.put(nodeExecution.node.id.toString(), output);
                } catch (Exception e) {
                    // Skip invalid JSON
                }
            }
        }

        return nodeOutputs;
    }
}
