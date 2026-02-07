package com.nuraly.canvas.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Abstract base class for canvas elements (nodes).
 * Provides common fields for positioning, dimensions, and visual properties.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseCanvasElement extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(nullable = false)
    public String name;

    /**
     * Element type identifier (e.g., "STICKY_NOTE", "SHAPE_RECTANGLE", "FUNCTION").
     */
    @Column(name = "element_type", nullable = false)
    public String elementType;

    // Position on canvas
    @Column(name = "position_x")
    public Integer positionX = 0;

    @Column(name = "position_y")
    public Integer positionY = 0;

    // Dimensions
    @Column
    public Integer width;

    @Column
    public Integer height;

    // Visual properties
    @Column(name = "z_index")
    public Integer zIndex = 0;

    @Column
    public Float rotation = 0f;

    @Column
    public Float opacity = 1f;

    /**
     * Flexible configuration storage for element-specific settings.
     * JSON format varies by element type.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    public String configuration;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    /**
     * Soft delete timestamp for OT tombstones.
     * When set, the element is considered deleted but preserved for sync.
     */
    @Column(name = "deleted_at")
    public Instant deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

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
