package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowPublishedVersionDTO {
    private UUID id;
    private UUID workflowId;
    private Integer revision;
    private String publishedBy;
    private Instant publishedAt;
}
