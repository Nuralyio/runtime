package com.nuraly.workflows.triggers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Health status of a trigger connection.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthStatus {

    public enum Status {
        HEALTHY,
        DEGRADED,
        UNHEALTHY,
        UNKNOWN
    }

    private Status status;
    private String message;
    private Instant checkedAt;
    private Long latencyMs;
    private Long messagesPerMinute;

    public static HealthStatus healthy() {
        return new HealthStatus(Status.HEALTHY, "Connection is healthy", Instant.now(), null, null);
    }

    public static HealthStatus healthy(String message) {
        return new HealthStatus(Status.HEALTHY, message, Instant.now(), null, null);
    }

    public static HealthStatus healthy(String message, long latencyMs) {
        return new HealthStatus(Status.HEALTHY, message, Instant.now(), latencyMs, null);
    }

    public static HealthStatus degraded(String message) {
        return new HealthStatus(Status.DEGRADED, message, Instant.now(), null, null);
    }

    public static HealthStatus unhealthy(String message) {
        return new HealthStatus(Status.UNHEALTHY, message, Instant.now(), null, null);
    }

    public static HealthStatus unknown() {
        return new HealthStatus(Status.UNKNOWN, "Health check not performed", Instant.now(), null, null);
    }
}
