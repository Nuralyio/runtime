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
 * Telegram Bot start node executor - entry point for Telegram bot-triggered workflows.
 *
 * Receives the Telegram update payload and passes it through to the workflow.
 */
@ApplicationScoped
public class TelegramBotNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(TelegramBotNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.TELEGRAM_BOT;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode input = context.getInput();

        LOG.infof("Telegram Bot node %s received input", node.name);

        // Pass bot token from node config to workflow context for downstream nodes
        if (node.configuration != null) {
            JsonNode config = objectMapper.readTree(node.configuration);
            if (config.has("botToken")) {
                context.setVariable("telegramBotToken", config.get("botToken").asText());
            }
        }

        if (input != null) {
            context.setVariable("telegramUpdate", input);

            if (input.has("message")) {
                JsonNode message = input.get("message");
                if (message.has("text")) {
                    context.setVariable("message", message.get("text").asText());
                }
                if (message.has("chat") && message.get("chat").has("id")) {
                    context.setVariable("chatId", message.get("chat").get("id").asText());
                }
                if (message.has("message_id")) {
                    context.setVariable("messageId", message.get("message_id").asLong());
                }
            }
        }

        ObjectNode output = objectMapper.createObjectNode();
        if (input != null && input.isObject()) {
            output.setAll((ObjectNode) input);
        }
        output.put("triggerType", "telegram_bot");
        output.put("nodeId", node.id.toString());

        return NodeExecutionResult.success(output);
    }
}
