package com.nuraly.workflows.entity.revision;

import com.nuraly.workflows.entity.enums.TriggerType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_trigger_versions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trigger_id", "version"})
})
@Getter
@Setter
public class WorkflowTriggerVersionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "trigger_id", nullable = false)
    public UUID triggerId;

    @Column(name = "workflow_id", nullable = false)
    public UUID workflowId;

    @Column(nullable = false)
    public Integer version;

    @Column(nullable = false)
    public String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public TriggerType type;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    public String configuration;

    public boolean enabled;

    @Column(name = "webhook_token")
    public String webhookToken;

    @Column(name = "created_by", nullable = false)
    public String createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
