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

import java.util.Iterator;

/**
 * UI Table node executor - shapes upstream data into { headers, rows, totalCount }
 * for rendering as an interactive table in the config panel.
 */
@ApplicationScoped
public class UiTableNodeExecutor implements NodeExecutor {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.UI_TABLE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        ObjectNode output = objectMapper.createObjectNode();
        JsonNode config = objectMapper.valueToTree(node.configuration);

        // Build headers from tableColumns config
        ArrayNode headers = objectMapper.createArrayNode();
        JsonNode tableColumns = config.path("tableColumns");
        if (tableColumns.isArray()) {
            for (JsonNode col : tableColumns) {
                ObjectNode header = objectMapper.createObjectNode();
                header.put("name", col.path("name").asText(""));
                header.put("key", col.path("key").asText(""));
                if (col.has("width")) {
                    header.set("width", col.get("width"));
                }
                if (col.path("filterable").asBoolean(false)) {
                    header.put("filterable", true);
                }
                headers.add(header);
            }
        }
        output.set("headers", headers);

        // Extract rows from upstream input
        JsonNode input = context.getInput();
        ArrayNode rows = extractRows(input);
        output.set("rows", rows);
        output.put("totalCount", rows.size());

        return NodeExecutionResult.success(output);
    }

    /**
     * Extract an array of rows from the input data.
     * Checks if input is an array directly, or looks for common array fields.
     */
    private ArrayNode extractRows(JsonNode input) {
        if (input == null || input.isNull() || input.isMissingNode()) {
            return objectMapper.createArrayNode();
        }

        // If input is already an array, use it directly
        if (input.isArray()) {
            return (ArrayNode) input;
        }

        // Look for common array fields
        String[] commonFields = {"results", "data", "rows", "items", "records"};
        for (String field : commonFields) {
            JsonNode candidate = input.path(field);
            if (candidate.isArray()) {
                return (ArrayNode) candidate;
            }
        }

        // If input is an object with a single array field, use that
        if (input.isObject()) {
            Iterator<String> fieldNames = input.fieldNames();
            while (fieldNames.hasNext()) {
                JsonNode candidate = input.get(fieldNames.next());
                if (candidate != null && candidate.isArray()) {
                    return (ArrayNode) candidate;
                }
            }
        }

        // Wrap single object as a one-element array
        if (input.isObject()) {
            ArrayNode single = objectMapper.createArrayNode();
            single.add(input);
            return single;
        }

        return objectMapper.createArrayNode();
    }
}
