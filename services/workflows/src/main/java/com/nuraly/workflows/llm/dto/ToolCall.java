package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a tool call requested by the LLM.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolCall {

    /**
     * Unique ID for this tool call (used to match results)
     */
    private String id;

    /**
     * Name of the tool to call
     */
    private String name;

    /**
     * Arguments to pass to the tool (parsed from JSON)
     */
    private JsonNode arguments;
}
