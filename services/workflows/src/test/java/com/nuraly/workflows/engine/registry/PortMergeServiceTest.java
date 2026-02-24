package com.nuraly.workflows.engine.registry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.engine.registry.NodeTypeDefinition.PortDefinition;
import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

/**
 * Unit tests for PortMergeService — validates merge-on-read port evolution.
 * Pure Mockito, no container, no DB.
 */
@ExtendWith(MockitoExtension.class)
class PortMergeServiceTest {

    @Mock
    private NodeTypeRegistry registry;

    @InjectMocks
    private PortMergeService mergeService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Canonical AGENT definition (matches NodeTypeRegistry)
    private NodeTypeDefinition agentDefinition;

    @BeforeEach
    void setUp() {
        agentDefinition = NodeTypeDefinition.builder()
                .schemaVersion(2)
                .inputs(List.of(
                        port("in", "Input", true),
                        port("llm", "LLM", true),
                        optionalPort("tools", "Tools"),
                        optionalPort("memory", "Memory"),
                        optionalPort("prompt", "Prompt"),
                        optionalPort("retriever", "Retriever")
                ))
                .outputs(List.of(
                        port("out", "Output", true)
                ))
                .build();
    }

    // ------------------------------------------------------------------
    // portMergeNoConfigDuplicates
    // ------------------------------------------------------------------

    @Test
    void portMergeNoConfigDuplicates() throws Exception {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        // Stored ports from DB: "llm", "prompt", "memory", "tools" appear as config ports.
        // The canonical definition also lists them as inputs.
        // Merge must NOT duplicate them into the inputs array.
        String storedPorts = """
                {
                  "inputs": [
                    {"id": "in", "name": "Input", "type": "default"}
                  ],
                  "outputs": [
                    {"id": "out", "name": "Output", "type": "default"}
                  ],
                  "configs": [
                    {"id": "llm", "name": "LLM"},
                    {"id": "prompt", "name": "Prompt"},
                    {"id": "memory", "name": "Memory"},
                    {"id": "tools", "name": "Tools"}
                  ]
                }""";

        String merged = mergeService.mergePorts(NodeType.AGENT, storedPorts);
        JsonNode mergedJson = objectMapper.readTree(merged);

        JsonNode inputs = mergedJson.get("inputs");
        // Count how many times "llm" appears in inputs
        int llmCount = 0;
        for (JsonNode port : inputs) {
            if ("llm".equals(port.get("id").asText())) llmCount++;
        }
        assertEquals(0, llmCount, "llm should not appear in inputs (it's a config port)");

        // "in" should still be in inputs
        assertTrue(hasPort(inputs, "in"), "canonical 'in' port should remain in inputs");

        // "retriever" is canonical but not in configs → should be added to inputs
        assertTrue(hasPort(inputs, "retriever"),
                "retriever should be added to inputs (not a config port)");
    }

    // ------------------------------------------------------------------
    // portMergeOutputIdConsistency
    // ------------------------------------------------------------------

    @Test
    void portMergeOutputIdConsistency() throws Exception {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        // Stored ports already have "out" output. Canonical also defines "out".
        // Merge must not create a duplicate "out" or "output" entry.
        String storedPorts = """
                {
                  "inputs": [{"id": "in", "name": "Input"}],
                  "outputs": [{"id": "out", "name": "Output", "type": "default"}]
                }""";

        String merged = mergeService.mergePorts(NodeType.AGENT, storedPorts);
        JsonNode outputs = objectMapper.readTree(merged).get("outputs");

        int outCount = 0;
        for (JsonNode port : outputs) {
            String id = port.get("id").asText();
            if ("out".equals(id) || "output".equals(id)) outCount++;
        }
        assertEquals(1, outCount, "should have exactly one output port (no duplicates)");
    }

    // ------------------------------------------------------------------
    // portMergeAddsNewCanonicalPorts
    // ------------------------------------------------------------------

    @Test
    void portMergeAddsNewCanonicalPorts() throws Exception {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        // Stored ports from v1: only "in", "llm", "tools", "out".
        // v2 added: memory, prompt, retriever.
        // Merge should add the missing ones.
        String storedPorts = """
                {
                  "inputs": [
                    {"id": "in", "name": "Input", "type": "default"}
                  ],
                  "outputs": [
                    {"id": "out", "name": "Output", "type": "default"}
                  ],
                  "configs": [
                    {"id": "llm", "name": "LLM"},
                    {"id": "tools", "name": "Tools"}
                  ]
                }""";

        String merged = mergeService.mergePorts(NodeType.AGENT, storedPorts);
        JsonNode mergedJson = objectMapper.readTree(merged);
        JsonNode inputs = mergedJson.get("inputs");

        // memory, prompt, retriever should be added by merge
        assertTrue(hasPort(inputs, "memory"), "memory port should be added by merge");
        assertTrue(hasPort(inputs, "prompt"), "prompt port should be added by merge");
        assertTrue(hasPort(inputs, "retriever"), "retriever port should be added by merge");

        // Verify _addedByMerge flag on new ports
        for (JsonNode port : inputs) {
            String id = port.get("id").asText();
            if (Set.of("memory", "prompt", "retriever").contains(id)) {
                assertTrue(port.has("_addedByMerge"),
                        id + " should have _addedByMerge flag");
            }
        }

        // Schema version should be updated
        assertEquals(2, mergedJson.get("_schemaVersion").asInt());
    }

