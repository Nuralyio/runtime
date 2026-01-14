package com.nuraly.workflows.entity;

import com.nuraly.workflows.entity.enums.WorkflowStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workflows")
@Getter
@Setter
public class WorkflowEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(nullable = false)
    public String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "application_id")
    public String applicationId;

    @Column(name = "created_by")
    public String createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public WorkflowStatus status = WorkflowStatus.DRAFT;

    public String version = "1.0.0";

    @Lob
    @Column(columnDefinition = "TEXT")
    public String variables; // JSON: workflow-level variables schema

    @Lob
    @Column(columnDefinition = "TEXT")
    public String viewport; // JSON: canvas viewport state {"zoom": 1, "panX": 0, "panY": 0}

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<WorkflowNodeEntity> nodes = new ArrayList<>();

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<WorkflowEdgeEntity> edges = new ArrayList<>();

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<WorkflowTriggerEntity> triggers = new ArrayList<>();

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
