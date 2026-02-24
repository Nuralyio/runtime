package com.nuraly.workflows.triggers;

import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ConnectionState;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Runtime state for an active trigger connection.
 */
@Data
public class ActiveTrigger {

    private final UUID triggerId;
    private final WorkflowTriggerEntity trigger;
    private final TriggerConnector connector;
    private final String resourceKey;

    private volatile ConnectionState state = ConnectionState.DISCONNECTED;
    private volatile Instant connectedSince;
    private volatile Instant lastMessageAt;
    private volatile String stateReason;

    private final AtomicLong messagesReceived = new AtomicLong(0);
    private final AtomicLong messagesFailed = new AtomicLong(0);

    public ActiveTrigger(WorkflowTriggerEntity trigger, TriggerConnector connector, String resourceKey) {
        this.triggerId = trigger.id;
        this.trigger = trigger;
        this.connector = connector;
        this.resourceKey = resourceKey;
    }

    public void markConnected() {
        this.state = ConnectionState.CONNECTED;
        this.connectedSince = Instant.now();
        this.stateReason = "Connected successfully";
    }

    public void markDisconnected(String reason) {
        this.state = ConnectionState.DISCONNECTED;
        this.connectedSince = null;
        this.stateReason = reason;
    }

    public void markPaused(String reason) {
        this.state = ConnectionState.PAUSED;
        this.stateReason = reason;
    }

    public void markError(String reason) {
        this.state = ConnectionState.ERROR;
        this.stateReason = reason;
    }

    public void markHandoffPending(String reason) {
        this.state = ConnectionState.HANDOFF_PENDING;
        this.stateReason = reason;
    }

    public void recordMessage() {
        this.messagesReceived.incrementAndGet();
        this.lastMessageAt = Instant.now();
    }

    public void recordFailedMessage() {
        this.messagesFailed.incrementAndGet();
    }

    public long getMessagesReceived() {
        return messagesReceived.get();
    }

    public long getMessagesFailed() {
        return messagesFailed.get();
    }
}
