package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

/**
 * MCP start node executor - entry point for MCP server-triggered workflows.
 *
 * Receives MCP event data and passes it through to the workflow.
 * Also acts as a tool provider node when connected to Agent/LLM tools port.
 */
@ApplicationScoped
public class McpNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(McpNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.MCP;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode input = context.getInput();

        LOG.infof("MCP node %s received input", node.name);

        // Set MCP event data as context variable
        if (input != null) {
            context.setVariable("mcpEvent", input);
        }

        ObjectNode output = objectMapper.createObjectNode();
        if (input != null && input.isObject()) {
            output.setAll((ObjectNode) input);
        }
        output.put("triggerType", "mcp");
        output.put("nodeId", node.id.toString());

        return NodeExecutionResult.success(output);
    }
}
