package com.nuraly.workflows.service;

import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.entity.TriggerOwnershipEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ConnectionState;
import com.nuraly.workflows.entity.enums.TriggerDesiredState;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.*;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import javax.annotation.Priority;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Central orchestrator for persistent trigger lifecycle management.
 *
 * Handles:
 * - Trigger activation/deactivation
 * - Ownership management
 * - Dev/prod mode switching
 * - Health monitoring
 * - Cluster failover
 */
@ApplicationScoped
public class TriggerManagerService {

    private static final Logger LOG = Logger.getLogger(TriggerManagerService.class);

    @Inject
    Instance<TriggerConnector> connectorInstances;

    @Inject
    TriggerOwnershipService ownershipService;

    @Inject
    TriggerMessageRouter messageRouter;

    @ConfigProperty(name = "workflows.instance.id", defaultValue = "localhost")
    String instanceId;

    @ConfigProperty(name = "workflows.trigger.dev-mode.max-duration-ms", defaultValue = "3600000")
    long devModeMaxDurationMs;

    private Map<TriggerType, TriggerConnector> connectorMap = new HashMap<>();
    private Map<UUID, ActiveTrigger> activeTriggers = new ConcurrentHashMap<>();

    /**
     * Initialize connectors on startup.
     */
    void onStart(@Observes @Priority(20) StartupEvent ev) {
        LOG.info("Initializing TriggerManagerService...");
        initializeConnectors();
        recoverOwnedTriggers();
        LOG.infof("TriggerManagerService initialized with %d connectors", connectorMap.size());
    }

    /**
     * Graceful shutdown - release all owned resources.
     */
    void onStop(@Observes ShutdownEvent ev) {
        LOG.info("Shutting down TriggerManagerService...");
        gracefulShutdown();
    }

    private void initializeConnectors() {
        for (TriggerConnector connector : connectorInstances) {
            for (TriggerType type : connector.getSupportedTypes()) {
                connectorMap.put(type, connector);
                LOG.infof("Registered connector for trigger type: %s", type);
            }
        }
    }

    /**
     * Recover triggers that were owned by this instance before restart.
     */
    private void recoverOwnedTriggers() {
        List<TriggerOwnershipEntity> ownedResources = ownershipService.getOwnedResources();
        for (TriggerOwnershipEntity ownership : ownedResources) {
            if (ownership.activeTrigger != null) {
                try {
                    LOG.infof("Recovering trigger: %s", ownership.activeTrigger.id);
                    activateTriggerInternal(ownership.activeTrigger);
                } catch (Exception e) {
                    LOG.errorf(e, "Failed to recover trigger: %s", ownership.activeTrigger.id);
                }
            }
        }
    }

    private void gracefulShutdown() {
        for (ActiveTrigger active : activeTriggers.values()) {
            try {
                LOG.infof("Deactivating trigger on shutdown: %s", active.getTriggerId());
                deactivateTriggerInternal(active, false);
            } catch (Exception e) {
                LOG.errorf(e, "Error during shutdown for trigger: %s", active.getTriggerId());
            }
        }
        activeTriggers.clear();
    }

    /**
     * Activate a persistent trigger.
     */
    @Transactional
    public TriggerActivationResult activateTrigger(UUID triggerId) {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            return TriggerActivationResult.failure(triggerId, "Trigger not found");
        }

