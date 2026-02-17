package com.nuraly.workflows.engine.registry;

import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

class NodeTypeRegistryTest {

    private static NodeTypeRegistry registry;

    @BeforeAll
    static void setUp() throws Exception {
        registry = new NodeTypeRegistry();
        Method init = NodeTypeRegistry.class.getDeclaredMethod("init");
        init.setAccessible(true);
        init.invoke(registry);
    }

    @Test
    void hasDefinitionForAllCoreNodes() {
        assertTrue(registry.hasDefinition(NodeType.START));
        assertTrue(registry.hasDefinition(NodeType.END));
        assertTrue(registry.hasDefinition(NodeType.HTTP_START));
        assertTrue(registry.hasDefinition(NodeType.HTTP_END));
        assertTrue(registry.hasDefinition(NodeType.CHAT_START));
        assertTrue(registry.hasDefinition(NodeType.CHAT_OUTPUT));
    }

    @Test
    void hasDefinitionForProcessingNodes() {
        assertTrue(registry.hasDefinition(NodeType.FUNCTION));
        assertTrue(registry.hasDefinition(NodeType.HTTP));
        assertTrue(registry.hasDefinition(NodeType.CONDITION));
        assertTrue(registry.hasDefinition(NodeType.DELAY));
        assertTrue(registry.hasDefinition(NodeType.TRANSFORM));
        assertTrue(registry.hasDefinition(NodeType.VARIABLE));
    }

    @Test
    void hasDefinitionForAiNodes() {
        assertTrue(registry.hasDefinition(NodeType.LLM));
        assertTrue(registry.hasDefinition(NodeType.AGENT));
        assertTrue(registry.hasDefinition(NodeType.PROMPT));
        assertTrue(registry.hasDefinition(NodeType.MEMORY));
    }

    @Test
    void getDefinitionReturnsNonNullForRegisteredTypes() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.START);
        assertNotNull(def);
        assertEquals(1, def.getSchemaVersion());
    }

    @Test
    void startNodeHasOutputPort() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.START);
        assertNotNull(def.getOutputs());
        assertFalse(def.getOutputs().isEmpty());
        assertEquals("out", def.getOutputs().get(0).getId());
    }

    @Test
    void endNodeHasInputPort() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.END);
        assertNotNull(def.getInputs());
        assertFalse(def.getInputs().isEmpty());
        assertEquals("input", def.getInputs().get(0).getId());
    }

    @Test
    void conditionNodeHasTrueAndFalseOutputs() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.CONDITION);
        assertNotNull(def.getOutputs());
        assertEquals(2, def.getOutputs().size());
        assertEquals("true", def.getOutputs().get(0).getId());
        assertEquals("false", def.getOutputs().get(1).getId());
    }

    @Test
    void llmNodeHasInputAndOutput() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.LLM);
        assertNotNull(def.getInputs());
        assertNotNull(def.getOutputs());
        assertFalse(def.getInputs().isEmpty());
        assertFalse(def.getOutputs().isEmpty());
    }

    @Test
    void agentNodeHasMultipleInputPorts() {
        NodeTypeDefinition def = registry.getDefinition(NodeType.AGENT);
        assertNotNull(def.getInputs());
        assertTrue(def.getInputs().size() >= 2);
    }
}
