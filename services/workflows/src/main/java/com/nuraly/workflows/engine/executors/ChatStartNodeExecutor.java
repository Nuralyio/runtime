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
 * Chat Start node executor - entry point for chatbot-triggered workflows.
 *
 * This node receives the chatbot message and makes it available to the workflow.
 * The input from the chatbot is passed through as the node's output.
 *
 * Input from chatbot:
 * {
 *   "message": "User's message text",
 *   "threadId": "conversation-thread-id",
 *   "files": [...],              // Attached files if any
 *   "modules": ["module1"],      // Selected modules
 *   "metadata": {...}            // Additional metadata
 * }
 *
 * Configuration:
 * {
 *   "outputVariable": "chatInput"  // Variable name to store the input (optional)
 * }
 */
@ApplicationScoped
public class ChatStartNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ChatStartNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.CHAT_START;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode input = context.getInput();

        LOG.infof("Chat Start node %s received input: %s", node.name, input);

        // Parse configuration if present
        String outputVariable = "chatInput";
        if (node.configuration != null && !node.configuration.isEmpty()) {
            JsonNode config = objectMapper.readTree(node.configuration);
            if (config.has("outputVariable")) {
                outputVariable = config.get("outputVariable").asText("chatInput");
            }
        }

        // Store the chat input in a variable for easy access
        if (input != null) {
            context.setVariable(outputVariable, input);

            // Also store individual fields for convenience
            if (input.has("message")) {
                context.setVariable("message", input.get("message").asText());
            }
            if (input.has("threadId")) {
                context.setVariable("threadId", input.get("threadId").asText());
            }
        }

        // Build output - pass through the input
        ObjectNode output = objectMapper.createObjectNode();
        if (input != null) {
            output.setAll((ObjectNode) input);
        }
        output.put("triggerType", "chatbot");
        output.put("nodeId", node.id.toString());

        return NodeExecutionResult.success(output);
    }
}
