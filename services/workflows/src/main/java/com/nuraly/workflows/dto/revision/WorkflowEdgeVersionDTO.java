package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEdgeVersionDTO {
    private UUID id;
    private UUID edgeId;
    private UUID workflowId;
    private Integer version;
    private UUID sourceNodeId;
    private String sourcePortId;
    private UUID targetNodeId;
    private String targetPortId;
    private String condition;
    private String label;
    private Integer priority;
    private String createdBy;
    private Instant createdAt;
}
