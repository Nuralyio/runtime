package com.nuraly.workflows.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEdgeDTO {
    private UUID id;
    private UUID workflowId;
    private UUID sourceNodeId;
    private UUID targetNodeId;
    private String condition;
    private String label;
    private Integer priority;
}
