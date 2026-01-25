package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Result of a database operation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryResult {

    /** Result rows (for QUERY operation) */
    private List<Map<String, Object>> rows;

    /** Row count returned in this response */
    private int rowCount;

    /** Total matching rows in database (for paginated queries) */
    private Long totalCount;

    /** Rows affected (for INSERT/UPDATE/DELETE) */
    private int affectedRows;

    /** Generated keys (for INSERT with auto-increment) */
    private List<Object> generatedKeys;

    /** Execution time in milliseconds */
    private long executionTimeMs;

    /** Success status */
    private boolean success;

    /** Error message if failed */
    private String error;

    /**
     * Create a successful query result.
     */
    public static QueryResult success(List<Map<String, Object>> rows, long executionTimeMs) {
        return QueryResult.builder()
                .rows(rows)
                .rowCount(rows != null ? rows.size() : 0)
                .executionTimeMs(executionTimeMs)
                .success(true)
                .build();
    }

    /**
     * Create a successful paginated query result with total count.
     */
    public static QueryResult successPaginated(List<Map<String, Object>> rows, Long totalCount, long executionTimeMs) {
        return QueryResult.builder()
                .rows(rows)
                .rowCount(rows != null ? rows.size() : 0)
                .totalCount(totalCount)
                .executionTimeMs(executionTimeMs)
                .success(true)
                .build();
    }

    /**
     * Create a successful mutation result.
     */
    public static QueryResult successMutation(int affectedRows, List<Object> generatedKeys, long executionTimeMs) {
        return QueryResult.builder()
                .affectedRows(affectedRows)
                .generatedKeys(generatedKeys)
                .executionTimeMs(executionTimeMs)
                .success(true)
                .build();
    }

    /**
     * Create a failure result.
     */
    public static QueryResult failure(String error) {
        return QueryResult.builder()
                .success(false)
                .error(error)
                .build();
    }
}
