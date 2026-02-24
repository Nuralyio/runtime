package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.TriggerType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTriggerDTO {
    private UUID id;
    private UUID workflowId;
    private String name;
    private TriggerType type;
    private String configuration;
    private boolean enabled;
    private String webhookToken;
    private String webhookUrl;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastTriggeredAt;
}
