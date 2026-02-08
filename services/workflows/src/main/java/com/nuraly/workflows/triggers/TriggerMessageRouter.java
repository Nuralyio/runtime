package com.nuraly.workflows.triggers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.entity.enums.TriggerDesiredState;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.messaging.RabbitMQConnectionManager;
import com.nuraly.workflows.messaging.WorkflowExecutionMessage;
import com.nuraly.workflows.messaging.WorkflowExecutionProducer;
import com.nuraly.workflows.service.TriggerOwnershipService;
import com.nuraly.workflows.service.WorkflowEventService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Routes incoming messages from persistent triggers to workflow executions.
 */
@ApplicationScoped
public class TriggerMessageRouter implements TriggerMessageHandler {

    private static final Logger LOG = Logger.getLogger(TriggerMessageRouter.class);

    @Inject
    WorkflowExecutionProducer executionProducer;

    @Inject
    WorkflowEventService eventService;

    @Inject
    TriggerOwnershipService ownershipService;

    @Inject
    RabbitMQConnectionManager connectionManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public CompletableFuture<Void> handleMessage(WorkflowTriggerEntity trigger,
                                                  JsonNode message,
                                                  Map<String, Object> metadata) {
        return CompletableFuture.runAsync(() -> {
            try {
                processMessage(trigger, message, metadata);
            } catch (Exception e) {
                LOG.errorf(e, "Failed to process message for trigger %s", trigger.id);
                throw new RuntimeException("Failed to process trigger message", e);
            }
        });
    }

    @Transactional
    protected void processMessage(WorkflowTriggerEntity trigger,
                                  JsonNode message,
                                  Map<String, Object> metadata) throws Exception {

        // Refresh trigger state
        trigger = WorkflowTriggerEntity.findById(trigger.id);
        if (trigger == null) {
            LOG.warnf("Trigger not found: %s, discarding message", trigger.id);
            return;
        }

        // Check if trigger is active
        if (!trigger.enabled || trigger.desiredState != TriggerDesiredState.ACTIVE) {
            LOG.warnf("Trigger %s is not active (enabled=%s, desiredState=%s), buffering message",
                trigger.id, trigger.enabled, trigger.desiredState);
            bufferMessage(trigger, message, metadata);
            return;
        }

        // Check if workflow is active
        if (trigger.workflow.status != WorkflowStatus.ACTIVE) {
            LOG.warnf("Workflow %s is not active (status=%s), buffering message",
                trigger.workflow.id, trigger.workflow.status);
            bufferMessage(trigger, message, metadata);
            return;
        }

        // Create workflow execution
        UUID executionId = createExecution(trigger, message, metadata);

        // Publish to RabbitMQ for processing
        WorkflowExecutionMessage execMessage = new WorkflowExecutionMessage(
            executionId,
            trigger.workflow.id,
            "trigger:" + trigger.id,
            trigger.type.name().toLowerCase(),
            objectMapper.writeValueAsString(message),
            null
        );
        executionProducer.publishExecution(execMessage);

        // Update trigger stats
        trigger.lastTriggeredAt = Instant.now();
        trigger.persist();

        // Update ownership stats
        String source = (String) metadata.getOrDefault("source", "unknown");
        ownershipService.recordMessage(source + ":" + getResourceKeyPart(trigger));

        LOG.infof("Routed message from trigger %s to execution %s", trigger.id, executionId);
    }

    private UUID createExecution(WorkflowTriggerEntity trigger, JsonNode message, Map<String, Object> metadata) throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.workflow = trigger.workflow;
        execution.status = ExecutionStatus.QUEUED;
        execution.triggeredBy = "trigger:" + trigger.id;
        execution.triggerType = trigger.type.name().toLowerCase();
        execution.startedAt = Instant.now();
        execution.inputData = objectMapper.writeValueAsString(message);

        // Store metadata in variables if needed
        if (metadata != null && !metadata.isEmpty()) {
            execution.variables = objectMapper.writeValueAsString(Map.of("_triggerMetadata", metadata));
        }

        execution.persist();

        eventService.logExecutionQueued(execution);

        return execution.id;
    }

    private void bufferMessage(WorkflowTriggerEntity trigger, JsonNode message, Map<String, Object> metadata) {
        try {
            String bufferQueue = trigger.bufferQueue;
            if (bufferQueue == null || bufferQueue.isEmpty()) {
                bufferQueue = "trigger.buffer." + trigger.id;
            }

            BufferedMessage buffered = new BufferedMessage(
                trigger.id,
                message,
                metadata,
                Instant.now()
            );

            connectionManager.publishToQueue(bufferQueue, objectMapper.writeValueAsString(buffered));
            LOG.infof("Buffered message for trigger %s to queue %s", trigger.id, bufferQueue);

        } catch (Exception e) {
            LOG.errorf(e, "Failed to buffer message for trigger %s", trigger.id);
        }
    }

    private String getResourceKeyPart(WorkflowTriggerEntity trigger) {
        // Extract a hash/identifier from the credential key if available
        if (trigger.credentialKey != null) {
            return trigger.credentialKey.hashCode() + "";
        }
        return trigger.id.toString().substring(0, 8);
    }

    /**
     * Replay buffered messages for a trigger.
     */
    @Transactional
    public int replayBufferedMessages(WorkflowTriggerEntity trigger, int maxMessages) {
        String bufferQueue = trigger.bufferQueue;
        if (bufferQueue == null || bufferQueue.isEmpty()) {
            bufferQueue = "trigger.buffer." + trigger.id;
        }

        int replayed = 0;
        try {
            for (int i = 0; i < maxMessages; i++) {
                String messageJson = connectionManager.consumeFromQueue(bufferQueue);
                if (messageJson == null) {
                    break; // Queue is empty
                }

                BufferedMessage buffered = objectMapper.readValue(messageJson, BufferedMessage.class);
                processMessage(trigger, buffered.getMessage(), buffered.getMetadata());
                replayed++;
            }

            LOG.infof("Replayed %d buffered messages for trigger %s", replayed, trigger.id);

        } catch (Exception e) {
            LOG.errorf(e, "Error replaying buffered messages for trigger %s", trigger.id);
        }

        return replayed;
    }

    /**
     * Buffered message wrapper.
     */
    public static class BufferedMessage {
        private UUID triggerId;
        private JsonNode message;
        private Map<String, Object> metadata;
        private Instant bufferedAt;

        public BufferedMessage() {}

        public BufferedMessage(UUID triggerId, JsonNode message, Map<String, Object> metadata, Instant bufferedAt) {
            this.triggerId = triggerId;
            this.message = message;
            this.metadata = metadata;
            this.bufferedAt = bufferedAt;
        }

        public UUID getTriggerId() { return triggerId; }
        public void setTriggerId(UUID triggerId) { this.triggerId = triggerId; }
        public JsonNode getMessage() { return message; }
        public void setMessage(JsonNode message) { this.message = message; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
        public Instant getBufferedAt() { return bufferedAt; }
        public void setBufferedAt(Instant bufferedAt) { this.bufferedAt = bufferedAt; }
    }
}
