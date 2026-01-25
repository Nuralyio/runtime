package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublishCurrentResponse {
    private WorkflowRevisionDTO revision;
    private WorkflowPublishedVersionDTO publishedVersion;
}
