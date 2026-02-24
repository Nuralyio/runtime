package com.nuraly.whiteboard.registry;

import com.nuraly.whiteboard.entity.WhiteboardElementType;
import com.nuraly.whiteboard.registry.WhiteboardElementTypeDefinition.ConfigProperty;
import com.nuraly.whiteboard.registry.WhiteboardElementTypeDefinition.DefaultValue;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Central registry of canonical whiteboard element type definitions.
 *
 * Source of truth for what configuration properties each element type should have.
 * When you add a new config property to an element type:
 *   1. Increment the schemaVersion
 *   2. Add the property with addedInVersion = new version
 *
 * The WhiteboardConfigMergeService uses this to inject missing properties into
 * elements loaded from the DB, so existing elements automatically get new config
 * options without migration or delete/recreate.
 */
@ApplicationScoped
public class WhiteboardElementTypeRegistry {

    private final Map<WhiteboardElementType, WhiteboardElementTypeDefinition> definitions =
            new EnumMap<>(WhiteboardElementType.class);

    @PostConstruct
    void init() {
        registerAll();
    }

    public WhiteboardElementTypeDefinition getDefinition(WhiteboardElementType type) {
        return definitions.get(type);
    }

    public WhiteboardElementTypeDefinition getDefinition(String elementTypeStr) {
        try {
            WhiteboardElementType type = WhiteboardElementType.valueOf(elementTypeStr);
            return definitions.get(type);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public boolean hasDefinition(WhiteboardElementType type) {
        return definitions.containsKey(type);
    }

    // ========================================================================
    // Registration
    // ========================================================================

    private void registerAll() {

        // --- STICKY_NOTE ---
        // v1: base config (color presets, pinned)
        // v2: added lineHeight, maxLength
        register(WhiteboardElementType.STICKY_NOTE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(2)
                .properties(List.of(
                        configProp("colorPreset", "Color Preset", "select", "yellow", 1,
                                List.of("yellow", "blue", "green", "pink", "orange", "purple")),
                        configProp("pinned", "Pinned", "boolean", false, 1),
                        configProp("lineHeight", "Line Height", "number", 1.5, 2),
                        configProp("maxLength", "Max Length", "number", 500, 2)
                ))
                .columnDefaults(List.of(
                        colDefault("backgroundColor", "#FDFD96", 1),
                        colDefault("fontSize", 14, 1),
                        colDefault("textAlign", "left", 1)
                ))
                .build());

        // --- SHAPE_RECTANGLE ---
        register(WhiteboardElementType.SHAPE_RECTANGLE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("cornerRadius", "Corner Radius", "number", 0, 1),
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .columnDefaults(List.of(
                        colDefault("borderWidth", 2, 1),
                        colDefault("borderColor", "#333333", 1)
                ))
                .build());

        // --- SHAPE_CIRCLE ---
        register(WhiteboardElementType.SHAPE_CIRCLE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .columnDefaults(List.of(
                        colDefault("borderWidth", 2, 1),
                        colDefault("borderColor", "#333333", 1)
                ))
                .build());

        // --- SHAPE_DIAMOND ---
        register(WhiteboardElementType.SHAPE_DIAMOND, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .columnDefaults(List.of(
                        colDefault("borderWidth", 2, 1),
                        colDefault("borderColor", "#333333", 1)
                ))
                .build());

        // --- SHAPE_TRIANGLE ---
        register(WhiteboardElementType.SHAPE_TRIANGLE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .build());

        // --- SHAPE_ARROW ---
        register(WhiteboardElementType.SHAPE_ARROW, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("headStyle", "Head Style", "select", "filled", 1,
                                List.of("filled", "open", "none")),
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .build());

        // --- SHAPE_LINE ---
        register(WhiteboardElementType.SHAPE_LINE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted")),
                        configProp("strokeWidth", "Stroke Width", "number", 2, 1)
                ))
                .build());

        // --- SHAPE_STAR ---
        register(WhiteboardElementType.SHAPE_STAR, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("points", "Points", "number", 5, 1),
                        configProp("innerRadius", "Inner Radius", "number", 0.5, 1)
                ))
                .build());

        // --- SHAPE_HEXAGON ---
        register(WhiteboardElementType.SHAPE_HEXAGON, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeStyle", "Stroke Style", "select", "solid", 1,
                                List.of("solid", "dashed", "dotted"))
                ))
                .build());

        // --- TEXT_BLOCK ---
        // v1: base
        // v2: added richText support
        register(WhiteboardElementType.TEXT_BLOCK, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(2)
                .properties(List.of(
                        configProp("richText", "Rich Text", "boolean", false, 2),
                        configProp("listStyle", "List Style", "select", "none", 2,
                                List.of("none", "bullet", "numbered", "checkbox"))
                ))
                .columnDefaults(List.of(
                        colDefault("fontSize", 16, 1),
                        colDefault("textAlign", "left", 1)
                ))
                .build());

        // --- IMAGE ---
        register(WhiteboardElementType.IMAGE, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("objectFit", "Object Fit", "select", "contain", 1,
                                List.of("contain", "cover", "fill", "none")),
                        configProp("borderEnabled", "Border", "boolean", false, 1)
                ))
                .build());

        // --- DRAWING ---
        register(WhiteboardElementType.DRAWING, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("strokeColor", "Stroke Color", "color", "#000000", 1),
                        configProp("strokeWidth", "Stroke Width", "number", 2, 1),
                        configProp("smoothing", "Smoothing", "boolean", true, 1)
                ))
                .build());

        // --- FRAME ---
        register(WhiteboardElementType.FRAME, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("showLabel", "Show Label", "boolean", true, 1),
                        configProp("clipping", "Clip Content", "boolean", false, 1)
                ))
                .columnDefaults(List.of(
                        colDefault("backgroundColor", "#F5F5F5", 1),
                        colDefault("borderWidth", 1, 1),
                        colDefault("borderColor", "#CCCCCC", 1)
                ))
                .build());

        // --- VOTING ---
        // v1: base voting
        // v2: added timer, anonymous mode
        register(WhiteboardElementType.VOTING, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(2)
                .properties(List.of(
                        configProp("voteType", "Vote Type", "select", "thumbs", 1,
                                List.of("thumbs", "stars", "dots", "custom")),
                        configProp("maxVotesPerUser", "Max Votes", "number", 1, 1),
                        configProp("showResults", "Show Results", "boolean", true, 1),
                        configProp("timerSeconds", "Timer (seconds)", "number", 0, 2),
                        configProp("anonymous", "Anonymous Voting", "boolean", false, 2)
                ))
                .columnDefaults(List.of(
                        colDefault("backgroundColor", "#E8F4FD", 1)
                ))
                .build());

        // --- MERMAID_DIAGRAM ---
        register(WhiteboardElementType.MERMAID_DIAGRAM, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of(
                        configProp("diagramType", "Diagram Type", "select", "flowchart", 1,
                                List.of("flowchart", "sequence", "class", "state", "er", "gantt", "pie", "mindmap"))
                ))
                .columnDefaults(List.of(
                        colDefault("backgroundColor", "#FFFFFF", 1)
                ))
                .build());

        // --- ANCHOR ---
        register(WhiteboardElementType.ANCHOR, WhiteboardElementTypeDefinition.builder()
                .schemaVersion(1)
                .properties(List.of())
                .build());
    }

    // ========================================================================
    // Helpers
    // ========================================================================

    private void register(WhiteboardElementType type, WhiteboardElementTypeDefinition definition) {
        definitions.put(type, definition);
    }

    private static ConfigProperty configProp(String key, String label, String type,
                                             Object defaultValue, int addedInVersion) {
        return ConfigProperty.builder()
                .key(key)
                .label(label)
                .type(type)
                .defaultValue(defaultValue)
                .addedInVersion(addedInVersion)
                .build();
    }

    private static ConfigProperty configProp(String key, String label, String type,
                                             Object defaultValue, int addedInVersion,
                                             List<String> options) {
        return ConfigProperty.builder()
                .key(key)
                .label(label)
                .type(type)
                .defaultValue(defaultValue)
                .addedInVersion(addedInVersion)
                .options(options)
                .build();
    }

    private static DefaultValue colDefault(String column, Object value, int addedInVersion) {
        return DefaultValue.builder()
                .column(column)
                .value(value)
                .addedInVersion(addedInVersion)
                .build();
    }
}
