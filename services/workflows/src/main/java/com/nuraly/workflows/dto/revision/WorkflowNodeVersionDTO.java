package com.nuraly.workflows.dto.revision;

import com.nuraly.workflows.entity.enums.NodeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowNodeVersionDTO {
    private UUID id;
    private UUID nodeId;
    private UUID workflowId;
    private Integer version;
    private String name;
    private NodeType type;
    private String configuration;
    private String ports;
    private Integer positionX;
    private Integer positionY;
    private Integer maxRetries;
    private Integer retryDelayMs;
    private Integer timeoutMs;
    private String createdBy;
    private Instant createdAt;
}
