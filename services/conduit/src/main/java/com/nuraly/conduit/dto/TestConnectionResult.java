package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of a connection test.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestConnectionResult {

    /** Whether connection succeeded */
    private boolean success;

    /** Error message if failed */
    private String error;

    /** Database version info */
    private String databaseVersion;

    /** Connection latency in milliseconds */
    private long latencyMs;

    /**
     * Create a successful result.
     */
    public static TestConnectionResult success(String databaseVersion, long latencyMs) {
        return TestConnectionResult.builder()
                .success(true)
                .databaseVersion(databaseVersion)
                .latencyMs(latencyMs)
                .build();
    }

    /**
     * Create a failure result.
     */
    public static TestConnectionResult failure(String error) {
        return TestConnectionResult.builder()
                .success(false)
                .error(error)
                .build();
    }
}
