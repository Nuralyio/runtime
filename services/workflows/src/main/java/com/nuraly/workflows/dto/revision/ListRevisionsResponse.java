package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListRevisionsResponse {
    private List<WorkflowRevisionDTO> revisions;
    private int page;
    private int limit;
    private long total;
    private int totalPages;
}
