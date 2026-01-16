package com.nuraly.conduit.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Request for executing database operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryRequest {

    /** Operation type: QUERY, INSERT, UPDATE, DELETE */
    private String operation;

    /** Schema name (optional) */
    private String schema;

    /** Table name */
    private String table;

    /** Filter conditions (JSON structure) */
    private JsonNode filter;

    /** Fields for INSERT/UPDATE operations */
    private Map<String, Object> fields;

    /** Columns to select (for QUERY) */
    private List<String> select;

    /** Order by clauses */
    private List<SortOrder> orderBy;

    /** Limit rows */
    private Integer limit;

    /** Offset rows */
    private Integer offset;

    /**
     * Sort order specification.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SortOrder {
        private String field;
        private String dir; // ASC or DESC
    }
}
