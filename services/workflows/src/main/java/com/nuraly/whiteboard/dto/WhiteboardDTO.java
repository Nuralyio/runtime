package com.nuraly.whiteboard.dto;

import com.nuraly.whiteboard.entity.WhiteboardEntity;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class WhiteboardDTO {
    public UUID id;
    public String name;
    public String description;
    public String applicationId;
    public String createdBy;
    public String viewport;
    public Long version;
    public String backgroundColor;
    public Boolean gridEnabled;
    public Integer gridSize;
    public Boolean snapToGrid;
    public Boolean allowAnonymousEditing;
    public Integer maxCollaborators;
    public UUID templateId;
    public List<WhiteboardElementDTO> elements;
    public List<WhiteboardConnectorDTO> connectors;
    public Instant createdAt;
    public Instant updatedAt;

    public static WhiteboardDTO from(WhiteboardEntity entity) {
        WhiteboardDTO dto = new WhiteboardDTO();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        dto.applicationId = entity.applicationId;
        dto.createdBy = entity.createdBy;
        dto.viewport = entity.viewport;
        dto.version = entity.version;
        dto.backgroundColor = entity.backgroundColor;
        dto.gridEnabled = entity.gridEnabled;
        dto.gridSize = entity.gridSize;
        dto.snapToGrid = entity.snapToGrid;
        dto.allowAnonymousEditing = entity.allowAnonymousEditing;
        dto.maxCollaborators = entity.maxCollaborators;
        dto.templateId = entity.templateId;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;

        if (entity.elements != null) {
            dto.elements = entity.elements.stream()
                    .filter(e -> e.deletedAt == null)
                    .map(WhiteboardElementDTO::from)
                    .toList();
        }

        if (entity.connectors != null) {
            dto.connectors = entity.connectors.stream()
                    .filter(c -> c.deletedAt == null)
                    .map(WhiteboardConnectorDTO::from)
                    .toList();
        }

        return dto;
    }
}
