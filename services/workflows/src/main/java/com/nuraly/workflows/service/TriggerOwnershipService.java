package com.nuraly.workflows.service;

import com.nuraly.workflows.dto.OwnershipResult;
import com.nuraly.workflows.entity.TriggerOwnershipEntity;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.ConnectionState;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing trigger ownership using distributed locking.
 *
 * Uses database-level locking with lease expiration for cluster-aware ownership.
 */
@ApplicationScoped
public class TriggerOwnershipService {

    private static final Logger LOG = Logger.getLogger(TriggerOwnershipService.class);

    @ConfigProperty(name = "workflows.instance.id", defaultValue = "localhost")
    String instanceId;

    @ConfigProperty(name = "workflows.trigger.lease.duration-ms", defaultValue = "30000")
    long leaseDurationMs;

    private final EntityManager entityManager;

    public TriggerOwnershipService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Attempt to acquire ownership of a resource.
     *
     * @param resourceKey The unique resource key
     * @param trigger     The trigger requesting ownership
     * @return OwnershipResult indicating success or failure
     */
    @Transactional
    public OwnershipResult tryAcquireOwnership(String resourceKey, WorkflowTriggerEntity trigger) {
        LOG.infof("Attempting to acquire ownership of resource: %s for trigger: %s", resourceKey, trigger.id);

        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);

        if (ownership == null) {
            // Resource doesn't exist, create new ownership
            ownership = new TriggerOwnershipEntity();
            ownership.resourceKey = resourceKey;
            ownership.activeTrigger = trigger;
            ownership.ownerInstanceId = instanceId;
            ownership.leaseExpiresAt = Instant.now().plusMillis(leaseDurationMs);
            ownership.lastHeartbeatAt = Instant.now();
            ownership.connectionState = ConnectionState.CONNECTING;
            ownership.stateReason = "Acquired by " + instanceId;
            ownership.persist();

            LOG.infof("Created new ownership for resource: %s", resourceKey);
            return OwnershipResult.acquired(resourceKey, instanceId, ownership.leaseExpiresAt);
        }

        // Lock the row for update
        entityManager.lock(ownership, LockModeType.PESSIMISTIC_WRITE);

        // Check if we already own it
        if (instanceId.equals(ownership.ownerInstanceId) &&
            trigger.id.equals(ownership.activeTrigger != null ? ownership.activeTrigger.id : null)) {
            // Renew lease
            ownership.leaseExpiresAt = Instant.now().plusMillis(leaseDurationMs);
            ownership.lastHeartbeatAt = Instant.now();
            LOG.infof("Renewed ownership for resource: %s", resourceKey);
            return OwnershipResult.alreadyOwned(resourceKey, instanceId, ownership.leaseExpiresAt);
        }

        // Check if lease has expired (orphaned resource)
        if (ownership.isLeaseExpired()) {
            String previousOwner = ownership.ownerInstanceId;
            ownership.activeTrigger = trigger;
            ownership.ownerInstanceId = instanceId;
            ownership.leaseExpiresAt = Instant.now().plusMillis(leaseDurationMs);
            ownership.lastHeartbeatAt = Instant.now();
            ownership.connectionState = ConnectionState.CONNECTING;
            ownership.stateReason = "Claimed from expired lease of " + previousOwner;

            LOG.infof("Claimed orphaned resource: %s from instance: %s", resourceKey, previousOwner);
            return OwnershipResult.claimedOrphan(resourceKey, instanceId, previousOwner, ownership.leaseExpiresAt);
        }

        // Check if this trigger has priority (dev mode)
        if (ownership.hasPriorityOverride() && trigger.id.equals(ownership.priorityTriggerId)) {
            String previousOwner = ownership.ownerInstanceId;
            ownership.activeTrigger = trigger;
            ownership.ownerInstanceId = instanceId;
            ownership.leaseExpiresAt = Instant.now().plusMillis(leaseDurationMs);
            ownership.lastHeartbeatAt = Instant.now();
            ownership.connectionState = ConnectionState.CONNECTING;
            ownership.stateReason = "Priority override from " + previousOwner;

            LOG.infof("Priority override for resource: %s", resourceKey);
            return OwnershipResult.acquired(resourceKey, instanceId, ownership.leaseExpiresAt);
        }

