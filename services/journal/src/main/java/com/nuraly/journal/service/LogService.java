package com.nuraly.journal.service;

import com.nuraly.journal.dto.BatchLogRequest;
import com.nuraly.journal.dto.LogEntryDTO;
import com.nuraly.journal.dto.LogQueryParams;
import com.nuraly.journal.dto.LogRequest;
import com.nuraly.journal.dto.mapper.LogEntryMapper;
import com.nuraly.journal.entity.LogEntry;
import com.nuraly.journal.repository.LogRepository;
import com.nuraly.journal.websocket.LogStreamSocket;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

/**
 * Service layer for log operations.
 */
@ApplicationScoped
@Transactional
public class LogService {

    private static final Logger LOGGER = Logger.getLogger(LogService.class.getName());

    @Inject
    LogRepository logRepository;

    @Inject
    LogEntryMapper logEntryMapper;

    @Inject
    LogStreamSocket logStreamSocket;

    /**
     * Create a single log entry.
     */
    public LogEntryDTO createLog(LogRequest request) {
        LogEntry entity = logEntryMapper.toEntity(request);

        if (entity.getTimestamp() == null) {
            entity.setTimestamp(Instant.now());
        }

        logRepository.persist(entity);

        LogEntryDTO dto = logEntryMapper.toDTO(entity);

        // Broadcast to WebSocket subscribers
        logStreamSocket.broadcast(dto);

        LOGGER.fine("Created log entry: " + entity.getId() + " [" + entity.getService() + "/" + entity.getType() + "]");

        return dto;
    }

    /**
     * Create multiple log entries in batch.
     */
    public List<LogEntryDTO> createLogs(BatchLogRequest request) {
        List<LogEntry> entities = request.getLogs().stream()
                .map(logEntryMapper::toEntity)
                .peek(entity -> {
                    if (entity.getTimestamp() == null) {
                        entity.setTimestamp(Instant.now());
                    }
                })
                .toList();

        logRepository.persist(entities);

        List<LogEntryDTO> dtos = logEntryMapper.toDTOList(entities);

        // Broadcast each to WebSocket subscribers
        dtos.forEach(logStreamSocket::broadcast);

        LOGGER.fine("Created " + entities.size() + " log entries in batch");

        return dtos;
    }

    /**
     * Query logs with filters.
     */
    public List<LogEntryDTO> queryLogs(LogQueryParams params) {
        List<LogEntry> entities = logRepository.findWithParams(params);
        return logEntryMapper.toDTOList(entities);
    }

    /**
     * Get all logs for an execution (workflow + nodes).
     */
    public List<LogEntryDTO> getExecutionLogs(String executionId) {
        List<LogEntry> entities = logRepository.findByExecutionId(executionId);
        return logEntryMapper.toDTOList(entities);
    }

    /**
     * Get logs by correlation ID (trace across services).
     */
    public List<LogEntryDTO> getLogsByCorrelationId(UUID correlationId) {
        List<LogEntry> entities = logRepository.findByCorrelationId(correlationId);
        return logEntryMapper.toDTOList(entities);
    }

    /**
     * Get a single log entry by ID.
     */
    public LogEntryDTO getLogById(UUID id) {
        LogEntry entity = logRepository.findById(id);
        if (entity == null) {
            return null;
        }
        return logEntryMapper.toDTO(entity);
    }

    /**
     * Delete logs older than specified days (retention policy).
     */
    public long applyRetention(int retentionDays) {
        Instant cutoff = Instant.now().minusSeconds(retentionDays * 24L * 60 * 60);
        long deleted = logRepository.deleteOlderThan(cutoff);
        LOGGER.info("Retention policy applied: deleted " + deleted + " logs older than " + retentionDays + " days");
        return deleted;
    }

    /**
     * Get log statistics.
     */
    public LogStats getStats() {
        LogStats stats = new LogStats();
        stats.totalLogs = logRepository.count();
        stats.errorCount = logRepository.count("level", "ERROR");
        stats.warnCount = logRepository.count("level", "WARN");
        return stats;
    }

    public static class LogStats {
        public long totalLogs;
        public long errorCount;
        public long warnCount;
    }
}
