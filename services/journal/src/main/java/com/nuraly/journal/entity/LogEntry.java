package com.nuraly.journal.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Schemaless log entry entity.
 * Stores all log types with flexible JSONB payload.
 */
@Entity
@Table(name = "logs", indexes = {
    @Index(name = "idx_logs_timestamp", columnList = "timestamp DESC"),
    @Index(name = "idx_logs_service", columnList = "service"),
    @Index(name = "idx_logs_type", columnList = "type"),
    @Index(name = "idx_logs_correlation_id", columnList = "correlation_id"),
    @Index(name = "idx_logs_level", columnList = "level")
})
@Getter
@Setter
public class LogEntry extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    /**
     * Source service name (e.g., workflows, functions, api, kv, gateway)
     */
    @Column(name = "service", nullable = false, length = 50)
    private String service;

    /**
     * Log type (e.g., execution, node, llm, http, error, audit, system)
     */
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    /**
     * Log level (DEBUG, INFO, WARN, ERROR)
     */
    @Column(name = "level", length = 10)
    private String level = "INFO";

    /**
     * Correlation ID for tracing requests across services
     */
    @Column(name = "correlation_id")
    private UUID correlationId;

    /**
     * Flexible JSONB payload - stores any structured data
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> data;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }
}
