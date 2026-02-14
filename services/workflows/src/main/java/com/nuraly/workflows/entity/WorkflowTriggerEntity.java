package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.TriggerDesiredState;
import com.nuraly.workflows.entity.enums.TriggerType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_triggers")
@Getter
@Setter
public class WorkflowTriggerEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    public WorkflowEntity workflow;

    @Column(nullable = false)
    public String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public TriggerType type;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String configuration; // JSON: trigger-specific config (cron, event type, etc.)

    public boolean enabled = true;

    // For webhooks
    @Column(name = "webhook_token", unique = true)
    public String webhookToken;

    // For persistent triggers (Telegram, Slack Socket Mode, etc.)
    /**
     * Reference key for credentials (stored securely elsewhere).
     * e.g., "telegram_bot_prod" or "slack_app_dev"
     */
    @Column(name = "credential_key")
    public String credentialKey;

    /**
     * Environment tag for dev/prod switching.
     */
    @Column(name = "environment")
    public String environment = "production";

    /**
     * Whether this is the primary trigger for the credential.
     * Primary triggers have priority when multiple triggers share the same credential.
     */
    @Column(name = "is_primary")
    public Boolean isPrimary = false;

    /**
     * Desired state of the trigger (what user wants).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "desired_state")
    public TriggerDesiredState desiredState = TriggerDesiredState.ACTIVE;

    /**
     * Buffer queue name for message buffering during handoffs.
     */
    @Column(name = "buffer_queue")
    public String bufferQueue;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @Column(name = "last_triggered_at")
    public Instant lastTriggeredAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        if ((type == TriggerType.WEBHOOK || type == TriggerType.TELEGRAM_BOT) && webhookToken == null) {
            webhookToken = UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
