package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDTO {
    private UUID id;
    private String name;
    private String description;
    private String applicationId;
    private String createdBy;
    private WorkflowStatus status;
    private String version;
    private String variables;
    private List<WorkflowNodeDTO> nodes;
    private List<WorkflowEdgeDTO> edges;
    private List<WorkflowTriggerDTO> triggers;
    private Instant createdAt;
    private Instant updatedAt;
}
