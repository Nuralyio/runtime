package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.ExecutionStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "node_executions")
@Getter
@Setter
public class NodeExecutionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    public WorkflowExecutionEntity execution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id", nullable = false)
    public WorkflowNodeEntity node;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(columnDefinition = "TEXT", name = "input_data")
    public String inputData;

    @Column(columnDefinition = "TEXT", name = "output_data")
    public String outputData;

    @Column(columnDefinition = "TEXT", name = "error_message")
    public String errorMessage;

    @Column(name = "attempt_number")
    public Integer attemptNumber = 1;

    @Column(name = "started_at")
    public Instant startedAt;

    @Column(name = "completed_at")
    public Instant completedAt;

    @Column(name = "duration_ms")
    public Long durationMs;
}
