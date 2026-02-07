package com.nuraly.whiteboard.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * Vote entity for whiteboard voting elements.
 * Each user can have one vote per element.
 */
@Entity
@Table(name = "whiteboard_votes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"element_id", "user_id"}))
@Getter
@Setter
public class WhiteboardVoteEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "whiteboard_id", nullable = false)
    public UUID whiteboardId;

    @Column(name = "element_id", nullable = false)
    public UUID elementId;

    @Column(name = "user_id", nullable = false)
    public UUID userId;

    @Column(name = "user_name")
    public String userName;

    /**
     * Vote value - can be:
     * - Numeric: "1", "2", "3", "4", "5"
     * - Thumbs: "thumbsup", "thumbsdown"
     * - Emoji: "🎉", "👍", "❤️", etc.
     */
    @Column(nullable = false)
    public String value;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
