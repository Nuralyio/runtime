package com.nuraly.journal.dto;

import lombok.Data;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Data Transfer Object for log entries.
 */
@Data
public class LogEntryDTO {
    private UUID id;
    private Instant timestamp;
    private String service;
    private String type;
    private String level;
    private UUID correlationId;
    private Map<String, Object> data;
    private Instant createdAt;
}
