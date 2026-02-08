package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.ConnectionState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Result of a trigger activation request.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriggerActivationResult {

    private UUID triggerId;
    private boolean success;
    private ConnectionState connectionState;
    private String ownerInstance;
    private String message;
    private String failureReason;

    public static TriggerActivationResult success(UUID triggerId, String ownerInstance) {
        TriggerActivationResult result = new TriggerActivationResult();
        result.triggerId = triggerId;
        result.success = true;
        result.connectionState = ConnectionState.CONNECTED;
        result.ownerInstance = ownerInstance;
        result.message = "Trigger activated successfully";
        return result;
    }

    public static TriggerActivationResult connecting(UUID triggerId, String ownerInstance) {
        TriggerActivationResult result = new TriggerActivationResult();
        result.triggerId = triggerId;
        result.success = true;
        result.connectionState = ConnectionState.CONNECTING;
        result.ownerInstance = ownerInstance;
        result.message = "Trigger is connecting";
        return result;
    }

    public static TriggerActivationResult failure(UUID triggerId, String reason) {
        TriggerActivationResult result = new TriggerActivationResult();
        result.triggerId = triggerId;
        result.success = false;
        result.connectionState = ConnectionState.DISCONNECTED;
        result.failureReason = reason;
        result.message = "Failed to activate trigger: " + reason;
        return result;
    }

    public static TriggerActivationResult resourceBusy(UUID triggerId, String ownerInstance) {
        TriggerActivationResult result = new TriggerActivationResult();
        result.triggerId = triggerId;
        result.success = false;
        result.connectionState = ConnectionState.DISCONNECTED;
        result.ownerInstance = ownerInstance;
        result.failureReason = "Resource is currently in use by another trigger";
        result.message = "Resource busy - owned by instance: " + ownerInstance;
        return result;
    }
}
