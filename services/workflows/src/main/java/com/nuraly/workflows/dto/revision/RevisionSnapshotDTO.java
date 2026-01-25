package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevisionSnapshotDTO {
    private WorkflowRevisionDTO revision;
    private WorkflowVersionDTO workflow;
    private List<WorkflowNodeVersionDTO> nodes;
    private List<WorkflowEdgeVersionDTO> edges;
    private List<WorkflowTriggerVersionDTO> triggers;
}
