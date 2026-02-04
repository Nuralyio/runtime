package com.nuraly.whiteboard.entity;

/**
 * Types of elements that can be placed on a whiteboard.
 */
public enum WhiteboardElementType {
    // Sticky notes
    STICKY_NOTE,

    // Shapes
    SHAPE_RECTANGLE,
    SHAPE_CIRCLE,
    SHAPE_DIAMOND,
    SHAPE_TRIANGLE,
    SHAPE_ARROW,
    SHAPE_LINE,
    SHAPE_STAR,
    SHAPE_HEXAGON,

    // Text and content
    TEXT_BLOCK,
    IMAGE,

    // Drawing
    DRAWING,

    // Grouping
    FRAME,

    // Interactive
    VOTING
}
