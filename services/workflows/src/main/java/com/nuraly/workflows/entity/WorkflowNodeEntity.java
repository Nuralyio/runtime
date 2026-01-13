package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.NodeType;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_nodes")
@Getter
@Setter
public class WorkflowNodeEntity extends PanacheEntityBase {

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
    public NodeType type;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String configuration; // JSON: node-specific configuration

    @Lob
    @Column(columnDefinition = "TEXT")
    public String ports; // JSON: { inputs: NodePort[], outputs: NodePort[] }

    // Visual position for UI
    @Column(name = "position_x")
    public Integer positionX = 0;

    @Column(name = "position_y")
    public Integer positionY = 0;

    // Retry configuration
    @Column(name = "max_retries")
    public Integer maxRetries = 3;

    @Column(name = "retry_delay_ms")
    public Integer retryDelayMs = 1000;

    // Timeout configuration
    @Column(name = "timeout_ms")
    public Integer timeoutMs = 30000;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
