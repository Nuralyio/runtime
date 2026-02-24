package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request for executing DDL (Data Definition Language) statements.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DdlRequest {

    /** DDL statements to execute */
    private List<String> statements;

    /** Whether to execute all statements in a single transaction (default true) */
    @Builder.Default
    private Boolean transactional = true;

    /** Schema/search_path to set before executing */
    private String schema;
}
