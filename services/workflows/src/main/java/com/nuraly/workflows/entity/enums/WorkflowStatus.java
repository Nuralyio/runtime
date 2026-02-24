package com.nuraly.workflows.entity.enums;

public enum WorkflowStatus {
    DRAFT,      // Being designed, cannot be executed
    ACTIVE,     // Ready for execution
    PAUSED,     // Temporarily disabled
    ARCHIVED    // Soft deleted
}
