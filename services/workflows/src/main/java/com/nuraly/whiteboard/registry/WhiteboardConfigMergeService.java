package com.nuraly.whiteboard.registry;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.whiteboard.dto.WhiteboardElementDTO;
import com.nuraly.whiteboard.registry.WhiteboardElementTypeDefinition.ConfigProperty;
import com.nuraly.whiteboard.registry.WhiteboardElementTypeDefinition.DefaultValue;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashSet;
import java.util.Set;

/**
 * Merges stored whiteboard element configuration with canonical definitions.
 *
 * This enables zero-downtime schema evolution for whiteboard elements.
 * When a new config property is added to an element type (e.g., "anonymous" voting),
 * existing elements in the DB automatically get the new property on read
 * without requiring delete/recreate or database migration.
 *
 * Merge rules:
 *   - Config keys that exist in stored JSON: kept as-is (user values preserved)
 *   - Canonical keys missing from stored JSON: added with default values
 *   - Stored keys not in canonical: kept (backward compat)
 *   - Column defaults: applied only when the DTO column is null
 */
@ApplicationScoped
public class WhiteboardConfigMergeService {

    private static final Logger LOG = Logger.getLogger(WhiteboardConfigMergeService.class);

    @Inject
    WhiteboardElementTypeRegistry registry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Merge canonical config properties into the element DTO.
     * Modifies the DTO in place: updates configuration JSON and fills null column defaults.
     */
    public void mergeElement(WhiteboardElementDTO dto) {
        if (dto == null || dto.elementType == null) {
            return;
        }

        WhiteboardElementTypeDefinition definition = registry.getDefinition(dto.elementType);
        if (definition == null) {
            return;
        }

        // Merge configuration JSON
        dto.configuration = mergeConfiguration(dto.elementType, dto.configuration, definition);

        // Apply column defaults for null values
        applyColumnDefaults(dto, definition);
    }

    /**
     * Merge the stored configuration JSON with canonical property definitions.
     *
     * @param elementType     the element type (for logging)
     * @param storedConfig    the stored configuration JSON string (may be null)
     * @param definition      the canonical definition
     * @return merged configuration JSON string
     */
    public String mergeConfiguration(String elementType, String storedConfig,
                                     WhiteboardElementTypeDefinition definition) {
        try {
            ObjectNode stored = parseConfig(storedConfig);
            if (stored == null) {
                stored = objectMapper.createObjectNode();
            }

            Set<String> existingKeys = new HashSet<>();
            stored.fieldNames().forEachRemaining(existingKeys::add);

            // Add missing canonical properties with defaults
            for (ConfigProperty prop : definition.getProperties()) {
                if (!existingKeys.contains(prop.getKey()) && prop.getDefaultValue() != null) {
                    setJsonValue(stored, prop.getKey(), prop.getDefaultValue());
                }
            }

            stored.put("_schemaVersion", definition.getSchemaVersion());

            return objectMapper.writeValueAsString(stored);
        } catch (Exception e) {
            LOG.warnf("Failed to merge config for element type %s: %s", elementType, e.getMessage());
            return storedConfig;
        }
    }

    /**
     * Check if stored config is outdated compared to canonical definition.
     */
    public boolean isOutdated(String elementType, String storedConfig) {
        WhiteboardElementTypeDefinition definition = registry.getDefinition(elementType);
        if (definition == null) {
            return false;
        }

        try {
            ObjectNode stored = parseConfig(storedConfig);
            if (stored == null) {
                return !definition.getProperties().isEmpty();
            }

            if (stored.has("_schemaVersion")) {
                return stored.get("_schemaVersion").asInt() < definition.getSchemaVersion();
            }

            // No version tag — check for missing keys
            Set<String> existingKeys = new HashSet<>();
            stored.fieldNames().forEachRemaining(existingKeys::add);

            for (ConfigProperty prop : definition.getProperties()) {
                if (!existingKeys.contains(prop.getKey())) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    // ========================================================================
    // Internal
    // ========================================================================

    private ObjectNode parseConfig(String config) throws JsonProcessingException {
        if (config == null || config.isBlank()) {
            return null;
        }
        JsonNode node = objectMapper.readTree(config);
        return node.isObject() ? (ObjectNode) node : null;
    }

    private void setJsonValue(ObjectNode node, String key, Object value) {
        if (value instanceof String s) {
            node.put(key, s);
        } else if (value instanceof Integer i) {
            node.put(key, i);
        } else if (value instanceof Long l) {
            node.put(key, l);
        } else if (value instanceof Double d) {
            node.put(key, d);
        } else if (value instanceof Float f) {
            node.put(key, f);
        } else if (value instanceof Boolean b) {
            node.put(key, b);
        } else {
            node.put(key, String.valueOf(value));
        }
    }

    private void applyColumnDefaults(WhiteboardElementDTO dto, WhiteboardElementTypeDefinition definition) {
        for (DefaultValue def : definition.getColumnDefaults()) {
            switch (def.getColumn()) {
                case "backgroundColor" -> {
                    if (dto.backgroundColor == null) dto.backgroundColor = (String) def.getValue();
                }
                case "borderColor" -> {
                    if (dto.borderColor == null) dto.borderColor = (String) def.getValue();
                }
                case "borderWidth" -> {
                    if (dto.borderWidth == null) dto.borderWidth = toInt(def.getValue());
                }
                case "borderRadius" -> {
                    if (dto.borderRadius == null) dto.borderRadius = toInt(def.getValue());
                }
                case "fontSize" -> {
                    if (dto.fontSize == null) dto.fontSize = toInt(def.getValue());
                }
                case "fontFamily" -> {
                    if (dto.fontFamily == null) dto.fontFamily = (String) def.getValue();
                }
                case "textColor" -> {
                    if (dto.textColor == null) dto.textColor = (String) def.getValue();
                }
                case "textAlign" -> {
                    if (dto.textAlign == null) dto.textAlign = (String) def.getValue();
                }
                case "fillColor" -> {
                    if (dto.fillColor == null) dto.fillColor = (String) def.getValue();
                }
                default -> LOG.debugf("Unknown column default: %s", def.getColumn());
            }
        }
    }

    private Integer toInt(Object value) {
        if (value instanceof Integer i) return i;
        if (value instanceof Number n) return n.intValue();
        return null;
    }
}
