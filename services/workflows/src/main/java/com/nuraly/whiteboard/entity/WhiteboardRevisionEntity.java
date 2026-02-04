package com.nuraly.whiteboard.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Revision entity for whiteboard version control.
 * Stores complete snapshots of whiteboard state for history/restore.
 */
@Entity
@Table(name = "whiteboard_revisions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"whiteboard_id", "revision"}))
@Getter
@Setter
public class WhiteboardRevisionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "whiteboard_id", nullable = false)
    public UUID whiteboardId;

    /**
     * Revision number (incrementing).
     */
    @Column(nullable = false)
    public Integer revision;

    /**
     * Full snapshot of the whiteboard state.
     * JSON format: {elements: [...], connectors: [...], settings: {...}}
     */
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    public String snapshot;

    /**
     * Optional description/label for this revision.
     */
    @Column
    public String label;

    @Column(name = "created_by")
    public UUID createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
