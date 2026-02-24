package com.nuraly.workflows.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteWorkflowRequest {
    private JsonNode input;
    private String variables;
    /**
     * Optional: Start execution from a specific node instead of all start nodes.
     * Used for testing individual workflow branches (e.g., Document Loader with test data).
     */
    private UUID startNodeId;
}
