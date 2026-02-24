package com.nuraly.journal.dto;

import jakarta.ws.rs.QueryParam;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

/**
 * Query parameters for log search.
 */
@Data
public class LogQueryParams {

    @QueryParam("service")
    private String service;

    @QueryParam("type")
    private String type;

    @QueryParam("level")
    private String level;

    @QueryParam("correlationId")
    private UUID correlationId;

    @QueryParam("from")
    private Instant from;

    @QueryParam("to")
    private Instant to;

    @QueryParam("limit")
    private Integer limit = 100;

    @QueryParam("offset")
    private Integer offset = 0;

    /**
     * Search within JSONB data field (e.g., data.execution_id=abc-123)
     */
    @QueryParam("dataQuery")
    private String dataQuery;
}
