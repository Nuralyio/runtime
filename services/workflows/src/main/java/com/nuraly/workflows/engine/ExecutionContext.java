package com.nuraly.workflows.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.dto.revision.RevisionSnapshotDTO;
import com.nuraly.workflows.dto.revision.WorkflowNodeVersionDTO;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
public class ExecutionContext {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private WorkflowExecutionEntity execution;
    private JsonNode input;
    private ObjectNode variables;
    private Map<UUID, JsonNode> nodeOutputs;
    private WorkflowNodeEntity currentNode;
    private boolean cancelled;
    private boolean paused;

    // Revision snapshot for versioned execution
    private RevisionSnapshotDTO revisionSnapshot;
    private Map<UUID, WorkflowNodeVersionDTO> snapshotNodeMap;

    public ExecutionContext(WorkflowExecutionEntity execution) {
        this.execution = execution;
        this.nodeOutputs = new HashMap<>();
        this.variables = objectMapper.createObjectNode();
        this.cancelled = false;
        this.paused = false;

        // Initialize from execution
        if (execution.inputData != null) {
            try {
                this.input = objectMapper.readTree(execution.inputData);
            } catch (Exception e) {
                this.input = objectMapper.createObjectNode();
            }
        } else {
            this.input = objectMapper.createObjectNode();
        }

        if (execution.variables != null) {
            try {
                this.variables = (ObjectNode) objectMapper.readTree(execution.variables);
            } catch (Exception e) {
                this.variables = objectMapper.createObjectNode();
            }
        }
    }

    public void setVariable(String key, Object value) {
        if (value instanceof JsonNode) {
            variables.set(key, (JsonNode) value);
        } else if (value instanceof String) {
            variables.put(key, (String) value);
        } else if (value instanceof Integer) {
            variables.put(key, (Integer) value);
        } else if (value instanceof Long) {
            variables.put(key, (Long) value);
        } else if (value instanceof Double) {
            variables.put(key, (Double) value);
        } else if (value instanceof Boolean) {
            variables.put(key, (Boolean) value);
        } else {
            try {
                variables.set(key, objectMapper.valueToTree(value));
            } catch (Exception e) {
                variables.put(key, String.valueOf(value));
            }
        }
    }

    public JsonNode getVariable(String key) {
        return variables.get(key);
    }

    public String getVariableAsString(String key) {
        JsonNode node = variables.get(key);
        return node != null ? node.asText() : null;
    }

    public void setNodeOutput(UUID nodeId, JsonNode output) {
        nodeOutputs.put(nodeId, output);
    }

    public JsonNode getNodeOutput(UUID nodeId) {
        return nodeOutputs.get(nodeId);
    }

    public String getVariablesAsString() {
        try {
            return objectMapper.writeValueAsString(variables);
        } catch (Exception e) {
            return "{}";
        }
    }

    /**
     * Restore variables from JSON string (used for checkpoint recovery).
     */
    public void restoreVariables(String variablesJson) {
        if (variablesJson != null && !variablesJson.isEmpty()) {
            try {
                this.variables = (ObjectNode) objectMapper.readTree(variablesJson);
            } catch (Exception e) {
                // Keep existing variables if parsing fails
            }
        }
    }

    /**
     * Get all node outputs (used for checkpointing).
     */
    public Map<UUID, JsonNode> getNodeOutputs() {
        return nodeOutputs;
    }

    public String resolveExpression(String expression) {
        if (expression == null) {
            return null;
        }

        String result = expression;

        // Replace ${variables.xxx} with actual values
        while (result.contains("${variables.")) {
            int start = result.indexOf("${variables.");
            int end = result.indexOf("}", start);
            if (end == -1) break;

            String fullMatch = result.substring(start, end + 1);
            String varName = result.substring(start + 12, end);

            JsonNode value = getVariable(varName);
            String replacement = "";
            if (value != null) {
                // Use toString() for arrays/objects to get JSON, asText() for primitives
                if (value.isArray() || value.isObject()) {
                    replacement = value.toString();
                } else {
                    replacement = value.asText();
                }
            }

            result = result.replace(fullMatch, replacement);
        }

        // Replace ${input.xxx} with actual values
        while (result.contains("${input.")) {
            int start = result.indexOf("${input.");
            int end = result.indexOf("}", start);
            if (end == -1) break;

            String fullMatch = result.substring(start, end + 1);
            String path = result.substring(start + 8, end);

            JsonNode value = getJsonPath(input, path);
            String replacement = "";
            if (value != null) {
                // Use toString() for arrays/objects to get JSON, asText() for primitives
                if (value.isArray() || value.isObject()) {
                    replacement = value.toString();
                } else {
                    replacement = value.asText();
                }
            }

            result = result.replace(fullMatch, replacement);
        }

        return result;
    }

    private JsonNode getJsonPath(JsonNode root, String path) {
        if (root == null || path == null) {
            return null;
        }

        String[] parts = path.split("\\.");
        JsonNode current = root;

        for (String part : parts) {
            if (current == null) {
                return null;
            }
            current = current.get(part);
        }

        return current;
    }

    /**
     * Set the revision snapshot for versioned execution.
     * This builds a lookup map for quick node access.
     */
    public void setRevisionSnapshot(RevisionSnapshotDTO snapshot) {
        this.revisionSnapshot = snapshot;
        this.snapshotNodeMap = new HashMap<>();
        if (snapshot != null && snapshot.getNodes() != null) {
            for (WorkflowNodeVersionDTO nodeVersion : snapshot.getNodes()) {
                snapshotNodeMap.put(nodeVersion.getNodeId(), nodeVersion);
            }
        }
    }

    /**
     * Check if this execution is using a revision snapshot.
     */
    public boolean isRevisionExecution() {
        return revisionSnapshot != null;
    }

    /**
     * Get the node configuration, preferring snapshot version if available.
     */
    public String getNodeConfiguration(UUID nodeId, String fallbackConfiguration) {
        if (snapshotNodeMap != null && snapshotNodeMap.containsKey(nodeId)) {
            return snapshotNodeMap.get(nodeId).getConfiguration();
        }
        return fallbackConfiguration;
    }

    /**
     * Get the node version DTO from snapshot if available.
     */
    public WorkflowNodeVersionDTO getSnapshotNode(UUID nodeId) {
        return snapshotNodeMap != null ? snapshotNodeMap.get(nodeId) : null;
    }
}
