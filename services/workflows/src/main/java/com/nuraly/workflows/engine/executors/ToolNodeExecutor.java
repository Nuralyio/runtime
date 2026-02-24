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
import org.jboss.logging.Logger;

/**
 * Tool Node Executor - Defines a tool that can be used by an AI Agent.
 *
 * The Tool node doesn't execute anything by itself. It provides tool definition
 * (name, description, parameters) that the Agent uses for LLM tool calling.
 * When the LLM decides to call a tool, the connected Function node is executed.
 *
 * Node Configuration:
 * {
 *   "toolName": "get_weather",
 *   "description": "Get current weather for a location",
 *   "parameters": [
 *     { "name": "location", "type": "string", "description": "City name", "required": true },
 *     { "name": "units", "type": "string", "description": "celsius or fahrenheit", "required": false }
 *   ]
 * }
 *
 * Input Ports:
 * - 'function': Connected Function node that executes when tool is called
 *
 * Output Ports:
 * - 'out': Tool definition (connects to Agent's 'tools' port)
 */
@ApplicationScoped
public class ToolNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ToolNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.TOOL;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.debugf("Executing tool node: %s", node.name);

        if (node.configuration == null) {
            return NodeExecutionResult.failure("Tool node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get tool name (required)
        String toolName = config.has("toolName") ? config.get("toolName").asText() : null;
        if (toolName == null || toolName.trim().isEmpty()) {
            return NodeExecutionResult.failure("Tool name is required");
        }

        // Get description (required for LLM to understand the tool)
        String description = config.has("description") ? config.get("description").asText() : "";

        // Build the tool definition in OpenAI function calling format
        ObjectNode toolDefinition = objectMapper.createObjectNode();
        toolDefinition.put("type", "function");

        ObjectNode function = objectMapper.createObjectNode();
        function.put("name", toolName);
        function.put("description", description);

        // Build parameters schema from configuration
        ObjectNode parametersSchema = buildParametersSchema(config);
        function.set("parameters", parametersSchema);

        toolDefinition.set("function", function);

        // Store the node ID so the agent knows which function to execute
        toolDefinition.put("nodeId", node.id.toString());

        LOG.debugf("Tool definition created: %s", toolName);

        return NodeExecutionResult.success(toolDefinition);
    }

    /**
     * Build JSON Schema for tool parameters from configuration.
     */
    private ObjectNode buildParametersSchema(JsonNode config) {
        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "object");

        ObjectNode properties = objectMapper.createObjectNode();
        ArrayNode required = objectMapper.createArrayNode();

        if (config.has("parameters") && config.get("parameters").isArray()) {
            for (JsonNode param : config.get("parameters")) {
                String paramName = param.has("name") ? param.get("name").asText() : null;
                if (paramName == null || paramName.trim().isEmpty()) {
                    continue;
                }

                ObjectNode paramSchema = objectMapper.createObjectNode();

                // Map type to JSON Schema type
                String paramType = param.has("type") ? param.get("type").asText() : "string";
                paramSchema.put("type", mapToJsonSchemaType(paramType));

                // Add description
                if (param.has("description")) {
                    paramSchema.put("description", param.get("description").asText());
                }

                properties.set(paramName, paramSchema);

                // Add to required array if marked as required
                if (param.has("required") && param.get("required").asBoolean()) {
                    required.add(paramName);
                }
            }
        }

        schema.set("properties", properties);
        if (required.size() > 0) {
            schema.set("required", required);
        }

        return schema;
    }

    /**
     * Map configuration type to JSON Schema type.
     */
    private String mapToJsonSchemaType(String type) {
        if (type == null) return "string";

        return switch (type.toLowerCase()) {
            case "number", "integer", "int" -> "number";
            case "boolean", "bool" -> "boolean";
            case "array", "list" -> "array";
            case "object", "map" -> "object";
            default -> "string";
        };
    }
}
