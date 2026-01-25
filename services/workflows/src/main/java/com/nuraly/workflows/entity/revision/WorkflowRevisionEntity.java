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
@Table(name = "workflow_revisions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workflow_id", "revision"})
})
@Getter
@Setter
public class WorkflowRevisionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "workflow_id", nullable = false)
    public UUID workflowId;

    @Column(nullable = false)
    public Integer revision;

    @Column(name = "version_label")
    public String versionLabel;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "workflow_version", nullable = false)
    public Integer workflowVersion;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "node_refs", columnDefinition = "TEXT", nullable = false)
    public String nodeRefs;  // JSON: [{nodeId, version}, ...]

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "edge_refs", columnDefinition = "TEXT", nullable = false)
    public String edgeRefs;  // JSON: [{edgeId, version}, ...]

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "trigger_refs", columnDefinition = "TEXT", nullable = false)
    public String triggerRefs;  // JSON: [{triggerId, version}, ...]

    @Column(name = "created_by", nullable = false)
    public String createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
