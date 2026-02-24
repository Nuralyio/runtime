package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.ConnectionState;
import com.nuraly.workflows.entity.enums.TriggerType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Information about a trigger resource and its ownership.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TriggerResourceDTO {

    private String resourceKey;
    private TriggerType type;
    private UUID activeTriggerId;
    private String activeTriggerName;
    private UUID workflowId;
    private String workflowName;
    private String ownerInstance;
    private ConnectionState state;
    private Instant leaseExpiresAt;
    private Instant lastHeartbeat;

    // Dev mode info
    private UUID priorityTriggerId;
    private Instant priorityExpiresAt;

    // Statistics
    private Long messagesReceived;
    private Instant lastMessageAt;
}
