package com.nuraly.workflows.entity.enums;

public enum ExecutionStatus {
    PENDING,    // Queued for execution
    RUNNING,    // Currently executing
    COMPLETED,  // Successfully completed
    FAILED,     // Failed with error
    CANCELLED,  // Cancelled by user
    PAUSED,     // Paused (for long-running workflows)
    WAITING     // Waiting for external event/delay
}
