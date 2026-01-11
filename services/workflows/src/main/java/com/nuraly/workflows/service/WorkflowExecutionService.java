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
import com.nuraly.workflows.exception.ExecutionNotFoundException;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    public WorkflowExecutionDTO executeWorkflow(UUID workflowId, ExecuteWorkflowRequest request, String userUuid)
            throws WorkflowNotFoundException, InvalidWorkflowException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        if (workflow.status != WorkflowStatus.ACTIVE) {
            throw new InvalidWorkflowException("Workflow is not active. Current status: " + workflow.status);
        }

        // Create execution record
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = workflow;
        execution.status = ExecutionStatus.PENDING;
        execution.triggeredBy = userUuid != null ? userUuid : "system";
        execution.triggerType = "manual";
        execution.startedAt = Instant.now();

        if (request != null && request.getInput() != null) {
            try {
                execution.inputData = objectMapper.writeValueAsString(request.getInput());
            } catch (Exception e) {
                execution.inputData = "{}";
            }
        }

        if (request != null && request.getVariables() != null) {
            execution.variables = request.getVariables();
        }

        execution.persist();

        // Log event
        eventService.logExecutionStarted(execution);

        // Execute asynchronously (in real implementation, this would be async)
        try {
            workflowEngine.execute(execution);
        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
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

        // Execute
        try {
            workflowEngine.execute(newExecution);
        } catch (Exception e) {
            newExecution.status = ExecutionStatus.FAILED;
            newExecution.errorMessage = e.getMessage();
            newExecution.completedAt = Instant.now();
            newExecution.durationMs = newExecution.completedAt.toEpochMilli() - newExecution.startedAt.toEpochMilli();
            newExecution.persist();

            eventService.logExecutionFailed(newExecution, e.getMessage());
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

        execution.status = ExecutionStatus.RUNNING;
        execution.persist();

        try {
            workflowEngine.resume(execution);
        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
        }

        return executionDTOMapper.toDTO(execution);
    }
}
