package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.HttpWorkflowResponse;
import com.nuraly.workflows.dto.WorkflowTriggerDTO;
import com.nuraly.workflows.dto.mapper.WorkflowTriggerDTOMapper;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.exception.TriggerNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.messaging.RabbitMQConnectionManager;
import com.nuraly.workflows.messaging.WorkflowExecutionMessage;
import com.nuraly.workflows.messaging.WorkflowExecutionProducer;
import com.nuraly.workflows.triggers.connectors.TelegramConnector;
import com.nuraly.library.logging.LogClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class WorkflowTriggerService {

    private static final Logger LOG = Logger.getLogger(WorkflowTriggerService.class);

    @Inject
    WorkflowTriggerService self; // Self-injection for CDI interception

    @Inject
    WorkflowTriggerDTOMapper triggerDTOMapper;

    @Inject
    WorkflowExecutionProducer executionProducer;

    @Inject
    WorkflowEventService eventService;

    @Inject
    RabbitMQConnectionManager connectionManager;

    @Inject
    Configuration configuration;

    @Inject
    LogClient logClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WorkflowTriggerDTO> getTriggers(UUID workflowId) {
        List<WorkflowTriggerEntity> triggers = WorkflowTriggerEntity.list("workflow.id", workflowId);
        List<WorkflowTriggerDTO> dtos = triggerDTOMapper.toDTOList(triggers);

        // Set webhook URLs
        for (WorkflowTriggerDTO dto : dtos) {
            if ((dto.getType() == TriggerType.WEBHOOK || dto.getType() == TriggerType.TELEGRAM_BOT)
                    && dto.getWebhookToken() != null) {
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
        if (result.getType() == TriggerType.WEBHOOK || result.getType() == TriggerType.TELEGRAM_BOT) {
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
        if (result.getType() == TriggerType.WEBHOOK || result.getType() == TriggerType.TELEGRAM_BOT) {
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

    /**
     * Trigger workflow directly by workflow ID (sync mode for HTTP triggers).
     *
     * @param workflowId The workflow ID
     * @param path       Optional custom path (from HTTP_START node config)
     * @param payload    The request payload
     * @param timeoutMs  Timeout in milliseconds
     * @return The HTTP workflow response
     */
    public HttpWorkflowResponse triggerByWorkflowId(UUID workflowId, String path, JsonNode payload, long timeoutMs)
            throws WorkflowNotFoundException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        if (workflow.status != WorkflowStatus.ACTIVE && workflow.status != WorkflowStatus.DRAFT) {
            throw new IllegalStateException("Workflow is not active or draft");
        }

        if (!hasHttpStartNode(workflow)) {
            throw new IllegalStateException("Workflow has no HTTP trigger (HTTP_START node)");
        }

        logClient.info("trigger", null, java.util.Map.of(
                "action", "http_triggered",
                "workflow_id", String.valueOf(workflowId)
        ));

        // Execute synchronously
        return executeSyncFromWorkflow(workflow, payload, "http_trigger", timeoutMs);
    }

    /**
     * Trigger workflow via webhook (async mode).
     */
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

        logClient.info("trigger", null, java.util.Map.of(
                "action", "webhook_triggered",
                "trigger_id", String.valueOf(trigger.id),
                "workflow_id", String.valueOf(trigger.workflow.id)
        ));

        // Create and execute
        executeFromTrigger(trigger, payload, "webhook");
    }

    /**
     * Trigger workflow via webhook (sync mode).
     * Waits for workflow completion and returns HTTP_END response.
     *
     * @param webhookToken The webhook token
     * @param payload      The request payload
     * @param timeoutMs    Timeout in milliseconds
     * @return The HTTP workflow response
     */
    public HttpWorkflowResponse triggerByWebhookSync(String webhookToken, JsonNode payload, long timeoutMs) throws Exception {
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

        // Execute synchronously
        return executeSyncFromTrigger(trigger, payload, "webhook", timeoutMs);
    }

    /**
     * Check if a workflow has an HTTP_START node (indicating it should use sync mode).
     */
    public boolean hasHttpStartNode(String webhookToken) {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.find("webhookToken", webhookToken).firstResult();
        if (trigger == null || trigger.workflow == null) {
            return false;
        }

        return hasHttpStartNode(trigger.workflow);
    }

    /**
     * Check if a workflow has an HTTP_START node.
     */
    public boolean hasHttpStartNode(WorkflowEntity workflow) {
        if (workflow.nodes == null) {
            return false;
        }

        for (WorkflowNodeEntity node : workflow.nodes) {
            if (node.type == NodeType.HTTP_START) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a workflow has an HTTP_END node.
     */
    public boolean hasHttpEndNode(WorkflowEntity workflow) {
        if (workflow.nodes == null) {
            return false;
        }

        for (WorkflowNodeEntity node : workflow.nodes) {
            if (node.type == NodeType.HTTP_END) {
                return true;
            }
        }
        return false;
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

    /**
     * Trigger workflow asynchronously by workflow ID.
     * Used by chatbot to trigger workflows - returns immediately with execution entity.
     * The chatbot will track progress via socket.io.
     *
     * @param workflowId  The workflow ID
     * @param triggerType The trigger type (e.g., "CHAT", "API")
     * @param payload     The input payload
     * @return The execution entity (can be null if failed to queue)
     */
    public WorkflowExecutionEntity triggerAsync(UUID workflowId, String triggerType, JsonNode payload)
            throws WorkflowNotFoundException {

        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        if (workflow.status != WorkflowStatus.ACTIVE && workflow.status != WorkflowStatus.DRAFT) {
            throw new IllegalStateException("Workflow is not active or draft");
        }

        // Create execution in separate transaction
        UUID executionId = self.createExecutionFromWorkflow(workflowId, payload, triggerType.toLowerCase());

        // Re-fetch execution in current transaction
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);

        // Queue execution for async processing via RabbitMQ
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    workflow.id,
                    execution.triggeredBy,
                    triggerType.toLowerCase(),
                    execution.inputData,
                    null
            );
            executionProducer.publishExecution(message);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            eventService.logExecutionQueued(execution);

            logClient.info("execution", null, java.util.Map.of(
                    "action", "async_queued",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "trigger_type", triggerType.toLowerCase()
            ));

            return execution;

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to queue execution: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            LOG.errorf(e, "Failed to queue async execution for workflow %s", workflowId);

            logClient.error("execution", null, java.util.Map.of(
                    "action", "async_queue_failed",
                    "execution_id", String.valueOf(execution.id),
                    "workflow_id", String.valueOf(workflowId),
                    "error", e.getMessage() != null ? e.getMessage() : "unknown"
            ));

            return null;
        }
    }

    /**
     * Execute workflow asynchronously.
     */
    private void executeFromTrigger(WorkflowTriggerEntity trigger, JsonNode payload, String triggerType) throws Exception {
        WorkflowExecutionEntity execution = createExecution(trigger, payload, triggerType);

        // Queue execution for async processing via RabbitMQ
        try {
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    trigger.workflow.id,
                    execution.triggeredBy,
                    triggerType,
                    execution.inputData,
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

    /**
     * Execute workflow synchronously directly from workflow (for direct HTTP triggers).
     */
    private HttpWorkflowResponse executeSyncFromWorkflow(WorkflowEntity workflow, JsonNode payload,
                                                          String triggerType, long timeoutMs) {
        // Use self-injection to ensure REQUIRES_NEW transaction is intercepted
        // Returns execution ID since the entity will be detached after the transaction commits
        UUID executionId = self.createExecutionFromWorkflow(workflow.id, payload, triggerType);

        // Re-fetch the execution entity in current transaction context
        WorkflowExecutionEntity execution = WorkflowExecutionEntity.findById(executionId);

        // Generate correlation ID and create reply queue
        String correlationId = UUID.randomUUID().toString();
        String replyQueueName;

        try {
            replyQueueName = connectionManager.createReplyQueue(correlationId);
        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to create reply queue: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            return HttpWorkflowResponse.error(correlationId, executionId, e.getMessage());
        }

        try {
            // Publish execution with reply queue
            String inputData = "{}";
            if (payload != null) {
                inputData = objectMapper.writeValueAsString(payload);
            }

            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    executionId,
                    workflow.id,
                    "http_trigger",
                    triggerType,
                    inputData,
                    null,
                    replyQueueName,
                    correlationId
            );
            executionProducer.publishSyncExecution(message, replyQueueName, correlationId);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            LOG.infof("Waiting for sync workflow response: executionId=%s, correlationId=%s, timeout=%dms",
                    executionId, correlationId, timeoutMs);

            // Wait for reply
            HttpWorkflowResponse response = connectionManager.waitForReply(replyQueueName, correlationId, timeoutMs);

            if (response == null) {
                LOG.warnf("Sync workflow execution timed out: executionId=%s", executionId);
                return HttpWorkflowResponse.timeout(correlationId, executionId, timeoutMs);
            }

            return response;

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Sync execution failed: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            return HttpWorkflowResponse.error(correlationId, executionId, e.getMessage());

        } finally {
            connectionManager.cleanupReplyQueue(correlationId);
        }
    }

    /**
     * Execute workflow synchronously with reply queue.
     */
    private HttpWorkflowResponse executeSyncFromTrigger(WorkflowTriggerEntity trigger, JsonNode payload,
                                                         String triggerType, long timeoutMs) throws Exception {
        WorkflowExecutionEntity execution = createExecution(trigger, payload, triggerType);

        // Generate correlation ID and create reply queue
        String correlationId = UUID.randomUUID().toString();
        String replyQueueName;

        try {
            replyQueueName = connectionManager.createReplyQueue(correlationId);
        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Failed to create reply queue: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            return HttpWorkflowResponse.error(correlationId, execution.id, e.getMessage());
        }

        try {
            // Publish execution with reply queue
            WorkflowExecutionMessage message = new WorkflowExecutionMessage(
                    execution.id,
                    trigger.workflow.id,
                    execution.triggeredBy,
                    triggerType,
                    execution.inputData,
                    null,
                    replyQueueName,
                    correlationId
            );
            executionProducer.publishSyncExecution(message, replyQueueName, correlationId);

            execution.status = ExecutionStatus.QUEUED;
            execution.persist();

            LOG.infof("Waiting for sync workflow response: executionId=%s, correlationId=%s, timeout=%dms",
                    execution.id, correlationId, timeoutMs);

            // Wait for reply
            HttpWorkflowResponse response = connectionManager.waitForReply(replyQueueName, correlationId, timeoutMs);

            if (response == null) {
                // Timeout
                LOG.warnf("Sync workflow execution timed out: executionId=%s", execution.id);
                return HttpWorkflowResponse.timeout(correlationId, execution.id, timeoutMs);
            }

            return response;

        } catch (Exception e) {
            execution.status = ExecutionStatus.FAILED;
            execution.errorMessage = "Sync execution failed: " + e.getMessage();
            execution.completedAt = Instant.now();
            execution.durationMs = execution.completedAt.toEpochMilli() - execution.startedAt.toEpochMilli();
            execution.persist();

            eventService.logExecutionFailed(execution, e.getMessage());
            return HttpWorkflowResponse.error(correlationId, execution.id, e.getMessage());

        } finally {
            // Cleanup reply queue
            connectionManager.cleanupReplyQueue(correlationId);
        }
    }

    /**
     * Create execution entity from workflow (for direct HTTP triggers).
     * Uses REQUIRES_NEW to ensure the execution is committed before returning.
     * Returns the execution ID since the entity will be detached after this transaction commits.
     */
    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public UUID createExecutionFromWorkflow(UUID workflowId, JsonNode payload, String triggerType) {
        // Re-fetch workflow in new transaction context
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = workflow;
        execution.status = ExecutionStatus.PENDING;
        execution.triggeredBy = "http_trigger";
        execution.triggerType = triggerType;
        execution.startedAt = Instant.now();

        String inputData = "{}";
        if (payload != null) {
            try {
                inputData = objectMapper.writeValueAsString(payload);
            } catch (Exception e) {
                LOG.warnf("Failed to serialize payload: %s", e.getMessage());
            }
        }
        execution.inputData = inputData;

        execution.persist();

        // Log event
        eventService.logExecutionQueued(execution);

        return execution.id;
    }

    /**
     * Create execution entity.
     */
    private WorkflowExecutionEntity createExecution(WorkflowTriggerEntity trigger, JsonNode payload,
                                                      String triggerType) throws Exception {
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

        return execution;
    }

    /**
     * Validate the Telegram secret token for a webhook trigger.
     */
    public boolean validateTelegramSecret(String webhookToken, String secretToken,
                                           TelegramConnector telegramConnector) {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.find("webhookToken", webhookToken).firstResult();
        if (trigger == null || trigger.type != TriggerType.TELEGRAM_BOT) {
            return false;
        }

        TelegramConnector.TelegramWebhookConnection conn =
            telegramConnector.getWebhookConnection(trigger.id);
        if (conn == null) {
            return false;
        }

        return secretToken.equals(conn.getSecretToken());
    }

    /**
     * Process a Telegram webhook update by routing it through the connector.
     */
    public void processTelegramWebhookUpdate(String webhookToken, JsonNode payload,
                                              TelegramConnector telegramConnector)
            throws TriggerNotFoundException {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.find("webhookToken", webhookToken).firstResult();
        if (trigger == null) {
            throw new TriggerNotFoundException("Invalid webhook token");
        }

        if (!trigger.enabled) {
            throw new IllegalStateException("Trigger is disabled");
        }

        // Update last triggered time
        trigger.lastTriggeredAt = Instant.now();
        trigger.persist();

        // Route to the Telegram connector for processing
        telegramConnector.processWebhookUpdate(trigger.id, payload);
    }
}
