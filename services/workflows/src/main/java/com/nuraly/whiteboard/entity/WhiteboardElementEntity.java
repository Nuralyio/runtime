package com.nuraly.whiteboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nuraly.canvas.entity.BaseCanvasElement;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Element entity for whiteboard canvas.
 * Supports sticky notes, shapes, text blocks, images, drawings, and voting elements.
 */
@Entity
@Table(name = "whiteboard_elements")
@Getter
@Setter
public class WhiteboardElementEntity extends BaseCanvasElement {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiteboard_id", nullable = false)
    @JsonIgnore
    public WhiteboardEntity whiteboard;

    // Visual properties
    @Column(name = "background_color")
    public String backgroundColor;

    @Column(name = "border_color")
    public String borderColor;

    @Column(name = "border_width")
    public Integer borderWidth = 0;

    @Column(name = "border_radius")
    public Integer borderRadius = 0;

    // Text properties (for sticky notes, text blocks)
    @Lob
    @Column(name = "text_content", columnDefinition = "TEXT")
    public String textContent;

    @Column(name = "font_size")
    public Integer fontSize = 14;

    @Column(name = "font_family")
    public String fontFamily = "Inter";

    @Column(name = "font_weight")
    public String fontWeight = "normal";

    @Column(name = "font_style")
    public String fontStyle = "normal";

    @Column(name = "text_color")
    public String textColor = "#000000";

    @Column(name = "text_align")
    public String textAlign = "left";

    // For images
    @Lob
    @Column(name = "image_url", columnDefinition = "TEXT")
    public String imageUrl;

    @Column(name = "image_alt")
    public String imageAlt;

    // For drawings (SVG path data)
    @Lob
    @Column(name = "path_data", columnDefinition = "TEXT")
    public String pathData;

    // For shapes
    @Column(name = "shape_type")
    public String shapeType;  // rectangle, circle, diamond, etc.

    @Column(name = "fill_color")
    public String fillColor;

    // Author tracking
    @Column(name = "created_by")
    public UUID createdBy;

    @Column(name = "last_edited_by")
    public UUID lastEditedBy;

    /**
     * Helper to get the element type as enum.
     */
    public WhiteboardElementType getElementTypeEnum() {
        try {
            return WhiteboardElementType.valueOf(this.elementType);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Helper to set element type from enum.
     */
    public void setElementTypeEnum(WhiteboardElementType type) {
        this.elementType = type.name();
    }
}
