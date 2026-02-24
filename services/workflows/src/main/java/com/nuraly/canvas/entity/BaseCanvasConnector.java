package com.nuraly.canvas.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Abstract base class for canvas connectors (edges).
 * Provides common fields for source/target connections and visual properties.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class BaseCanvasConnector extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "source_element_id", nullable = false)
    public UUID sourceElementId;

    @Column(name = "target_element_id", nullable = false)
    public UUID targetElementId;

    // Port connections (for workflow nodes)
    @Column(name = "source_port_id")
    public String sourcePortId;

    @Column(name = "target_port_id")
    public String targetPortId;

    // Visual properties
    @Column(name = "stroke_color")
    public String strokeColor = "#000000";

    @Column(name = "stroke_width")
    public Integer strokeWidth = 2;

    @Column(name = "stroke_style")
    public String strokeStyle = "solid";  // solid, dashed, dotted

    // Arrow styles for whiteboard connectors
    @Column(name = "start_arrow")
    public String startArrow = "none";  // none, arrow, circle, diamond

    @Column(name = "end_arrow")
    public String endArrow = "arrow";

    // Label on connector
    @Column
    public String label;

    /**
     * Control points for curved/bent connectors.
     * JSON array format: [{"x": 100, "y": 200}, {"x": 150, "y": 250}]
     */
    @Lob
    @Column(name = "control_points", columnDefinition = "TEXT")
    public String controlPoints;

    @Column(name = "created_at")
    public Instant createdAt;

    /**
     * Soft delete timestamp for OT tombstones.
     */
    @Column(name = "deleted_at")
    public Instant deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
