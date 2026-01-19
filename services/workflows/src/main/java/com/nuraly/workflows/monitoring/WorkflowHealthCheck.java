package com.nuraly.workflows.monitoring;

import com.nuraly.workflows.http.HttpClientManager;
import com.nuraly.workflows.messaging.RabbitMQConnectionManager;
import com.nuraly.workflows.redis.WorkflowCacheService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Liveness;
import org.eclipse.microprofile.health.Readiness;

/**
 * Health checks for workflow service.
 * Exposed at /q/health/live and /q/health/ready endpoints.
 */
@ApplicationScoped
public class WorkflowHealthCheck {

    @Inject
    HttpClientManager httpClientManager;

    @Inject
    RabbitMQConnectionManager rabbitMQConnectionManager;

    @Inject
    WorkflowMetricsService metricsService;

    /**
     * Liveness check - is the service alive?
     * Returns UP if basic components are functioning.
     */
    @Liveness
    @ApplicationScoped
    public static class LivenessCheck implements HealthCheck {
        @Override
        public HealthCheckResponse call() {
            return HealthCheckResponse.up("workflow-service-live");
        }
    }

    /**
     * Readiness check - is the service ready to accept traffic?
     * Checks HTTP pool, RabbitMQ connection, Redis (optional), and system resources.
     */
    @Readiness
    @ApplicationScoped
    public static class ReadinessCheck implements HealthCheck {

        @Inject
        HttpClientManager httpClientManager;

        @Inject
        RabbitMQConnectionManager rabbitMQConnectionManager;

        @Inject
        WorkflowCacheService workflowCacheService;

        @Override
        public HealthCheckResponse call() {
            HealthCheckResponseBuilder builder = HealthCheckResponse.named("workflow-service-ready");

            boolean isReady = true;

            // Check HTTP pool
            try {
                var poolStats = httpClientManager.getPoolStats();
                builder.withData("http.pool.available", poolStats.available());
                builder.withData("http.pool.leased", poolStats.leased());
                builder.withData("http.pool.max", poolStats.max());

                // Warning if pool is nearly exhausted
                if (poolStats.available() == 0 && poolStats.leased() >= poolStats.max() * 0.9) {
                    builder.withData("http.pool.warning", "Pool near exhaustion");
                }
            } catch (Exception e) {
                builder.withData("http.pool.error", e.getMessage());
                isReady = false;
            }

            // Check RabbitMQ connection
            try {
                boolean rabbitConnected = rabbitMQConnectionManager.isConnected();
                builder.withData("rabbitmq.connected", rabbitConnected);
                if (!rabbitConnected) {
                    isReady = false;
                }
            } catch (Exception e) {
                builder.withData("rabbitmq.error", e.getMessage());
                isReady = false;
            }

            // Check Redis connection (optional - doesn't affect readiness)
            try {
                boolean redisAvailable = workflowCacheService.isAvailable();
                builder.withData("redis.available", redisAvailable);
                if (!redisAvailable) {
                    builder.withData("redis.note", "Redis unavailable - running in degraded mode (no caching/checkpoints)");
                }
            } catch (Exception e) {
                builder.withData("redis.available", false);
                builder.withData("redis.note", "Redis unavailable - running in degraded mode");
            }

            // Check memory usage
            Runtime runtime = Runtime.getRuntime();
            long maxMemory = runtime.maxMemory();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            double memoryUsagePercent = (double) usedMemory / maxMemory * 100;

            builder.withData("memory.used.mb", usedMemory / 1024 / 1024);
            builder.withData("memory.max.mb", maxMemory / 1024 / 1024);
            builder.withData("memory.usage.percent", String.format("%.1f", memoryUsagePercent));

            // Warning if memory is high
            if (memoryUsagePercent > 90) {
                builder.withData("memory.warning", "High memory usage");
            }

            return isReady ? builder.up().build() : builder.down().build();
        }
    }
}
