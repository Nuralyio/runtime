package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowRevisionDTO {
    private UUID id;
    private UUID workflowId;
    private Integer revision;
    private String versionLabel;
    private String description;
    private Integer workflowVersion;
    private String nodeRefs;
    private String edgeRefs;
    private String triggerRefs;
    private String createdBy;
    private Instant createdAt;
}
