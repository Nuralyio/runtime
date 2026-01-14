package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Map;
import java.util.UUID;

/**
 * Debug node executor - captures and outputs execution state for debugging purposes.
 * Displays input data, variables, and outputs from previous nodes.
 */
@ApplicationScoped
public class DebugNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.DEBUG;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        ObjectNode debugOutput = objectMapper.createObjectNode();

        // Capture input data
        JsonNode input = context.getInput();
        debugOutput.set("input", input != null ? input : objectMapper.createObjectNode());

        // Capture all variables
        debugOutput.set("variables", context.getVariables());

        // Capture outputs from previous nodes
        ObjectNode nodeOutputs = objectMapper.createObjectNode();
        Map<UUID, JsonNode> outputs = context.getNodeOutputs();
        if (outputs != null) {
            for (Map.Entry<UUID, JsonNode> entry : outputs.entrySet()) {
                nodeOutputs.set(entry.getKey().toString(), entry.getValue());
            }
        }
        debugOutput.set("nodeOutputs", nodeOutputs);

        // Capture current execution info
        ObjectNode executionInfo = objectMapper.createObjectNode();
        executionInfo.put("executionId", context.getExecution().id.toString());
        executionInfo.put("workflowId", context.getExecution().workflow.id.toString());
        executionInfo.put("workflowName", context.getExecution().workflow.name);
        executionInfo.put("currentNodeId", node.id.toString());
        executionInfo.put("currentNodeName", node.name);
        debugOutput.set("execution", executionInfo);

        // Log to console for server-side debugging
        System.out.println("[DebugNode] " + node.name + " - Debug output:");
        System.out.println(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(debugOutput));

        return NodeExecutionResult.success(debugOutput);
    }
}
