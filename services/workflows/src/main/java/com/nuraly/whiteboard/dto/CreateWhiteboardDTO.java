package com.nuraly.whiteboard.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateWhiteboardDTO {
    public String name;
    public String description;
    public String applicationId;
    public String backgroundColor;
    public Boolean gridEnabled;
    public Integer gridSize;
    public Boolean snapToGrid;
    public UUID templateId;
}
