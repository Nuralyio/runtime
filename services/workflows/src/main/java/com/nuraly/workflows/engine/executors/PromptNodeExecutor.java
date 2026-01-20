package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Executor for PROMPT nodes.
 * Builds a prompt from a template by substituting variables.
 * The resulting prompt is passed to the next node (typically an LLM).
 */
@ApplicationScoped
public class PromptNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.PROMPT;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        ObjectNode output = objectMapper.createObjectNode();

        if (node.configuration == null) {
            // No configuration - just pass through input
            return NodeExecutionResult.success(context.getInput());
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get the prompt template
        String template = "";
        if (config.has("template")) {
            template = config.get("template").asText();
        } else if (config.has("prompt")) {
            template = config.get("prompt").asText();
        } else if (config.has("systemPrompt")) {
            template = config.get("systemPrompt").asText();
        }

        // Resolve variables in the template
        String resolvedPrompt = context.resolveExpression(template);
        output.put("prompt", resolvedPrompt);

        // Also include system prompt if separate
        if (config.has("systemPrompt") && config.has("template")) {
            String systemPrompt = context.resolveExpression(config.get("systemPrompt").asText());
            output.put("systemPrompt", systemPrompt);
        }

        // Include any additional variables specified
        if (config.has("variables")) {
            JsonNode variables = config.get("variables");
            ObjectNode resolvedVars = objectMapper.createObjectNode();
            variables.fields().forEachRemaining(entry -> {
                String varName = entry.getKey();
                String varValue = context.resolveExpression(entry.getValue().asText());
                resolvedVars.put(varName, varValue);
            });
            output.set("variables", resolvedVars);
        }

        // Store in output variable if specified
        if (config.has("outputVariable")) {
            String varName = config.get("outputVariable").asText();
            context.setVariable(varName, resolvedPrompt);
        }

        // Always store the prompt in a standard variable for LLM nodes
        context.setVariable("_prompt", resolvedPrompt);

        return NodeExecutionResult.success(output);
    }
}
