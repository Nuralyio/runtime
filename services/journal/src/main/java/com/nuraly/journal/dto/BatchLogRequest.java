package com.nuraly.journal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * Request object for batch log ingestion.
 */
@Data
public class BatchLogRequest {

    @NotEmpty(message = "At least one log entry is required")
    @Valid
    private List<LogRequest> logs;
}
