package com.nuraly.workflows.engine.registry;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.registry.NodeTypeDefinition.PortDefinition;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Merges stored port definitions with the canonical NodeTypeRegistry definitions.
 *
 * This enables zero-downtime schema evolution: when a new port is added to a node type
 * in code, existing nodes in the DB automatically get the new port on read without
 * requiring delete/recreate or a database migration.
 *
 * Merge rules:
 *   - Ports in DB that match a canonical port by ID: kept as-is (user config preserved)
 *   - Ports in canonical but missing from DB: added with defaults
 *   - Ports in DB but not in canonical: kept (backward compat for user-created ports)
 *   - Canonical inputs that already exist as config ports: skipped (prevents duplication
 *     for nodes like AGENT where llm/prompt/memory/tools are config ports on the frontend
 *     but listed as inputs in the registry)
 */
@ApplicationScoped
public class PortMergeService {

    private static final Logger LOG = Logger.getLogger(PortMergeService.class);

    @Inject
    NodeTypeRegistry registry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Merge the stored ports JSON with the canonical definition for the given node type.
     *
     * @param nodeType     the node type
     * @param storedPorts  the ports JSON string from the database (may be null)
     * @return merged ports JSON string, or null if no definition exists
     */
    public String mergePorts(NodeType nodeType, String storedPorts) {
        NodeTypeDefinition definition = registry.getDefinition(nodeType);
        if (definition == null) {
            return storedPorts;
        }

        try {
            JsonNode stored = parseStoredPorts(storedPorts);
            ObjectNode merged = objectMapper.createObjectNode();

            // Collect config port IDs so canonical inputs that already exist as configs
            // are not duplicated into the inputs array (e.g. AGENT's llm, prompt, memory, tools)
            Set<String> configPortIds = new HashSet<>();
            if (stored != null && stored.has("configs") && stored.get("configs").isArray()) {
                for (JsonNode configPort : stored.get("configs")) {
                    if (configPort.has("id")) {
                        configPortIds.add(configPort.get("id").asText());
                    }
                }
            }

            ArrayNode mergedInputs = mergePortList(
                    stored != null && stored.has("inputs") ? stored.get("inputs") : null,
                    definition.getInputs(),
                    configPortIds
            );
            ArrayNode mergedOutputs = mergePortList(
                    stored != null && stored.has("outputs") ? stored.get("outputs") : null,
                    definition.getOutputs(),
                    Set.of()
            );

            merged.set("inputs", mergedInputs);
            merged.set("outputs", mergedOutputs);

            // Preserve config ports (bottom ports used by agent nodes like AGENT)
            if (stored != null && stored.has("configs")) {
                merged.set("configs", stored.get("configs").deepCopy());
            }

            merged.put("_schemaVersion", definition.getSchemaVersion());

            return objectMapper.writeValueAsString(merged);
        } catch (Exception e) {
            LOG.warnf("Failed to merge ports for node type %s: %s", nodeType, e.getMessage());
            return storedPorts;
        }
    }

    /**
     * Check if stored ports are outdated compared to the canonical definition.
     */
    public boolean isOutdated(NodeType nodeType, String storedPorts) {
        NodeTypeDefinition definition = registry.getDefinition(nodeType);
        if (definition == null) {
            return false;
        }

        try {
            JsonNode stored = parseStoredPorts(storedPorts);
            if (stored == null) {
                // No stored ports but definition has ports → outdated
                return !definition.getInputs().isEmpty() || !definition.getOutputs().isEmpty();
            }

            // Check if stored has a schema version
            if (stored.has("_schemaVersion")) {
                return stored.get("_schemaVersion").asInt() < definition.getSchemaVersion();
            }

            // No version tag → check if any canonical ports are missing
            return hasMissingPorts(stored.get("inputs"), definition.getInputs())
                    || hasMissingPorts(stored.get("outputs"), definition.getOutputs());
        } catch (Exception e) {
            return false;
        }
    }

    // ========================================================================
    // Internal
    // ========================================================================

    private JsonNode parseStoredPorts(String storedPorts) throws JsonProcessingException {
        if (storedPorts == null || storedPorts.isBlank()) {
            return null;
        }
        return objectMapper.readTree(storedPorts);
    }

    /**
     * Merge a single port list (inputs or outputs).
     * - Keep all existing stored ports (preserves user customization)
     * - Append any canonical ports that are missing from stored
     */
    private ArrayNode mergePortList(JsonNode storedArray, List<PortDefinition> canonicalPorts, Set<String> excludeIds) {
        ArrayNode result = objectMapper.createArrayNode();

        // Collect IDs of stored ports
        Set<String> storedIds = new HashSet<>();
        if (storedArray != null && storedArray.isArray()) {
            for (JsonNode portNode : storedArray) {
                if (portNode.has("id")) {
                    storedIds.add(portNode.get("id").asText());
                }
                // Keep existing port as-is
                result.add(portNode.deepCopy());
            }
        }

        // Append missing canonical ports (skip those already present as config ports)
        for (PortDefinition canonical : canonicalPorts) {
            if (excludeIds.contains(canonical.getId())) continue;
            if (!storedIds.contains(canonical.getId())) {
                ObjectNode newPort = objectMapper.createObjectNode();
                newPort.put("id", canonical.getId());
                newPort.put("name", canonical.getName());
                newPort.put("type", canonical.getType());
                newPort.put("required", canonical.isRequired());
                newPort.put("_addedByMerge", true);
                result.add(newPort);
            }
        }

        return result;
    }

    private boolean hasMissingPorts(JsonNode storedArray, List<PortDefinition> canonicalPorts) {
        Set<String> storedIds = new HashSet<>();
        if (storedArray != null && storedArray.isArray()) {
            for (JsonNode portNode : storedArray) {
                if (portNode.has("id")) {
                    storedIds.add(portNode.get("id").asText());
                }
            }
        }

        for (PortDefinition canonical : canonicalPorts) {
            if (!storedIds.contains(canonical.getId())) {
                return true;
            }
        }
        return false;
    }
}
