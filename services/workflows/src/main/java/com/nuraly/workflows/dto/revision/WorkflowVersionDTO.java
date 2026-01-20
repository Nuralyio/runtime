package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowVersionDTO {
    private UUID id;
    private UUID workflowId;
    private Integer version;
    private String name;
    private String description;
    private String applicationId;
    private String variables;
    private String viewport;
    private String createdBy;
    private Instant createdAt;
}
