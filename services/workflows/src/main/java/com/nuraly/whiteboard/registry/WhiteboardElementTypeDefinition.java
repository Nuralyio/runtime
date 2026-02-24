package com.nuraly.whiteboard.registry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Defines the canonical configuration schema for a whiteboard element type.
 * Used by WhiteboardElementTypeRegistry for merge-on-read schema evolution.
 *
 * Unlike workflow nodes (which have a ports JSON), whiteboard elements store
 * type-specific settings in the {@code configuration} JSON field. This definition
 * declares what config properties each element type should have and their defaults.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhiteboardElementTypeDefinition {

    private int schemaVersion;

    @Builder.Default
    private List<ConfigProperty> properties = new ArrayList<>();

    /**
     * Default visual properties for the element type (backgroundColor, fontSize, etc.).
     * These are merged into the entity-level columns, not the configuration JSON.
     */
    @Builder.Default
    private List<DefaultValue> columnDefaults = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfigProperty {
        private String key;
        private String label;
        private String type; // string, number, boolean, array, object, color, select
        private Object defaultValue;
        private int addedInVersion;
        private List<String> options; // for select type
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DefaultValue {
        private String column;
        private Object value;
        private int addedInVersion;
    }
}
