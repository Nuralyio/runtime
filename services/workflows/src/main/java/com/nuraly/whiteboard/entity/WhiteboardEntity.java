package com.nuraly.whiteboard.entity;

import com.nuraly.canvas.entity.BaseCanvas;
import com.nuraly.canvas.entity.CanvasType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Whiteboard entity for collaborative visual collaboration.
 * Extends BaseCanvas with whiteboard-specific settings.
 */
@Entity
@Table(name = "whiteboards")
@Getter
@Setter
public class WhiteboardEntity extends BaseCanvas {

    // Whiteboard appearance
    @Column(name = "background_color")
    public String backgroundColor = "#ffffff";

    @Column(name = "grid_enabled")
    public Boolean gridEnabled = true;

    @Column(name = "grid_size")
    public Integer gridSize = 20;

    @Column(name = "snap_to_grid")
    public Boolean snapToGrid = true;

    // Collaboration settings
    @Column(name = "allow_anonymous_editing")
    public Boolean allowAnonymousEditing = false;

    @Column(name = "max_collaborators")
    public Integer maxCollaborators = 50;

    // Template reference (if created from a template)
    @Column(name = "template_id")
    public UUID templateId;

    // Relationships
    @OneToMany(mappedBy = "whiteboard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<WhiteboardElementEntity> elements = new ArrayList<>();

    @OneToMany(mappedBy = "whiteboard", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<WhiteboardConnectorEntity> connectors = new ArrayList<>();

    @Override
    @PrePersist
    public void prePersist() {
        super.prePersist();
        this.canvasType = CanvasType.WHITEBOARD;
    }

    /**
     * Add an element to this whiteboard.
     */
    public void addElement(WhiteboardElementEntity element) {
        elements.add(element);
        element.setWhiteboard(this);
    }

    /**
     * Remove an element from this whiteboard.
     */
    public void removeElement(WhiteboardElementEntity element) {
        elements.remove(element);
        element.setWhiteboard(null);
    }

    /**
     * Add a connector to this whiteboard.
     */
    public void addConnector(WhiteboardConnectorEntity connector) {
        connectors.add(connector);
        connector.setWhiteboard(this);
    }

    /**
     * Remove a connector from this whiteboard.
     */
    public void removeConnector(WhiteboardConnectorEntity connector) {
        connectors.remove(connector);
        connector.setWhiteboard(null);
    }
}
