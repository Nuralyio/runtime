package com.nuraly.journal.repository;

import com.nuraly.journal.dto.LogQueryParams;
import com.nuraly.journal.entity.LogEntry;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Repository for log entry queries with dynamic filtering.
 */
@ApplicationScoped
public class LogRepository implements PanacheRepositoryBase<LogEntry, UUID> {

    /**
     * Find logs with dynamic query parameters.
     */
    public List<LogEntry> findWithParams(LogQueryParams params) {
        StringBuilder query = new StringBuilder();
        Parameters parameters = new Parameters();
        List<String> conditions = new ArrayList<>();

        if (params.getService() != null && !params.getService().isBlank()) {
            conditions.add("service = :service");
            parameters.and("service", params.getService());
        }

        if (params.getType() != null && !params.getType().isBlank()) {
            // Support comma-separated types
            String[] types = params.getType().split(",");
            if (types.length == 1) {
                conditions.add("type = :type");
                parameters.and("type", params.getType());
            } else {
                conditions.add("type IN :types");
                parameters.and("types", List.of(types));
            }
        }

        if (params.getLevel() != null && !params.getLevel().isBlank()) {
            conditions.add("level = :level");
            parameters.and("level", params.getLevel());
        }

        if (params.getCorrelationId() != null) {
            conditions.add("correlationId = :correlationId");
            parameters.and("correlationId", params.getCorrelationId());
        }

        if (params.getFrom() != null) {
            conditions.add("timestamp >= :from");
            parameters.and("from", params.getFrom());
        }

        if (params.getTo() != null) {
            conditions.add("timestamp <= :to");
            parameters.and("to", params.getTo());
        }

        if (!conditions.isEmpty()) {
            query.append(String.join(" AND ", conditions));
        }

        String queryString = query.toString();
        int limit = params.getLimit() != null ? params.getLimit() : 100;
        int offset = params.getOffset() != null ? params.getOffset() : 0;

        if (queryString.isEmpty()) {
            return find("ORDER BY timestamp DESC")
                    .page(offset / limit, limit)
                    .list();
        }

        return find(queryString, Sort.descending("timestamp"), parameters)
                .page(offset / limit, limit)
                .list();
    }

    /**
     * Find all logs for a specific execution ID.
     */
    public List<LogEntry> findByExecutionId(String executionId) {
        return find("data->>'execution_id' = ?1 ORDER BY timestamp ASC", executionId).list();
    }

    /**
     * Find all logs for a specific workflow ID.
     */
    public List<LogEntry> findByWorkflowId(String workflowId) {
        return find("data->>'workflow_id' = ?1 ORDER BY timestamp DESC", workflowId).list();
    }

    /**
     * Find logs by correlation ID.
     */
    public List<LogEntry> findByCorrelationId(UUID correlationId) {
        return find("correlationId = ?1 ORDER BY timestamp ASC", correlationId).list();
    }

    /**
     * Count logs by service.
     */
    public long countByService(String service) {
        return count("service", service);
    }

    /**
     * Count logs by type.
     */
    public long countByType(String type) {
        return count("type", type);
    }

    /**
     * Delete logs older than specified timestamp (for retention).
     */
    public long deleteOlderThan(java.time.Instant before) {
        return delete("timestamp < ?1", before);
    }
}
