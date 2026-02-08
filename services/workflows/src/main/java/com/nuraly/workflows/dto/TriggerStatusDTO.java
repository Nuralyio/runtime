package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.ConnectionState;
import com.nuraly.workflows.entity.enums.TriggerDesiredState;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.triggers.HealthStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Status information for a trigger.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriggerStatusDTO {

    private UUID triggerId;
    private String name;
    private TriggerType type;
    private TriggerDesiredState desiredState;
    private ConnectionState connectionState;
    private String ownerInstance;
    private Instant lastHeartbeat;
    private Instant connectedSince;
    private Long messagesReceived;
    private Instant lastMessageAt;
    private String stateReason;
    private HealthStatus.Status health;
    private String healthMessage;

    // For dev mode
    private boolean inDevMode;
    private UUID devModeTriggerId;
    private Instant devModeExpiresAt;
}
