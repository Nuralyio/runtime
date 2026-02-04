package com.nuraly.whiteboard.dto;

import com.nuraly.whiteboard.entity.WhiteboardElementEntity;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class WhiteboardElementDTO {
    public UUID id;
    public String name;
    public String elementType;
    public Integer positionX;
    public Integer positionY;
    public Integer width;
    public Integer height;
    public Integer zIndex;
    public Float rotation;
    public Float opacity;
    public String configuration;
    public String backgroundColor;
    public String borderColor;
    public Integer borderWidth;
    public Integer borderRadius;
    public String textContent;
    public Integer fontSize;
    public String fontFamily;
    public String fontWeight;
    public String fontStyle;
    public String textColor;
    public String textAlign;
    public String imageUrl;
    public String imageAlt;
    public String pathData;
    public String shapeType;
    public String fillColor;
    public UUID createdBy;
    public UUID lastEditedBy;
    public Instant createdAt;
    public Instant updatedAt;

    public static WhiteboardElementDTO from(WhiteboardElementEntity entity) {
        WhiteboardElementDTO dto = new WhiteboardElementDTO();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.elementType = entity.elementType;
        dto.positionX = entity.positionX;
        dto.positionY = entity.positionY;
        dto.width = entity.width;
        dto.height = entity.height;
        dto.zIndex = entity.zIndex;
        dto.rotation = entity.rotation;
        dto.opacity = entity.opacity;
        dto.configuration = entity.configuration;
        dto.backgroundColor = entity.backgroundColor;
        dto.borderColor = entity.borderColor;
        dto.borderWidth = entity.borderWidth;
        dto.borderRadius = entity.borderRadius;
        dto.textContent = entity.textContent;
        dto.fontSize = entity.fontSize;
        dto.fontFamily = entity.fontFamily;
        dto.fontWeight = entity.fontWeight;
        dto.fontStyle = entity.fontStyle;
        dto.textColor = entity.textColor;
        dto.textAlign = entity.textAlign;
        dto.imageUrl = entity.imageUrl;
        dto.imageAlt = entity.imageAlt;
        dto.pathData = entity.pathData;
        dto.shapeType = entity.shapeType;
        dto.fillColor = entity.fillColor;
        dto.createdBy = entity.createdBy;
        dto.lastEditedBy = entity.lastEditedBy;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}