        // Resource is busy
        LOG.infof("Resource busy: %s owned by: %s", resourceKey, ownership.ownerInstanceId);
        return OwnershipResult.resourceBusy(resourceKey, ownership.ownerInstanceId, ownership.leaseExpiresAt);
    }

    /**
     * Release ownership of a resource.
     *
     * @param resourceKey The resource key to release
     */
    @Transactional
    public void releaseOwnership(String resourceKey) {
        LOG.infof("Releasing ownership of resource: %s", resourceKey);

        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null && instanceId.equals(ownership.ownerInstanceId)) {
            ownership.ownerInstanceId = null;
            ownership.activeTrigger = null;
            ownership.connectionState = ConnectionState.DISCONNECTED;
            ownership.stateReason = "Released by " + instanceId;
            ownership.leaseExpiresAt = Instant.now(); // Expire immediately
            LOG.infof("Released ownership of resource: %s", resourceKey);
        }
    }

    /**
     * Renew leases for all resources owned by this instance.
     */
    @Transactional
    public void renewLeases() {
        List<TriggerOwnershipEntity> ownedResources = TriggerOwnershipEntity.findByOwnerInstance(instanceId);
        Instant newExpiry = Instant.now().plusMillis(leaseDurationMs);

        for (TriggerOwnershipEntity ownership : ownedResources) {
            ownership.leaseExpiresAt = newExpiry;
            ownership.lastHeartbeatAt = Instant.now();
        }

        if (!ownedResources.isEmpty()) {
            LOG.debugf("Renewed leases for %d resources", ownedResources.size());
        }
    }

    /**
     * Find and claim orphaned resources (expired leases).
     *
     * @return List of claimed orphaned resources
     */
    @Transactional
    public List<TriggerOwnershipEntity> claimOrphanedResources() {
        List<TriggerOwnershipEntity> orphaned = TriggerOwnershipEntity.findOrphaned();

        for (TriggerOwnershipEntity ownership : orphaned) {
            // Try to lock and claim
            try {
                entityManager.lock(ownership, LockModeType.PESSIMISTIC_WRITE);

                // Double-check it's still orphaned after locking
                if (ownership.isLeaseExpired()) {
                    String previousOwner = ownership.ownerInstanceId;
                    ownership.ownerInstanceId = instanceId;
                    ownership.leaseExpiresAt = Instant.now().plusMillis(leaseDurationMs);
                    ownership.lastHeartbeatAt = Instant.now();
                    ownership.stateReason = "Claimed orphan from " + previousOwner;

                    LOG.infof("Claimed orphaned resource: %s from: %s", ownership.resourceKey, previousOwner);
                }
            } catch (Exception e) {
                LOG.warnf("Failed to claim orphaned resource %s: %s", ownership.resourceKey, e.getMessage());
            }
        }

        return orphaned;
    }

    /**
     * Set priority override for dev/prod switching.
     *
     * @param resourceKey      The resource key
     * @param priorityTriggerId The trigger that should have priority
     * @param expiresAt        When the priority override expires
     */
    @Transactional
    public void setPriorityOverride(String resourceKey, UUID priorityTriggerId, Instant expiresAt) {
        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null) {
            ownership.priorityTriggerId = priorityTriggerId;
            ownership.priorityExpiresAt = expiresAt;
            LOG.infof("Set priority override for resource: %s to trigger: %s until: %s",
                resourceKey, priorityTriggerId, expiresAt);
        }
    }

    /**
     * Clear priority override.
     *
     * @param resourceKey The resource key
     */
    @Transactional
    public void clearPriorityOverride(String resourceKey) {
        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null) {
            ownership.priorityTriggerId = null;
            ownership.priorityExpiresAt = null;
            LOG.infof("Cleared priority override for resource: %s", resourceKey);
        }
    }

    /**
     * Update connection state.
     *
     * @param resourceKey The resource key
     * @param state       The new connection state
     * @param reason      Reason for the state change
     */
    @Transactional
    public void updateConnectionState(String resourceKey, ConnectionState state, String reason) {
        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null) {
            ownership.connectionState = state;
            ownership.stateReason = reason;
        }
    }

    /**
     * Record a message received on a resource.
     *
     * @param resourceKey The resource key
     */
    @Transactional
    public void recordMessage(String resourceKey) {
        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null) {
            ownership.messagesReceived = (ownership.messagesReceived != null ? ownership.messagesReceived : 0) + 1;
            ownership.lastMessageAt = Instant.now();
        }
    }

    /**
     * Get ownership info for a resource.
     *
     * @param resourceKey The resource key
     * @return Optional ownership entity
     */
    public Optional<TriggerOwnershipEntity> getOwnership(String resourceKey) {
        return Optional.ofNullable(TriggerOwnershipEntity.findByResourceKey(resourceKey));
    }

    /**
     * Get all owned resources for this instance.
     *
     * @return List of owned resources
     */
    public List<TriggerOwnershipEntity> getOwnedResources() {
        return TriggerOwnershipEntity.findByOwnerInstance(instanceId);
    }

    /**
     * Force release a resource (admin operation).
     *
     * @param resourceKey The resource key
     */
    @Transactional
    public void forceRelease(String resourceKey) {
        TriggerOwnershipEntity ownership = TriggerOwnershipEntity.findByResourceKey(resourceKey);
        if (ownership != null) {
            ownership.ownerInstanceId = null;
            ownership.activeTrigger = null;
            ownership.connectionState = ConnectionState.DISCONNECTED;
            ownership.stateReason = "Force released";
            ownership.leaseExpiresAt = Instant.now();
            ownership.priorityTriggerId = null;
            ownership.priorityExpiresAt = null;
            LOG.warnf("Force released resource: %s", resourceKey);
        }
    }
}
