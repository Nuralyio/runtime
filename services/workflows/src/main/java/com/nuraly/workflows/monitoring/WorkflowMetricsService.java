package com.nuraly.workflows.monitoring;

import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.enums.ExecutionStatus;
import com.nuraly.workflows.http.HttpClientManager;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Centralized metrics service for workflow execution monitoring.
 * Exposes Prometheus metrics at /q/metrics endpoint.
 *
 * Key metrics:
 * - workflow_executions_total (counter): Total executions by status
 * - workflow_execution_duration (timer): Execution duration histogram
 * - workflow_executions_active (gauge): Currently running executions
 * - http_pool_* (gauge): HTTP connection pool statistics
 */
@ApplicationScoped
public class WorkflowMetricsService {

    private static final Logger LOG = Logger.getLogger(WorkflowMetricsService.class);

    @Inject
    MeterRegistry meterRegistry;

    @Inject
    HttpClientManager httpClientManager;

    private final AtomicLong activeExecutions = new AtomicLong(0);
    private final AtomicLong queuedExecutions = new AtomicLong(0);

    void onStart(@Observes StartupEvent ev) {
        registerGauges();
        LOG.info("Workflow metrics service initialized");
    }

    private void registerGauges() {
        // Active executions gauge
        Gauge.builder("workflow.executions.active", activeExecutions, AtomicLong::get)
                .description("Number of currently running workflow executions")
                .register(meterRegistry);

        // Queued executions gauge
        Gauge.builder("workflow.executions.queued", queuedExecutions, AtomicLong::get)
                .description("Number of queued workflow executions")
                .register(meterRegistry);

        // HTTP pool gauges
        Gauge.builder("http.pool.available", () -> httpClientManager.getPoolStats().available())
                .description("Available HTTP connections in pool")
                .register(meterRegistry);

        Gauge.builder("http.pool.leased", () -> httpClientManager.getPoolStats().leased())
                .description("Leased HTTP connections from pool")
                .register(meterRegistry);

        Gauge.builder("http.pool.pending", () -> httpClientManager.getPoolStats().pending())
                .description("Pending HTTP connection requests")
                .register(meterRegistry);

        Gauge.builder("http.pool.max", () -> httpClientManager.getPoolStats().max())
                .description("Maximum HTTP connections in pool")
                .register(meterRegistry);

        // Database execution counts (sampled periodically)
        Gauge.builder("workflow.executions.db.running", this::countRunningExecutions)
                .description("Running executions in database")
                .register(meterRegistry);

        Gauge.builder("workflow.executions.db.pending", this::countPendingExecutions)
                .description("Pending executions in database")
                .register(meterRegistry);
    }

    /**
     * Record execution start - call when execution begins.
     */
    public void recordExecutionStart() {
        activeExecutions.incrementAndGet();
        meterRegistry.counter("workflow.executions.started.total").increment();
    }

    /**
     * Record execution completion - call when execution finishes.
     */
    public void recordExecutionComplete(ExecutionStatus status, long durationMs) {
        activeExecutions.decrementAndGet();

        // Record by status
        meterRegistry.counter("workflow.executions.completed.total",
                "status", status.name()).increment();

        // Record duration
        meterRegistry.timer("workflow.execution.duration",
                "status", status.name()).record(Duration.ofMillis(durationMs));
    }

    /**
     * Record execution queued.
     */
    public void recordExecutionQueued() {
        queuedExecutions.incrementAndGet();
        meterRegistry.counter("workflow.executions.queued.total").increment();
    }

    /**
     * Record execution dequeued (picked up by consumer).
     */
    public void recordExecutionDequeued() {
        queuedExecutions.decrementAndGet();
    }

    /**
     * Record node execution.
     */
    public void recordNodeExecution(String nodeType, boolean success, long durationMs) {
        meterRegistry.counter("workflow.node.executions.total",
                "type", nodeType,
                "status", success ? "success" : "failure").increment();

        meterRegistry.timer("workflow.node.execution.duration",
                "type", nodeType).record(Duration.ofMillis(durationMs));
    }

    /**
     * Get current active execution count.
     */
    public long getActiveExecutionCount() {
        return activeExecutions.get();
    }

    /**
     * Get HTTP pool statistics.
     */
    public HttpClientManager.PoolStats getHttpPoolStats() {
        return httpClientManager.getPoolStats();
    }

    private long countRunningExecutions() {
        try {
            return WorkflowExecutionEntity.count("status", ExecutionStatus.RUNNING);
        } catch (Exception e) {
            return -1;
        }
    }

    private long countPendingExecutions() {
        try {
            return WorkflowExecutionEntity.count("status in ?1",
                    java.util.List.of(ExecutionStatus.PENDING, ExecutionStatus.QUEUED));
        } catch (Exception e) {
            return -1;
        }
    }
}
