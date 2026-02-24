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
 * Custom WebSocket start node executor - entry point for WebSocket-triggered workflows.
 */
@ApplicationScoped
public class CustomWebsocketNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(CustomWebsocketNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.CUSTOM_WEBSOCKET;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode input = context.getInput();

        LOG.infof("Custom WebSocket node %s received input", node.name);

        if (input != null) {
            context.setVariable("websocketMessage", input);
        }

        ObjectNode output = objectMapper.createObjectNode();
        if (input != null && input.isObject()) {
            output.setAll((ObjectNode) input);
        }
        output.put("triggerType", "custom_websocket");
        output.put("nodeId", node.id.toString());

        return NodeExecutionResult.success(output);
    }
}
