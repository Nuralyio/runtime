package com.nuraly.whiteboard.dto;

import com.nuraly.whiteboard.entity.WhiteboardConnectorEntity;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class WhiteboardConnectorDTO {
    public UUID id;
    public UUID sourceElementId;
    public UUID targetElementId;
    public String sourcePortId;
    public String targetPortId;
    public String strokeColor;
    public Integer strokeWidth;
    public String strokeStyle;
    public String startArrow;
    public String endArrow;
    public String label;
    public Float labelPosition;
    public String lineType;
    public String controlPoints;
    public Instant createdAt;

    public static WhiteboardConnectorDTO from(WhiteboardConnectorEntity entity) {
        WhiteboardConnectorDTO dto = new WhiteboardConnectorDTO();
        dto.id = entity.id;
        dto.sourceElementId = entity.sourceElementId;
        dto.targetElementId = entity.targetElementId;
        dto.sourcePortId = entity.sourcePortId;
        dto.targetPortId = entity.targetPortId;
        dto.strokeColor = entity.strokeColor;
        dto.strokeWidth = entity.strokeWidth;
        dto.strokeStyle = entity.strokeStyle;
        dto.startArrow = entity.startArrow;
        dto.endArrow = entity.endArrow;
        dto.label = entity.label;
        dto.labelPosition = entity.labelPosition;
        dto.lineType = entity.lineType;
        dto.controlPoints = entity.controlPoints;
        dto.createdAt = entity.createdAt;
        return dto;
    }
}
