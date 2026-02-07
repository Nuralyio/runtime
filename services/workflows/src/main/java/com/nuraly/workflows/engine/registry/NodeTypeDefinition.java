package com.nuraly.workflows.engine.registry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Defines the canonical schema for a node type: its ports and default configuration.
 * Used by NodeTypeRegistry to drive merge-on-read for schema evolution.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeTypeDefinition {

    private int schemaVersion;

    @Builder.Default
    private List<PortDefinition> inputs = new ArrayList<>();

    @Builder.Default
    private List<PortDefinition> outputs = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortDefinition {
        private String id;
        private String name;
        @Builder.Default
        private String type = "default";
        @Builder.Default
        private boolean required = false;
        private int addedInVersion;
    }
}
