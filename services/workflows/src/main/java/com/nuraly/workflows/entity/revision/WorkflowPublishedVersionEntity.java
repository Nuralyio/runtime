package com.nuraly.workflows.entity.revision;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workflow_published_versions")
@Getter
@Setter
public class WorkflowPublishedVersionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "workflow_id", nullable = false, unique = true)
    public UUID workflowId;

    @Column(nullable = false)
    public Integer revision;

    @Column(name = "published_by", nullable = false)
    public String publishedBy;

    @Column(name = "published_at")
    public Instant publishedAt;

    @PrePersist
    public void prePersist() {
        publishedAt = Instant.now();
    }
}
