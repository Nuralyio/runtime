package com.nuraly.whiteboard.dto;

import com.nuraly.whiteboard.entity.WhiteboardRevisionEntity;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class RevisionDTO {
    public UUID id;
    public UUID whiteboardId;
    public Integer revision;
    public String label;
    public UUID createdBy;
    public Instant createdAt;

    public static RevisionDTO from(WhiteboardRevisionEntity entity) {
        RevisionDTO dto = new RevisionDTO();
        dto.id = entity.id;
        dto.whiteboardId = entity.whiteboardId;
        dto.revision = entity.revision;
        dto.label = entity.label;
        dto.createdBy = entity.createdBy;
        dto.createdAt = entity.createdAt;
        return dto;
    }
}
