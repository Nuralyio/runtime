package com.nuraly.journal.api.rest;

import com.nuraly.journal.dto.*;
import com.nuraly.journal.service.LogService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.List;
import java.util.UUID;

/**
 * REST API for log ingestion and querying.
 */
@Path("/api/v1/logs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LogResource {

    @Inject
    LogService logService;

    /**
     * Ingest a single log entry.
     */
    @POST
    @Transactional
    public RestResponse<LogEntryDTO> createLog(@Valid LogRequest request) {
        LogEntryDTO created = logService.createLog(request);
        return RestResponse.status(RestResponse.Status.CREATED, created);
    }

    /**
     * Ingest multiple log entries in batch.
     */
    @POST
    @Path("/batch")
    @Transactional
    public RestResponse<List<LogEntryDTO>> createLogs(@Valid BatchLogRequest request) {
        List<LogEntryDTO> created = logService.createLogs(request);
        return RestResponse.status(RestResponse.Status.CREATED, created);
    }

    /**
     * Query logs with filters.
     *
     * Supports:
     * - service: Filter by service name
     * - type: Filter by log type (comma-separated for multiple)
     * - level: Filter by log level
     * - correlationId: Filter by correlation ID
     * - from: Start timestamp (ISO-8601)
     * - to: End timestamp (ISO-8601)
     * - limit: Max results (default 100)
     * - offset: Pagination offset
     */
    @GET
    public RestResponse<List<LogEntryDTO>> queryLogs(@BeanParam LogQueryParams params) {
        List<LogEntryDTO> logs = logService.queryLogs(params);
        return RestResponse.ok(logs);
    }

    /**
     * Get a single log entry by ID.
     */
    @GET
    @Path("/{id}")
    public RestResponse<LogEntryDTO> getLogById(@PathParam("id") UUID id) {
        LogEntryDTO log = logService.getLogById(id);
        if (log == null) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
        return RestResponse.ok(log);
    }

    /**
     * Get all logs for a workflow execution.
     * Returns execution log + all node execution logs.
     */
    @GET
    @Path("/execution/{executionId}")
    public RestResponse<List<LogEntryDTO>> getExecutionLogs(@PathParam("executionId") String executionId) {
        List<LogEntryDTO> logs = logService.getExecutionLogs(executionId);
        return RestResponse.ok(logs);
    }

    /**
     * Get all logs by correlation ID (trace across services).
     */
    @GET
    @Path("/trace/{correlationId}")
    public RestResponse<List<LogEntryDTO>> getLogsByCorrelationId(@PathParam("correlationId") UUID correlationId) {
        List<LogEntryDTO> logs = logService.getLogsByCorrelationId(correlationId);
        return RestResponse.ok(logs);
    }

    /**
     * Get log statistics.
     */
    @GET
    @Path("/stats")
    public RestResponse<LogService.LogStats> getStats() {
        LogService.LogStats stats = logService.getStats();
        return RestResponse.ok(stats);
    }

    /**
     * Apply retention policy - delete logs older than specified days.
     */
    @DELETE
    @Path("/retention")
    @Transactional
    public RestResponse<RetentionResult> applyRetention(@QueryParam("days") @DefaultValue("30") int days) {
        long deleted = logService.applyRetention(days);
        RetentionResult result = new RetentionResult();
        result.deletedCount = deleted;
        result.retentionDays = days;
        return RestResponse.ok(result);
    }

    public static class RetentionResult {
        public long deletedCount;
        public int retentionDays;
    }
}
