package com.nuraly.workflows.entity.enums;

/**
 * Represents the desired state of a trigger as configured by the user.
 */
public enum TriggerDesiredState {
    ACTIVE,    // Trigger should be running and accepting messages
    PAUSED,    // Trigger should be paused (keeps credential reservation)
    DISABLED   // Trigger fully disabled, releases all resources
}
