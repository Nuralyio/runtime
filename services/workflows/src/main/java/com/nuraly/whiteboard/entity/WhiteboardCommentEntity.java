package com.nuraly.whiteboard.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Comment entity for whiteboard elements.
 * Supports threaded discussions with reactions.
 */
@Entity
@Table(name = "whiteboard_comments")
@Getter
@Setter
public class WhiteboardCommentEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "whiteboard_id", nullable = false)
    public UUID whiteboardId;

    /**
     * Element this comment is attached to.
     * Can be null for comments on the whiteboard itself.
     */
    @Column(name = "element_id")
    public UUID elementId;

    /**
     * Position on canvas if not attached to an element.
     */
    @Column(name = "position_x")
    public Integer positionX;

    @Column(name = "position_y")
    public Integer positionY;

    /**
     * Comment content (supports markdown).
     */
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    public String content;

    @Column(name = "author_id", nullable = false)
    public UUID authorId;

    @Column(name = "author_name")
    public String authorName;

    @Column(name = "author_avatar")
    public String authorAvatar;

    /**
     * Parent comment ID for threaded replies.
     */
    @Column(name = "parent_id")
    public UUID parentId;

    /**
     * Whether this comment thread is resolved.
     */
    @Column
    public Boolean resolved = false;

    @Column(name = "resolved_by")
    public UUID resolvedBy;

    @Column(name = "resolved_at")
    public Instant resolvedAt;

    /**
     * Reactions on this comment.
     * JSON format: [{"emoji": "👍", "userId": "uuid", "username": "John"}]
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    public String reactions;

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

    /**
     * Mark this comment/thread as resolved.
     */
    public void resolve(UUID resolvedByUserId) {
        this.resolved = true;
        this.resolvedBy = resolvedByUserId;
        this.resolvedAt = Instant.now();
    }

    /**
     * Unresolve this comment/thread.
     */
    public void unresolve() {
        this.resolved = false;
        this.resolvedBy = null;
        this.resolvedAt = null;
    }
}
