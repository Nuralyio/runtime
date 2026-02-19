package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Represents a tool definition that can be used by the LLM.
 * In this context, tools are workflow nodes that can be executed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolDefinition {

    /**
     * Unique name for the tool (derived from node name)
     */
    private String name;

    /**
     * Description of what the tool does
     */
    private String description;

    /**
     * JSON Schema defining the parameters the tool accepts
     */
    private JsonNode parameters;

    /**
     * The workflow node ID that this tool maps to
     */
    private UUID nodeId;

    /**
     * The port ID on the LLM node that connects to this tool
     */
    private String sourcePortId;

    /**
     * Whether this tool is provided by an MCP server connection.
     * MCP tools are routed through McpConnection.callTool() instead of executing a workflow node.
     */
    private boolean mcpTool;
}
