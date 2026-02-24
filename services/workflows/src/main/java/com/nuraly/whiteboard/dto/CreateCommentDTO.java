package com.nuraly.whiteboard.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateCommentDTO {
    public UUID elementId;
    public String content;
    public UUID parentId;
    public Integer positionX;
    public Integer positionY;
}
