package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.WorkflowTriggerDTO;
import com.nuraly.workflows.dto.mapper.WorkflowTriggerDTOMapper;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.exception.TriggerNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.messaging.WorkflowExecutionMessage;
import com.nuraly.workflows.messaging.WorkflowExecutionProducer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class WorkflowTriggerService {

    @Inject
    WorkflowTriggerDTOMapper triggerDTOMapper;

    @Inject
    WorkflowExecutionProducer executionProducer;

    @Inject
    WorkflowEventService eventService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WorkflowTriggerDTO> getTriggers(UUID workflowId) {
        List<WorkflowTriggerEntity> triggers = WorkflowTriggerEntity.list("workflow.id", workflowId);
        List<WorkflowTriggerDTO> dtos = triggerDTOMapper.toDTOList(triggers);

        // Set webhook URLs
        for (WorkflowTriggerDTO dto : dtos) {
            if (dto.getType() == TriggerType.WEBHOOK && dto.getWebhookToken() != null) {
                dto.setWebhookUrl(configuration.webhookBaseUrl + "/api/v1/webhooks/" + dto.getWebhookToken());
            }
        }

        return dtos;
    }

    public WorkflowTriggerDTO createTrigger(UUID workflowId, WorkflowTriggerDTO triggerDTO)
            throws WorkflowNotFoundException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        WorkflowTriggerEntity trigger = triggerDTOMapper.toEntity(triggerDTO);
        trigger.workflow = workflow;
        trigger.persist();

        WorkflowTriggerDTO result = triggerDTOMapper.toDTO(trigger);
        if (result.getType() == TriggerType.WEBHOOK) {
            result.setWebhookUrl(configuration.webhookBaseUrl + "/api/v1/webhooks/" + trigger.webhookToken);
        }

        return result;
    }

    public WorkflowTriggerDTO updateTrigger(UUID triggerId, WorkflowTriggerDTO triggerDTO)
            throws TriggerNotFoundException {

        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            throw new TriggerNotFoundException("Trigger not found with id: " + triggerId);
        }

        triggerDTOMapper.updateEntity(triggerDTO, trigger);
        trigger.persist();

        WorkflowTriggerDTO result = triggerDTOMapper.toDTO(trigger);
        if (result.getType() == TriggerType.WEBHOOK) {
            result.setWebhookUrl(configuration.webhookBaseUrl + "/api/v1/webhooks/" + trigger.webhookToken);
        }

        return result;
    }

    public void deleteTrigger(UUID triggerId) throws TriggerNotFoundException {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            throw new TriggerNotFoundException("Trigger not found with id: " + triggerId);
        }
        trigger.delete();
    }

    public void enableTrigger(UUID triggerId) throws TriggerNotFoundException {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            throw new TriggerNotFoundException("Trigger not found with id: " + triggerId);
        }
        trigger.enabled = true;
        trigger.persist();
    }

    public void disableTrigger(UUID triggerId) throws TriggerNotFoundException {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            throw new TriggerNotFoundException("Trigger not found with id: " + triggerId);
        }
        trigger.enabled = false;
        trigger.persist();
    }

    public void triggerByWebhook(String webhookToken, JsonNode payload) throws Exception {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.find("webhookToken", webhookToken).firstResult();
        if (trigger == null) {
            throw new TriggerNotFoundException("Invalid webhook token");
        }

        if (!trigger.enabled) {
            throw new IllegalStateException("Trigger is disabled");
        }

        if (trigger.workflow.status != WorkflowStatus.ACTIVE) {
            throw new IllegalStateException("Workflow is not active");
        }

        // Update last triggered time
        trigger.lastTriggeredAt = Instant.now();
        trigger.persist();

        // Create and execute
        executeFromTrigger(trigger, payload, "webhook");
    }

    public List<WorkflowTriggerEntity> findEventTriggers(String eventType) {
        return WorkflowTriggerEntity.list(
                "type = ?1 and enabled = true and workflow.status = ?2",
                TriggerType.EVENT, WorkflowStatus.ACTIVE);
    }

    public void triggerByEvent(WorkflowTriggerEntity trigger, JsonNode payload) throws Exception {
        if (!trigger.enabled) {
            return;
        }

        if (trigger.workflow.status != WorkflowStatus.ACTIVE) {
            return;
        }

        trigger.lastTriggeredAt = Instant.now();
        trigger.persist();

        executeFromTrigger(trigger, payload, "event");
    }

    private void executeFromTrigger(WorkflowTriggerEntity trigger, JsonNode payload, String triggerType) throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = trigger.workflow;
        execution.status = ExecutionStatus.PENDING;
        execution.triggeredBy = String.valueOf(trigger.id);
        execution.triggerType = triggerType;
        execution.startedAt = Instant.now();

        String inputData = "{}";
        if (payload != null) {
            inputData = objectMapper.writeValueAsString(payload);
        }
        execution.inputData = inputData;

        execution.persist();

        // Log event - execution queued
        eventService.logExecutionQueued(execution);

        // Queue execution for async processing via RabbitMQ
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    trigger.workflow.id,
                    execution.triggeredBy,
                    triggerType,
                    inputData,
                    null
            );
            executionProducer.publishExecution(message);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue execution: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            throw e;
        }
    }
}
