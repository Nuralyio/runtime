package com.nuraly.workflows.entity.enums;

/**
 * Represents the connection state of a persistent trigger.
 */
public enum ConnectionState {
    DISCONNECTED,      // Not connected
    CONNECTING,        // Attempting to connect
    CONNECTED,         // Active and receiving messages
    PAUSED,            // Intentionally paused (dev mode, manual pause)
    HANDOFF_PENDING,   // Transferring ownership to another trigger
    ERROR              // Connection error, will retry
}
