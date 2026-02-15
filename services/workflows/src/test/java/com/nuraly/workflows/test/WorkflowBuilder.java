package com.nuraly.workflows.test;

import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Fluent builder for in-memory workflow entity graphs — no persistence needed.
 *
 * <pre>
 * WorkflowBuilder.Result wf = WorkflowBuilder.create("test-agent")
 *     .node("start", NodeType.START)
 *     .node("agent", NodeType.AGENT, "{\"maxIterations\":10}")
 *     .node("llm", NodeType.AGENT_LLM, "{\"provider\":\"openai\",\"model\":\"gpt-4\"}")
 *     .node("end", NodeType.END)
 *     .edge("start", "out", "agent", "in")
 *     .edge("llm", "out", "agent", "llm")
 *     .edge("agent", "out", "end", "input")
 *     .build();
 * </pre>
 */
public class WorkflowBuilder {

    private final WorkflowEntity workflow;
    private final Map<String, WorkflowNodeEntity> nodesByName = new HashMap<>();

    private WorkflowBuilder(String name) {
        workflow = new WorkflowEntity();
        workflow.id = UUID.randomUUID();
        workflow.name = name;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
    }

    public static WorkflowBuilder create(String name) {
        return new WorkflowBuilder(name);
    }

    public WorkflowBuilder node(String name, NodeType type) {
        return node(name, type, null);
    }

    public WorkflowBuilder node(String name, NodeType type, String configuration) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.name = name;
        node.type = type;
        node.configuration = configuration;
        node.workflow = workflow;
        workflow.nodes.add(node);
        nodesByName.put(name, node);
        return this;
    }

    public WorkflowBuilder edge(String sourceName, String sourcePort,
                                String targetName, String targetPort) {
        WorkflowNodeEntity source = nodesByName.get(sourceName);
        WorkflowNodeEntity target = nodesByName.get(targetName);
        if (source == null) {
            throw new IllegalArgumentException("Unknown source node: " + sourceName);
        }
        if (target == null) {
            throw new IllegalArgumentException("Unknown target node: " + targetName);
        }

        WorkflowEdgeEntity edge = new WorkflowEdgeEntity();
        edge.id = UUID.randomUUID();
        edge.workflow = workflow;
        edge.sourceNode = source;
        edge.targetNode = target;
        edge.sourcePortId = sourcePort;
        edge.targetPortId = targetPort;
        workflow.edges.add(edge);
        return this;
    }

    public Result build() {
        return new Result(workflow, nodesByName);
    }

    /**
     * Immutable result holding the wired workflow graph.
     */
    public static class Result {
        private final WorkflowEntity workflow;
        private final Map<String, WorkflowNodeEntity> nodesByName;

        Result(WorkflowEntity workflow, Map<String, WorkflowNodeEntity> nodesByName) {
            this.workflow = workflow;
            this.nodesByName = nodesByName;
        }

        public WorkflowEntity workflow() {
            return workflow;
        }

        public WorkflowNodeEntity node(String name) {
            WorkflowNodeEntity node = nodesByName.get(name);
            if (node == null) {
                throw new IllegalArgumentException("Unknown node: " + name);
            }
            return node;
        }
    }
}
