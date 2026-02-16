package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of a DDL execution.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DdlResult {

    /** Whether all statements executed successfully */
    private boolean success;

    /** Error message if failed */
    private String error;

    /** Number of statements successfully executed */
    private int statementsExecuted;

    /** Total execution time in milliseconds */
    private long executionTimeMs;

    public static DdlResult success(int statementsExecuted, long executionTimeMs) {
        return DdlResult.builder()
                .success(true)
                .statementsExecuted(statementsExecuted)
                .executionTimeMs(executionTimeMs)
                .build();
    }

    public static DdlResult failure(String error) {
        return DdlResult.builder()
                .success(false)
                .error(error)
                .build();
    }
}
