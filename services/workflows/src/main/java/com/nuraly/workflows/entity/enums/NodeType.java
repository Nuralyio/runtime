package com.nuraly.workflows.entity.enums;

public enum NodeType {
    START,          // Entry point
    END,            // Exit point
    FUNCTION,       // Invoke nuraly function
    HTTP,           // HTTP request
    CONDITION,      // If/else branching
    DELAY,          // Wait for duration
    PARALLEL,       // Execute branches in parallel
    LOOP,           // Iterate over array
    TRANSFORM,      // Data transformation (JSONata/JavaScript)
    SUB_WORKFLOW,   // Invoke another workflow
    EMAIL,          // Send email
    NOTIFICATION,   // Send notification
    DATABASE,       // Database operation
    VARIABLE        // Set/get variable
}