        return activateTriggerInternal(trigger);
    }

    private TriggerActivationResult activateTriggerInternal(WorkflowTriggerEntity trigger) {
        // Check if trigger type is persistent
        TriggerConnector connector = connectorMap.get(trigger.type);
        if (connector == null) {
            return TriggerActivationResult.failure(trigger.id,
                "No connector available for trigger type: " + trigger.type);
        }

        // Validate configuration
        try {
            ValidationResult validation = connector.validateConfiguration(
                new com.fasterxml.jackson.databind.ObjectMapper().readTree(trigger.configuration)
            );
            if (!validation.isValid()) {
                return TriggerActivationResult.failure(trigger.id,
                    "Invalid configuration: " + String.join(", ", validation.getErrors()));
            }
        } catch (Exception e) {
            return TriggerActivationResult.failure(trigger.id, "Configuration parse error: " + e.getMessage());
        }

        // Generate resource key
        String resourceKey = connector.getResourceKey(trigger);

        // Try to acquire ownership
        OwnershipResult ownershipResult = ownershipService.tryAcquireOwnership(resourceKey, trigger);
        if (!ownershipResult.isSuccess()) {
            return TriggerActivationResult.resourceBusy(trigger.id, ownershipResult.getOwnerInstanceId());
        }

        // Create active trigger record
        ActiveTrigger activeTrigger = new ActiveTrigger(trigger, connector, resourceKey);
        activeTriggers.put(trigger.id, activeTrigger);

        // Start connection
        try {
            ownershipService.updateConnectionState(resourceKey, ConnectionState.CONNECTING, "Starting connection");

            connector.connect(trigger, messageRouter)
                .thenRun(() -> {
                    activeTrigger.markConnected();
                    ownershipService.updateConnectionState(resourceKey, ConnectionState.CONNECTED, "Connected");
                    LOG.infof("Trigger %s connected successfully", trigger.id);
                })
                .exceptionally(e -> {
                    activeTrigger.markError(e.getMessage());
                    ownershipService.updateConnectionState(resourceKey, ConnectionState.ERROR, e.getMessage());
                    LOG.errorf(e, "Failed to connect trigger %s", trigger.id);
                    return null;
                });

            return TriggerActivationResult.connecting(trigger.id, instanceId);

        } catch (Exception e) {
            activeTriggers.remove(trigger.id);
            ownershipService.releaseOwnership(resourceKey);
            return TriggerActivationResult.failure(trigger.id, "Connection failed: " + e.getMessage());
        }
    }

    /**
     * Deactivate a persistent trigger.
     */
    @Transactional
    public void deactivateTrigger(UUID triggerId, boolean graceful) {
        ActiveTrigger activeTrigger = activeTriggers.get(triggerId);
        if (activeTrigger == null) {
            LOG.warnf("Trigger %s is not active on this instance", triggerId);
            return;
        }

        deactivateTriggerInternal(activeTrigger, graceful);
    }

    private void deactivateTriggerInternal(ActiveTrigger activeTrigger, boolean graceful) {
        try {
            activeTrigger.markDisconnected("Deactivation requested");

            // Disconnect
            activeTrigger.getConnector()
                .disconnect(activeTrigger.getTrigger(), null)
                .join(); // Wait for disconnect

            // Release ownership
            ownershipService.releaseOwnership(activeTrigger.getResourceKey());

            // Remove from active triggers
            activeTriggers.remove(activeTrigger.getTriggerId());

            LOG.infof("Trigger %s deactivated", activeTrigger.getTriggerId());

        } catch (Exception e) {
            LOG.errorf(e, "Error deactivating trigger %s", activeTrigger.getTriggerId());
            // Force release anyway
            ownershipService.releaseOwnership(activeTrigger.getResourceKey());
            activeTriggers.remove(activeTrigger.getTriggerId());
        }
    }

    /**
     * Request dev mode - pause production trigger and start dev trigger.
     */
    @Transactional
    public DevModeResult requestDevMode(UUID devTriggerId, long durationMs) {
        // Validate duration
        if (durationMs > devModeMaxDurationMs) {
            durationMs = devModeMaxDurationMs;
        }

        WorkflowTriggerEntity devTrigger = WorkflowTriggerEntity.findById(devTriggerId);
        if (devTrigger == null) {
            return DevModeResult.failure(devTriggerId, "Dev trigger not found");
        }

        TriggerConnector connector = connectorMap.get(devTrigger.type);
        if (connector == null) {
            return DevModeResult.failure(devTriggerId, "No connector for trigger type: " + devTrigger.type);
        }

        String resourceKey = connector.getResourceKey(devTrigger);
        Instant expiresAt = Instant.now().plusMillis(durationMs);

        // Find production trigger using the same resource
        Optional<TriggerOwnershipEntity> ownershipOpt = ownershipService.getOwnership(resourceKey);

        if (ownershipOpt.isEmpty() || ownershipOpt.get().activeTrigger == null) {
            // No production trigger active, just activate dev trigger
            TriggerActivationResult result = activateTriggerInternal(devTrigger);
            if (result.isSuccess()) {
                return DevModeResult.successNoProd(devTriggerId, expiresAt);
            } else {
                return DevModeResult.failure(devTriggerId, result.getFailureReason());
            }
        }

        TriggerOwnershipEntity ownership = ownershipOpt.get();
        WorkflowTriggerEntity prodTrigger = ownership.activeTrigger;

        // Set priority override for dev trigger
        ownershipService.setPriorityOverride(resourceKey, devTriggerId, expiresAt);

        // Pause production trigger
        ActiveTrigger activeProd = activeTriggers.get(prodTrigger.id);
        if (activeProd != null) {
            try {
                activeProd.markHandoffPending("Dev mode requested");
                ownershipService.updateConnectionState(resourceKey, ConnectionState.HANDOFF_PENDING, "Dev mode handoff");

                // Disconnect production with handoff (buffers messages)
                activeProd.getConnector()
                    .disconnect(prodTrigger, devTrigger)
                    .join();

                activeProd.markPaused("Paused for dev mode");
                activeTriggers.remove(prodTrigger.id);

            } catch (Exception e) {
                LOG.errorf(e, "Error pausing production trigger for dev mode");
                ownershipService.clearPriorityOverride(resourceKey);
                return DevModeResult.failure(devTriggerId, "Failed to pause production: " + e.getMessage());
            }
        }

        // Activate dev trigger
        TriggerActivationResult devResult = activateTriggerInternal(devTrigger);
        if (!devResult.isSuccess()) {
            // Rollback - reactivate production
            ownershipService.clearPriorityOverride(resourceKey);
            activateTriggerInternal(prodTrigger);
            return DevModeResult.failure(devTriggerId, "Failed to activate dev trigger: " + devResult.getFailureReason());
        }

        LOG.infof("Dev mode enabled for trigger %s, paused production %s, expires at %s",
            devTriggerId, prodTrigger.id, expiresAt);

        return DevModeResult.success(devTriggerId, prodTrigger.id, expiresAt);
    }

    /**
     * Release dev mode - stop dev trigger and resume production.
     */
    @Transactional
    public void releaseDevMode(UUID devTriggerId) {
        WorkflowTriggerEntity devTrigger = WorkflowTriggerEntity.findById(devTriggerId);
        if (devTrigger == null) {
            LOG.warnf("Dev trigger not found: %s", devTriggerId);
            return;
        }

        TriggerConnector connector = connectorMap.get(devTrigger.type);
        if (connector == null) {
            return;
        }

        String resourceKey = connector.getResourceKey(devTrigger);

        // Deactivate dev trigger
        deactivateTrigger(devTriggerId, true);

        // Clear priority override
        ownershipService.clearPriorityOverride(resourceKey);

        // Find and reactivate production trigger
        Optional<TriggerOwnershipEntity> ownershipOpt = ownershipService.getOwnership(resourceKey);
        if (ownershipOpt.isPresent() && ownershipOpt.get().activeTrigger != null) {
            WorkflowTriggerEntity prodTrigger = ownershipOpt.get().activeTrigger;
            if (prodTrigger.isPrimary != null && prodTrigger.isPrimary) {
                activateTriggerInternal(prodTrigger);

                // Replay buffered messages
                messageRouter.replayBufferedMessages(prodTrigger, 1000);
            }
        }

        LOG.infof("Dev mode released for trigger %s", devTriggerId);
    }

    /**
     * Get trigger status.
     */
    public TriggerStatusDTO getTriggerStatus(UUID triggerId) {
        WorkflowTriggerEntity trigger = WorkflowTriggerEntity.findById(triggerId);
        if (trigger == null) {
            return null;
        }

        TriggerStatusDTO status = new TriggerStatusDTO();
        status.setTriggerId(triggerId);
        status.setName(trigger.name);
        status.setType(trigger.type);
        status.setDesiredState(trigger.desiredState);

        ActiveTrigger active = activeTriggers.get(triggerId);
        if (active != null) {
            status.setConnectionState(active.getState());
            status.setOwnerInstance(instanceId);
            status.setConnectedSince(active.getConnectedSince());
            status.setMessagesReceived(active.getMessagesReceived());
            status.setLastMessageAt(active.getLastMessageAt());
            status.setStateReason(active.getStateReason());

            HealthStatus health = active.getConnector().checkHealth(trigger);
            status.setHealth(health.getStatus());
            status.setHealthMessage(health.getMessage());
        } else {
            // Check if owned by another instance
            TriggerConnector connector = connectorMap.get(trigger.type);
            if (connector != null) {
                String resourceKey = connector.getResourceKey(trigger);
                Optional<TriggerOwnershipEntity> ownership = ownershipService.getOwnership(resourceKey);
                if (ownership.isPresent()) {
                    TriggerOwnershipEntity own = ownership.get();
                    status.setConnectionState(own.connectionState);
                    status.setOwnerInstance(own.ownerInstanceId);
                    status.setLastHeartbeat(own.lastHeartbeatAt);
                    status.setMessagesReceived(own.messagesReceived);
                    status.setLastMessageAt(own.lastMessageAt);
                    status.setStateReason(own.stateReason);

                    if (own.hasPriorityOverride()) {
                        status.setInDevMode(true);
                        status.setDevModeTriggerId(own.priorityTriggerId);
                        status.setDevModeExpiresAt(own.priorityExpiresAt);
                    }
                }
            }
        }

        return status;
    }

    /**
     * List all trigger resources.
     */
    public List<TriggerResourceDTO> listResources(TriggerType type) {
        List<TriggerOwnershipEntity> ownerships = TriggerOwnershipEntity.listAll();

        return ownerships.stream()
            .filter(o -> type == null || (o.activeTrigger != null && o.activeTrigger.type == type))
            .map(this::toResourceDTO)
            .collect(Collectors.toList());
    }

    private TriggerResourceDTO toResourceDTO(TriggerOwnershipEntity ownership) {
        TriggerResourceDTO dto = new TriggerResourceDTO();
        dto.setResourceKey(ownership.resourceKey);
        dto.setOwnerInstance(ownership.ownerInstanceId);
        dto.setState(ownership.connectionState);
        dto.setLeaseExpiresAt(ownership.leaseExpiresAt);
        dto.setLastHeartbeat(ownership.lastHeartbeatAt);
        dto.setMessagesReceived(ownership.messagesReceived);
        dto.setLastMessageAt(ownership.lastMessageAt);
        dto.setPriorityTriggerId(ownership.priorityTriggerId);
        dto.setPriorityExpiresAt(ownership.priorityExpiresAt);

        if (ownership.activeTrigger != null) {
            dto.setActiveTriggerId(ownership.activeTrigger.id);
            dto.setActiveTriggerName(ownership.activeTrigger.name);
            dto.setType(ownership.activeTrigger.type);
            dto.setWorkflowId(ownership.activeTrigger.workflow.id);
            dto.setWorkflowName(ownership.activeTrigger.workflow.name);
        }

        return dto;
    }

    /**
     * Force release a resource (admin operation).
     */
    @Transactional
    public void forceReleaseResource(String resourceKey) {
        // Find and deactivate any local active trigger
        for (ActiveTrigger active : activeTriggers.values()) {
            if (resourceKey.equals(active.getResourceKey())) {
                deactivateTriggerInternal(active, false);
                break;
            }
        }

        // Force release in database
        ownershipService.forceRelease(resourceKey);
        LOG.warnf("Force released resource: %s", resourceKey);
    }

    /**
     * Scheduled heartbeat - renew leases.
     */
    @Scheduled(every = "10s")
    void heartbeat() {
        ownershipService.renewLeases();
    }

    /**
     * Scheduled orphan check - claim orphaned resources.
     */
    @Scheduled(every = "15s")
    void checkOrphans() {
        List<TriggerOwnershipEntity> orphaned = ownershipService.claimOrphanedResources();
        for (TriggerOwnershipEntity ownership : orphaned) {
            if (ownership.activeTrigger != null &&
                instanceId.equals(ownership.ownerInstanceId)) {
                // We claimed it, try to activate
                try {
                    activateTriggerInternal(ownership.activeTrigger);
                } catch (Exception e) {
                    LOG.errorf(e, "Failed to activate orphaned trigger: %s", ownership.activeTrigger.id);
                }
            }
        }
    }

    /**
     * Scheduled dev mode expiration check.
     */
    @Scheduled(every = "30s")
    void checkDevModeExpiration() {
        List<TriggerOwnershipEntity> ownerships = TriggerOwnershipEntity.listAll();
        for (TriggerOwnershipEntity ownership : ownerships) {
            if (ownership.priorityTriggerId != null &&
                ownership.priorityExpiresAt != null &&
                Instant.now().isAfter(ownership.priorityExpiresAt)) {

                LOG.infof("Dev mode expired for resource: %s, releasing", ownership.resourceKey);
                releaseDevMode(ownership.priorityTriggerId);
            }
        }
    }

    /**
     * Check if a trigger type is persistent (requires long-running connection).
     */
    public boolean isPersistentTriggerType(TriggerType type) {
        return connectorMap.containsKey(type);
    }

    /**
     * Get active trigger count for this instance.
     */
    public int getActiveTriggerCount() {
        return activeTriggers.size();
    }
}
