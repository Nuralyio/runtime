package com.nuraly.workflows.engine.registry;

import com.nuraly.workflows.engine.registry.NodeTypeDefinition.PortDefinition;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Central registry of canonical node type definitions.
 *
 * This is the single source of truth for what ports each node type should have.
 * When you add a new port to a node type:
 *   1. Increment the schemaVersion
 *   2. Add the port with addedInVersion = new version
 *
 * The PortMergeService uses this to merge missing ports into nodes loaded from the DB,
 * so existing nodes automatically pick up new ports without migration or delete/recreate.
 */
@ApplicationScoped
public class NodeTypeRegistry {

    private final Map<NodeType, NodeTypeDefinition> definitions = new EnumMap<>(NodeType.class);

    @PostConstruct
    void init() {
        registerAll();
    }

    public NodeTypeDefinition getDefinition(NodeType type) {
        return definitions.get(type);
    }

    public boolean hasDefinition(NodeType type) {
        return definitions.containsKey(type);
    }

    // ========================================================================
    // Registration
    // ========================================================================

    private void registerAll() {
        // --- Core workflow nodes ---

        register(NodeType.START, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.END, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .build());

        register(NodeType.HTTP_START, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.HTTP_END, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .build());

        register(NodeType.CHAT_START, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.CHAT_OUTPUT, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .build());

        // --- Processing nodes ---

        register(NodeType.FUNCTION, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.HTTP, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.CONDITION, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("true", "True", true, 1),
                        port("false", "False", true, 1)
                ))
                .build());

        register(NodeType.DELAY, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.TRANSFORM, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.VARIABLE, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.DEBUG, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.DATABASE, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.EMAIL, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.NOTIFICATION, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.SUB_WORKFLOW, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.PARALLEL, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.LOOP, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("loop_body", "Loop Body", true, 1),
                        port("completed", "Completed", true, 1)
                ))
                .build());

        // --- AI / LLM nodes ---

        // VERSION HISTORY:
        //   v1: input + output
        //   v2: added context_memory input port
        register(NodeType.LLM, NodeTypeDefinition.builder()
                .schemaVersion(2)
                .inputs(List.of(
                        port("input", "Input", true, 1),
                        optionalPort("context_memory", "Context Memory", 2)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        // VERSION HISTORY:
        //   v1: in + llm + tools + output
        //   v2: added memory, prompt, retriever input ports
        register(NodeType.AGENT, NodeTypeDefinition.builder()
                .schemaVersion(2)
                .inputs(List.of(
                        port("in", "Input", true, 1),
                        port("llm", "LLM", true, 1),
                        optionalPort("tools", "Tools", 1),
                        optionalPort("memory", "Memory", 2),
                        optionalPort("prompt", "Prompt", 2),
                        optionalPort("retriever", "Retriever", 2)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.TOOL, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("function", "Function", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.PROMPT, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.OUTPUT_PARSER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.MEMORY, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.CONTEXT_MEMORY, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.GUARDRAIL, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("pass", "Pass", true, 1),
                        port("fail", "Fail", true, 1)
                ))
                .build());

        register(NodeType.HUMAN_INPUT, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        // --- RAG nodes ---

        register(NodeType.EMBEDDING, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.DOCUMENT_LOADER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.TEXT_SPLITTER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.VECTOR_WRITE, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.VECTOR_SEARCH, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.CONTEXT_BUILDER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.RETRIEVER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.RERANKER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        // --- Storage / Web nodes ---

        register(NodeType.FILE_STORAGE, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.OCR, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.WEB_SEARCH, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.WEB_CRAWL, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(
                        port("input", "Input", true, 1)
                ))
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        register(NodeType.CHATBOT, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .outputs(List.of(
                        port("output", "Output", true, 1)
                ))
                .build());

        // --- DB Designer nodes (visual only) ---

        register(NodeType.DB_TABLE, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.DB_VIEW, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.DB_INDEX, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.DB_RELATIONSHIP, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.DB_CONSTRAINT, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.DB_QUERY, NodeTypeDefinition.builder().schemaVersion(1).build());

        // --- Annotation nodes (visual only, no ports) ---

        register(NodeType.NOTE, NodeTypeDefinition.builder().schemaVersion(1).build());
        register(NodeType.FRAME, NodeTypeDefinition.builder().schemaVersion(1).build());

        // Nodes without explicit executors but still useful to define
        register(NodeType.CHAIN, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(port("input", "Input", true, 1)))
                .outputs(List.of(port("output", "Output", true, 1)))
                .build());

        register(NodeType.ROUTER, NodeTypeDefinition.builder()
                .schemaVersion(1)
                .inputs(List.of(port("input", "Input", true, 1)))
                .outputs(List.of(port("output", "Output", true, 1)))
                .build());
    }

    // ========================================================================
    // Helper factories
    // ========================================================================

    private void register(NodeType type, NodeTypeDefinition definition) {
        definitions.put(type, definition);
    }

    private static PortDefinition port(String id, String name, boolean required, int addedInVersion) {
        return PortDefinition.builder()
                .id(id)
                .name(name)
                .required(required)
                .addedInVersion(addedInVersion)
                .build();
    }

    private static PortDefinition optionalPort(String id, String name, int addedInVersion) {
        return PortDefinition.builder()
                .id(id)
                .name(name)
                .required(false)
                .addedInVersion(addedInVersion)
                .build();
    }
}
