package com.nuraly.whiteboard.collaboration;

import lombok.Data;

import java.time.Instant;

/**
 * Represents an operation on the whiteboard canvas.
 * Used for Operational Transformation (OT) conflict resolution.
 */
@Data
public class Operation {

    public String id;
    public OperationType type;
    public String elementId;
    public Object data;
    public String userId;
    public Instant timestamp;
    public long version;

    public enum OperationType {
        ADD,           // Add new element
        UPDATE,        // Update element properties
        DELETE,        // Delete element (soft delete)
        MOVE,          // Move element position
        RESIZE,        // Resize element
        UPDATE_TEXT,   // Update text content
        ADD_CONNECTOR, // Add connector
        DELETE_CONNECTOR // Delete connector
    }

    /**
     * Check if this operation conflicts with another.
     */
    public boolean conflictsWith(Operation other) {
        if (this.elementId == null || other.elementId == null) {
            return false;
        }
        return this.elementId.equals(other.elementId);
    }
}
