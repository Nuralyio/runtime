package com.nuraly.workflows.dto;

import com.nuraly.workflows.entity.enums.NodeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNodeDTO {
    private UUID id;
    private UUID workflowId;
    private String name;
    private NodeType type;
    private String configuration;
    private Integer positionX;
    private Integer positionY;
    private Integer maxRetries;
    private Integer retryDelayMs;
    private Integer timeoutMs;
    private Instant createdAt;
    private Instant updatedAt;
}