    // ------------------------------------------------------------------
    // Edge cases
    // ------------------------------------------------------------------

    @Test
    void portMergeReturnsStoredWhenNoDefinition() throws Exception {
        when(registry.getDefinition(NodeType.NOTE)).thenReturn(null);

        String storedPorts = """
                {"inputs":[],"outputs":[]}""";
        String result = mergeService.mergePorts(NodeType.NOTE, storedPorts);
        assertEquals(storedPorts, result, "should return stored ports as-is when no definition");
    }

    @Test
    void portMergeHandlesNullStoredPorts() throws Exception {
        NodeTypeDefinition startDef = NodeTypeDefinition.builder()
                .schemaVersion(1)
                .outputs(List.of(port("out", "Output", true)))
                .build();
        when(registry.getDefinition(NodeType.START)).thenReturn(startDef);

        String merged = mergeService.mergePorts(NodeType.START, null);
        JsonNode mergedJson = objectMapper.readTree(merged);

        assertTrue(hasPort(mergedJson.get("outputs"), "out"),
                "canonical output port should be created from scratch");
    }

    @Test
    void portMergePreservesUserCreatedPorts() throws Exception {
        NodeTypeDefinition funcDef = NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(port("input", "Input", true)))
                .outputs(List.of(port("out", "Output", true)))
                .build();
        when(registry.getDefinition(NodeType.FUNCTION)).thenReturn(funcDef);

        // User added a custom output port "error"
        String storedPorts = """
                {
                  "inputs": [{"id": "input", "name": "Input"}],
                  "outputs": [
                    {"id": "out", "name": "Output"},
                    {"id": "error", "name": "Error Output", "type": "custom"}
                  ]
                }""";

        String merged = mergeService.mergePorts(NodeType.FUNCTION, storedPorts);
        JsonNode outputs = objectMapper.readTree(merged).get("outputs");

        assertTrue(hasPort(outputs, "out"), "canonical port should remain");
        assertTrue(hasPort(outputs, "error"), "user-created port should be preserved");
    }

    @Test
    void isOutdatedDetectsMissingPorts() {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        // v1 stored ports missing memory, prompt, retriever
        String storedV1 = """
                {
                  "inputs": [
                    {"id": "in", "name": "Input"},
                    {"id": "llm", "name": "LLM"},
                    {"id": "tools", "name": "Tools"}
                  ],
                  "outputs": [{"id": "out", "name": "Output"}]
                }""";

        assertTrue(mergeService.isOutdated(NodeType.AGENT, storedV1),
                "should detect missing canonical ports as outdated");
    }

    @Test
    void isOutdatedDetectsVersionMismatch() {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        String storedV1 = """
                {
                  "_schemaVersion": 1,
                  "inputs": [{"id": "in"}, {"id": "llm"}, {"id": "tools"}],
                  "outputs": [{"id": "out"}]
                }""";

        assertTrue(mergeService.isOutdated(NodeType.AGENT, storedV1),
                "schema version 1 should be outdated vs canonical version 2");
    }

    @Test
    void isOutdatedReturnsFalseWhenCurrent() {
        when(registry.getDefinition(NodeType.AGENT)).thenReturn(agentDefinition);

        String storedV2 = """
                {
                  "_schemaVersion": 2,
                  "inputs": [{"id": "in"}, {"id": "llm"}, {"id": "tools"}, {"id": "memory"}, {"id": "prompt"}, {"id": "retriever"}],
                  "outputs": [{"id": "out"}]
                }""";

        assertFalse(mergeService.isOutdated(NodeType.AGENT, storedV2),
                "should not be outdated when schema versions match");
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private boolean hasPort(JsonNode portsArray, String portId) {
        if (portsArray == null || !portsArray.isArray()) return false;
        for (JsonNode port : portsArray) {
            if (port.has("id") && portId.equals(port.get("id").asText())) {
                return true;
            }
        }
        return false;
    }

    private static PortDefinition port(String id, String name, boolean required) {
        return PortDefinition.builder()
                .id(id).name(name).required(required).addedInVersion(1).build();
    }

    private static PortDefinition optionalPort(String id, String name) {
        return PortDefinition.builder()
                .id(id).name(name).required(false).addedInVersion(2).build();
    }
}
