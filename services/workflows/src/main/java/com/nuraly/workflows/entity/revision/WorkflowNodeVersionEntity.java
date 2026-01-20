package com.nuraly.workflows.entity.revision;

import com.nuraly.workflows.entity.enums.NodeType;
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
@Table(name = "workflow_node_versions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"node_id", "version"})
})
@Getter
@Setter
public class WorkflowNodeVersionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "node_id", nullable = false)
    public UUID nodeId;

    @Column(name = "workflow_id", nullable = false)
    public UUID workflowId;

    @Column(nullable = false)
    public Integer version;

    @Column(nullable = false)
    public String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public NodeType type;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    public String configuration;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    public String ports;

    @Column(name = "position_x")
    public Integer positionX;

    @Column(name = "position_y")
    public Integer positionY;

    @Column(name = "max_retries")
    public Integer maxRetries;

    @Column(name = "retry_delay_ms")
    public Integer retryDelayMs;

    @Column(name = "timeout_ms")
    public Integer timeoutMs;

    @Column(name = "created_by", nullable = false)
    public String createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
