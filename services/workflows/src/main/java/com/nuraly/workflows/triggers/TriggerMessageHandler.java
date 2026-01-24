package com.nuraly.workflows.triggers;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Callback interface for handling messages received from persistent triggers.
 */
@FunctionalInterface
public interface TriggerMessageHandler {

    /**
     * Handle an incoming message from a trigger.
     *
     * @param trigger  The source trigger
     * @param message  The incoming message payload
     * @param metadata Additional metadata (message ID, timestamp, source, etc.)
     * @return CompletableFuture that completes when message is acknowledged
     */
    CompletableFuture<Void> handleMessage(
        WorkflowTriggerEntity trigger,
        JsonNode message,
        Map<String, Object> metadata
    );
}
