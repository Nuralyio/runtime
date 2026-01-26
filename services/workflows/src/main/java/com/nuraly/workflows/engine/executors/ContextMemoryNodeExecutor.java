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
 * Context Memory Node Executor - Provides conversation memory for LLM nodes.
 *
 * This node is designed to be connected to an LLM node via the 'memory' input port.
 * It stores and retrieves conversation history using an in-memory store, keyed by conversation ID.
 *
 * Node Configuration:
 * {
 *   "cutoffMode": "message" | "token",      // How to limit context window
 *   "maxMessages": 50,                       // Max messages (when cutoffMode is "message")
 *   "maxTokens": 4000,                       // Max tokens (when cutoffMode is "token")
 *   "conversationIdExpression": "${input.threadId}"  // Expression to get conversation ID
 * }
 *
 * Usage:
 * This node should NOT be executed directly. Instead, it is used by the LLM node to:
 * 1. Resolve the conversation ID from the expression
 * 2. Load previous messages from the in-memory store
 * 3. Save new messages (user prompt and assistant response) after LLM call
 *
 * When executed directly (e.g., for validation), it returns its configuration.
 */
@ApplicationScoped
public class ContextMemoryNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ContextMemoryNodeExecutor.class);
    private static final String DEFAULT_CUTOFF_MODE = "message";
    private static final int DEFAULT_MAX_MESSAGES = 50;
    private static final int DEFAULT_MAX_TOKENS = 4000;
    private static final String DEFAULT_CONVERSATION_ID_EXPRESSION = "${input.threadId}";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.MEMORY;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.debugf("Context Memory node executed: %s", node.name);

        // Parse configuration
        JsonNode config = node.configuration != null
                ? objectMapper.readTree(node.configuration)
                : objectMapper.createObjectNode();

        // Extract memory configuration
        String cutoffMode = config.has("cutoffMode")
                ? config.get("cutoffMode").asText()
                : DEFAULT_CUTOFF_MODE;

        int maxMessages = config.has("maxMessages")
                ? config.get("maxMessages").asInt()
                : DEFAULT_MAX_MESSAGES;

        int maxTokens = config.has("maxTokens")
                ? config.get("maxTokens").asInt()
                : DEFAULT_MAX_TOKENS;

        String conversationIdExpression = config.has("conversationIdExpression")
                ? config.get("conversationIdExpression").asText()
                : DEFAULT_CONVERSATION_ID_EXPRESSION;

        // Resolve the conversation ID
        String conversationId = context.resolveExpression(conversationIdExpression);

        if (conversationId == null || conversationId.isEmpty() ||
            conversationId.equals(conversationIdExpression)) {
            // Try common fallbacks
            conversationId = tryResolveConversationId(context);
        }

        // Build output with memory configuration for LLM node to use
        ObjectNode output = objectMapper.createObjectNode();
        output.put("type", "context_memory");
        output.put("cutoffMode", cutoffMode);
        output.put("maxMessages", maxMessages);
        output.put("maxTokens", maxTokens);
        output.put("conversationIdExpression", conversationIdExpression);

        if (conversationId != null && !conversationId.isEmpty()) {
            output.put("conversationId", conversationId);
        }

        // Store memory node ID for reference
        output.put("memoryNodeId", node.id.toString());

        LOG.debugf("Context Memory config: mode=%s, maxMessages=%d, maxTokens=%d, conversationId=%s",
                cutoffMode, maxMessages, maxTokens, conversationId);

        return NodeExecutionResult.success(output);
    }

    /**
     * Try to resolve conversation ID from common input fields.
     */
    private String tryResolveConversationId(ExecutionContext context) {
        JsonNode input = context.getInput();
        if (input == null) {
            return null;
        }

        // Try common field names for conversation/thread ID
        String[] possibleFields = {"threadId", "conversationId", "sessionId", "chatId", "thread_id", "conversation_id"};

        for (String field : possibleFields) {
            if (input.has(field) && !input.get(field).isNull()) {
                String value = input.get(field).asText();
                if (value != null && !value.isEmpty()) {
                    LOG.debugf("Resolved conversationId from input.%s: %s", field, value);
                    return value;
                }
            }
        }

        // Try nested body object (from HTTP requests)
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : possibleFields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    String value = body.get(field).asText();
                    if (value != null && !value.isEmpty()) {
                        LOG.debugf("Resolved conversationId from input.body.%s: %s", field, value);
                        return value;
                    }
                }
            }
        }

        // Try variables
        for (String field : possibleFields) {
            JsonNode varValue = context.getVariable(field);
            if (varValue != null && !varValue.isNull()) {
                String value = varValue.asText();
                if (value != null && !value.isEmpty()) {
                    LOG.debugf("Resolved conversationId from variable %s: %s", field, value);
                    return value;
                }
            }
        }

        return null;
    }

    /**
     * Validate cutoff mode.
     */
    public static boolean isValidCutoffMode(String mode) {
        return "message".equalsIgnoreCase(mode) || "token".equalsIgnoreCase(mode);
    }
}
