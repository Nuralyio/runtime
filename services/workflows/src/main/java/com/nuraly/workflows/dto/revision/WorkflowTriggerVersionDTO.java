package com.nuraly.workflows.dto.revision;

import com.nuraly.workflows.entity.enums.TriggerType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowTriggerVersionDTO {
    private UUID id;
    private UUID triggerId;
    private UUID workflowId;
    private Integer version;
    private String name;
    private TriggerType type;
    private String configuration;
    private boolean enabled;
    private String webhookToken;
    private String createdBy;
    private Instant createdAt;
}
