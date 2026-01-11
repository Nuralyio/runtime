package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowExecutionDTO {
    private UUID id;
    private UUID workflowId;
    private String workflowName;
    private ExecutionStatus status;
    private String inputData;
    private String outputData;
    private String variables;
    private String errorMessage;
    private String triggeredBy;
    private String triggerType;
    private List<NodeExecutionDTO> nodeExecutions;
    private Instant startedAt;
    private Instant completedAt;
    private Long durationMs;
}
