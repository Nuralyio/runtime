package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.ExecutionStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a workflow execution instance.
 * Uses optimistic locking (@Version) to prevent concurrent modification issues
 * when scaling horizontally with multiple worker instances.
 */

@Entity
@Table(name = "workflow_executions")
@Getter
@Setter
public class WorkflowExecutionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    public WorkflowEntity workflow;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ExecutionStatus status = ExecutionStatus.PENDING;

    @Lob
    @Column(columnDefinition = "TEXT", name = "input_data")
    public String inputData; // JSON: input payload

    @Lob
    @Column(columnDefinition = "TEXT", name = "output_data")
    public String outputData; // JSON: final output

    @Lob
    @Column(columnDefinition = "TEXT")
    public String variables; // JSON: runtime variables state

    @Lob
    @Column(columnDefinition = "TEXT", name = "error_message")
    public String errorMessage;

    @Column(name = "triggered_by")
    public String triggeredBy; // User UUID or "system" or trigger ID

    @Column(name = "trigger_type")
    public String triggerType; // "manual", "schedule", "webhook", "event"

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<NodeExecutionEntity> nodeExecutions = new ArrayList<>();

    @Column(name = "started_at")
    public Instant startedAt;

    @Column(name = "completed_at")
    public Instant completedAt;

    @Column(name = "duration_ms")
    public Long durationMs;

    /**
     * Optimistic locking version for concurrent access control.
     * Prevents race conditions when multiple workers try to update the same execution.
     */
    @Version
    @Column(name = "version")
    public Long version;
}
