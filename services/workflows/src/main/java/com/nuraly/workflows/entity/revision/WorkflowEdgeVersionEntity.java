package com.nuraly.workflows.entity.revision;

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
@Table(name = "workflow_edge_versions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"edge_id", "version"})
})
@Getter
@Setter
public class WorkflowEdgeVersionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "edge_id", nullable = false)
    public UUID edgeId;

    @Column(name = "workflow_id", nullable = false)
    public UUID workflowId;

    @Column(nullable = false)
    public Integer version;

    @Column(name = "source_node_id", nullable = false)
    public UUID sourceNodeId;

    @Column(name = "source_port_id")
    public String sourcePortId;

    @Column(name = "target_node_id", nullable = false)
    public UUID targetNodeId;

    @Column(name = "target_port_id")
    public String targetPortId;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT", name = "condition_expression")
    public String condition;

    public String label;

    public Integer priority;

    @Column(name = "created_by", nullable = false)
    public String createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
