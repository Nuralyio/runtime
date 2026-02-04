package com.nuraly.canvas.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Abstract base class for all canvas types (workflow, whiteboard).
 * Provides common fields for viewport state, versioning, and timestamps.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseCanvas extends PanacheEntityBase {

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

    /**
     * Viewport state for the canvas.
     * JSON format: {"zoom": 1.0, "panX": 0, "panY": 0}
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    public String viewport;

    /**
     * Optimistic locking version for concurrent editing.
     */
    @Version
    public Long version = 0L;

    /**
     * Canvas type discriminator.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "canvas_type", nullable = false)
    public CanvasType canvasType;

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
