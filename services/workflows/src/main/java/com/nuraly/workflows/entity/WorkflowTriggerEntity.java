package com.nuraly.workflows.entity;

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
        if (type == TriggerType.WEBHOOK && webhookToken == null) {
            webhookToken = UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
