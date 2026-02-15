package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.ConnectionState;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks ownership of exclusive trigger resources for distributed locking.
 *
 * This entity ensures that only one instance can own a particular trigger resource
 * (e.g., a Telegram bot token) at a time, enabling cluster-aware operation and
 * graceful handoffs between dev/prod environments.
 */
@Entity
@Table(name = "trigger_ownership", indexes = {
    @Index(name = "idx_trigger_ownership_resource", columnList = "resource_key", unique = true),
    @Index(name = "idx_trigger_ownership_instance", columnList = "owner_instance_id"),
    @Index(name = "idx_trigger_ownership_expires", columnList = "lease_expires_at")
})
@Getter
@Setter
public class TriggerOwnershipEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    /**
     * Unique identifier for the resource: "{provider}:{credential_hash}"
     * e.g., "telegram:abc123" or "slack_socket:xyz789"
     */
    @Column(name = "resource_key", nullable = false, unique = true)
    public String resourceKey;

    /**
     * The trigger currently using this resource.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_trigger_id")
    public WorkflowTriggerEntity activeTrigger;

    /**
     * Instance ID that owns this connection (hostname, pod name, or UUID).
     */
    @Column(name = "owner_instance_id")
    public String ownerInstanceId;

    /**
     * Lease expiration for distributed lock.
     * If no heartbeat renews the lease before this time, the resource is considered orphaned.
     */
    @Column(name = "lease_expires_at", nullable = false)
    public Instant leaseExpiresAt;

    /**
     * Last heartbeat timestamp for health monitoring.
     */
    @Column(name = "last_heartbeat_at")
    public Instant lastHeartbeatAt;

    /**
     * Current connection state.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "connection_state", nullable = false)
    public ConnectionState connectionState = ConnectionState.DISCONNECTED;

    /**
     * Human-readable reason for the current state.
     */
    @Column(name = "state_reason", length = 500)
    public String stateReason;

    /**
     * Priority override trigger ID for dev/prod switching.
     * When set, this trigger takes priority over the normal active trigger.
     */
    @Column(name = "priority_trigger_id")
    public UUID priorityTriggerId;

    /**
     * When the priority override expires (auto-release dev mode).
     */
    @Column(name = "priority_expires_at")
    public Instant priorityExpiresAt;

    /**
     * Statistics: total messages received through this resource.
     */
    @Column(name = "messages_received")
    public Long messagesReceived = 0L;

    /**
     * Statistics: timestamp of last message received.
     */
    @Column(name = "last_message_at")
    public Instant lastMessageAt;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if (leaseExpiresAt == null) {
            leaseExpiresAt = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    /**
     * Check if the lease has expired.
     */
    public boolean isLeaseExpired() {
        return leaseExpiresAt != null && Instant.now().isAfter(leaseExpiresAt);
    }

    /**
     * Check if this resource has a priority override.
     */
    public boolean hasPriorityOverride() {
        return priorityTriggerId != null &&
               (priorityExpiresAt == null || Instant.now().isBefore(priorityExpiresAt));
    }

    /**
     * Find by resource key.
     */
    public static TriggerOwnershipEntity findByResourceKey(String resourceKey) {
        return find("resourceKey", resourceKey).firstResult();
    }

    /**
     * Find all resources owned by a specific instance.
     */
    public static java.util.List<TriggerOwnershipEntity> findByOwnerInstance(String instanceId) {
        return list("ownerInstanceId", instanceId);
    }

    /**
     * Find by active trigger ID.
     */
    public static TriggerOwnershipEntity findByTriggerId(java.util.UUID triggerId) {
        return find("activeTrigger.id", triggerId).firstResult();
    }

    /**
     * Find orphaned resources (expired leases).
     */
    public static java.util.List<TriggerOwnershipEntity> findOrphaned() {
        return list("leaseExpiresAt < ?1 AND connectionState != ?2",
                    Instant.now(), ConnectionState.DISCONNECTED);
    }
}
