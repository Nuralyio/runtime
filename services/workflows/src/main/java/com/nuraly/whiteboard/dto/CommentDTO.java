package com.nuraly.whiteboard.dto;

import com.nuraly.whiteboard.entity.WhiteboardCommentEntity;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class CommentDTO {
    public UUID id;
    public UUID whiteboardId;
    public UUID elementId;
    public Integer positionX;
    public Integer positionY;
    public String content;
    public UUID authorId;
    public String authorName;
    public String authorAvatar;
    public UUID parentId;
    public Boolean resolved;
    public UUID resolvedBy;
    public Instant resolvedAt;
    public String reactions;
    public Instant createdAt;
    public Instant updatedAt;

    public static CommentDTO from(WhiteboardCommentEntity entity) {
        CommentDTO dto = new CommentDTO();
        dto.id = entity.id;
        dto.whiteboardId = entity.whiteboardId;
        dto.elementId = entity.elementId;
        dto.positionX = entity.positionX;
        dto.positionY = entity.positionY;
        dto.content = entity.content;
        dto.authorId = entity.authorId;
        dto.authorName = entity.authorName;
        dto.authorAvatar = entity.authorAvatar;
        dto.parentId = entity.parentId;
        dto.resolved = entity.resolved;
        dto.resolvedBy = entity.resolvedBy;
        dto.resolvedAt = entity.resolvedAt;
        dto.reactions = entity.reactions;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}
