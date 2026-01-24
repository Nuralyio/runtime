package com.nuraly.workflows.triggers;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;

import java.util.Set;
import java.util.concurrent.CompletableFuture;

/**
 * Interface for persistent trigger connectors.
 *
 * Implementations handle the connection lifecycle for long-running triggers
 * such as Telegram bot polling, Slack Socket Mode, etc.
 */
public interface TriggerConnector {

    /**
     * Get the trigger types this connector handles.
     *
     * @return Set of supported trigger types
     */
    Set<TriggerType> getSupportedTypes();

    /**
     * Generate the unique resource key for ownership tracking.
     * This key identifies the exclusive resource (e.g., a bot token).
     *
     * @param trigger The trigger entity
     * @return Resource key (e.g., "telegram:abc123hash")
     */
    String getResourceKey(WorkflowTriggerEntity trigger);

    /**
     * Start the connection for the given trigger.
     * Called after ownership is acquired.
     *
     * @param trigger The trigger to connect
     * @param handler Callback for received messages
     * @return CompletableFuture that completes when connected
     */
    CompletableFuture<Void> connect(WorkflowTriggerEntity trigger, TriggerMessageHandler handler);

    /**
     * Stop the connection gracefully.
     *
     * @param trigger The trigger to disconnect
     * @param handoffTarget If non-null, buffer messages for handoff to this trigger
     * @return CompletableFuture that completes when disconnected
     */
    CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget);

    /**
     * Check if currently connected for the given trigger.
     *
     * @param trigger The trigger to check
     * @return true if connected
     */
    boolean isConnected(WorkflowTriggerEntity trigger);

    /**
     * Perform a health check for the connection.
     *
     * @param trigger The trigger to check
     * @return Health status
     */
    HealthStatus checkHealth(WorkflowTriggerEntity trigger);

    /**
     * Validate trigger configuration before activation.
     *
     * @param configuration The trigger configuration JSON
     * @return Validation result
     */
    ValidationResult validateConfiguration(JsonNode configuration);

    /**
     * Check if this trigger type requires exclusive ownership.
     * Most persistent triggers do (only one connection per credential).
     *
     * @param type The trigger type
     * @return true if exclusive ownership is required
     */
    default boolean requiresExclusiveOwnership(TriggerType type) {
        return true;
    }
}
