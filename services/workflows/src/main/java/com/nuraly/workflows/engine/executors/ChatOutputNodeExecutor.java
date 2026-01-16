package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.service.WorkflowEventService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;

/**
 * Chat Output node executor - sends messages to the chatbot during workflow execution.
 *
 * This allows workflows to communicate with the user in real-time through the chatbot interface.
 *
 * Configuration:
 * {
 *   "message": "Hello! How can I help you?",  // Static message or expression like ${variables.response}
 *   "messageType": "text",                     // text, markdown, html, json
 *   "typing": true,                            // Show typing indicator before message
 *   "typingDelay": 1000,                       // Delay in ms to simulate typing
 *   "metadata": {}                             // Additional metadata to send with message
 * }
 */
@ApplicationScoped
public class ChatOutputNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ChatOutputNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    WorkflowEventService eventService;

    @Override
    public NodeType getType() {
        return NodeType.CHAT_OUTPUT;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("Chat output node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get message - can be static or expression
        String messageTemplate = config.has("message") ? config.get("message").asText() : "";
        if (messageTemplate.isEmpty()) {
            return NodeExecutionResult.failure("Message is required for chat output node");
        }

        // Resolve expressions in the message (e.g., ${variables.response})
        String message = context.resolveExpression(messageTemplate);

        // Get message type
        String messageType = config.has("messageType") ? config.get("messageType").asText() : "text";

        // Get typing settings
        boolean showTyping = config.has("typing") && config.get("typing").asBoolean(false);
        int typingDelay = config.has("typingDelay") ? config.get("typingDelay").asInt(1000) : 1000;

        // Build metadata
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("messageType", messageType);
        metadata.put("nodeId", node.id.toString());
        metadata.put("nodeName", node.name);

        if (config.has("metadata") && config.get("metadata").isObject()) {
            config.get("metadata").fields().forEachRemaining(field -> {
                metadata.put(field.getKey(), field.getValue().asText());
            });
        }

        // Simulate typing delay if enabled
        if (showTyping && typingDelay > 0) {
            try {
                Thread.sleep(typingDelay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        // Send the chat message event
        LOG.infof("Sending chat message from node %s: %s", node.name, message);
        eventService.sendChatMessage(
            context.getExecution(),
            node.id.toString(),
            node.name,
            message,
            metadata
        );

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("message", message);
        output.put("messageType", messageType);
        output.put("sent", true);

        return NodeExecutionResult.success(output);
    }
}
