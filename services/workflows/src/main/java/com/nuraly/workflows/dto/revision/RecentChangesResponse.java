package com.nuraly.workflows.dto.revision;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentChangesResponse {
    private List<ChangeEntry> changes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangeEntry {
        private String entityType;  // "workflow", "node", "edge", "trigger"
        private UUID entityId;
        private Integer version;
        private String createdBy;
        private Instant createdAt;
    }
}
