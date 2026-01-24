package com.nuraly.workflows.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Result of a dev mode request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DevModeResult {

    private UUID devTriggerId;
    private UUID pausedProductionTriggerId;
    private boolean success;
    private Instant expiresAt;
    private String message;
    private String failureReason;

    public static DevModeResult success(UUID devTriggerId, UUID prodTriggerId, Instant expiresAt) {
        DevModeResult result = new DevModeResult();
        result.devTriggerId = devTriggerId;
        result.pausedProductionTriggerId = prodTriggerId;
        result.success = true;
        result.expiresAt = expiresAt;
        result.message = "Dev mode enabled. Production trigger paused.";
        return result;
    }

    public static DevModeResult successNoProd(UUID devTriggerId, Instant expiresAt) {
        DevModeResult result = new DevModeResult();
        result.devTriggerId = devTriggerId;
        result.success = true;
        result.expiresAt = expiresAt;
        result.message = "Dev mode enabled. No production trigger to pause.";
        return result;
    }

    public static DevModeResult failure(UUID devTriggerId, String reason) {
        DevModeResult result = new DevModeResult();
        result.devTriggerId = devTriggerId;
        result.success = false;
        result.failureReason = reason;
        result.message = "Failed to enable dev mode: " + reason;
        return result;
    }
}
