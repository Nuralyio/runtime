package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodeExecutionDTO {
    private UUID id;
    private UUID executionId;
    private UUID nodeId;
    private String nodeName;
    private ExecutionStatus status;
    private String inputData;
    private String outputData;
    private String errorMessage;
    private Integer attemptNumber;
    private Instant startedAt;
    private Instant completedAt;
    private Long durationMs;
}
