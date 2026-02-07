package com.nuraly.whiteboard.dto;

import lombok.Data;

@Data
public class CreateElementDTO {
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
    public String textColor;
    public String textAlign;
    public String imageUrl;
    public String imageAlt;
    public String pathData;
    public String shapeType;
    public String fillColor;
}
