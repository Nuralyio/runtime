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
 * WhatsApp Webhook start node executor - entry point for WhatsApp webhook-triggered workflows.
 */
@ApplicationScoped
public class WhatsappWebhookNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(WhatsappWebhookNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.WHATSAPP_WEBHOOK;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode input = context.getInput();

        LOG.infof("WhatsApp Webhook node %s received input", node.name);

        if (input != null) {
            context.setVariable("whatsappMessage", input);
        }

        ObjectNode output = objectMapper.createObjectNode();
        if (input != null && input.isObject()) {
            output.setAll((ObjectNode) input);
        }
        output.put("triggerType", "whatsapp_webhook");
        output.put("nodeId", node.id.toString());

        return NodeExecutionResult.success(output);
    }
}
