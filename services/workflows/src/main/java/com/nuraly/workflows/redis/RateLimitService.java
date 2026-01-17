package com.nuraly.workflows.redis;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/**
 * Redis-based distributed rate limiting service.
 * Uses sliding window counter pattern for accurate rate limiting across all workers.
 *
 * Rate limit keys:
 * - ratelimit:user:{userId}:executions - Per-user execution limit
 * - ratelimit:workflow:{workflowId}:executions - Per-workflow execution limit
 * - ratelimit:global:executions - Global execution limit
 */
@ApplicationScoped
public class RateLimitService {

    private static final Logger LOG = Logger.getLogger(RateLimitService.class);
    private static final String RATE_LIMIT_PREFIX = "ratelimit:";

    private final ValueCommands<String, Long> valueCommands;
    private final KeyCommands<String> keyCommands;

    @Inject
    public RateLimitService(RedisDataSource redisDataSource) {
        this.valueCommands = redisDataSource.value(String.class, Long.class);
        this.keyCommands = redisDataSource.key(String.class);
    }

    /**
     * Check if action is allowed under rate limit.
     * Increments counter and returns true if under limit.
     *
     * @param key Rate limit key (e.g., "user:123:executions")
     * @param limit Maximum allowed requests
     * @param windowSeconds Time window in seconds
     * @return true if allowed, false if rate limited
     */
    public boolean tryAcquire(String key, int limit, int windowSeconds) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        try {
            // Increment counter
            Long count = valueCommands.incr(redisKey);

            // Set expiration on first request in window
            if (count == 1) {
                keyCommands.expire(redisKey, windowSeconds);
            }

            boolean allowed = count <= limit;
            if (!allowed) {
                LOG.debugf("Rate limit exceeded for %s: %d/%d", key, count, limit);
            }
            return allowed;
        } catch (Exception e) {
            LOG.warnf("Error checking rate limit for %s: %s", key, e.getMessage());
            // Fail open - allow request if Redis is unavailable
            return true;
        }
    }

    /**
     * Check user execution rate limit.
     * Default: 100 executions per minute per user.
     */
    public boolean checkUserExecutionLimit(String userId) {
        return tryAcquire("user:" + userId + ":executions", 100, 60);
    }

    /**
     * Check user execution rate limit with custom values.
     */
    public boolean checkUserExecutionLimit(String userId, int limit, int windowSeconds) {
        return tryAcquire("user:" + userId + ":executions", limit, windowSeconds);
    }

    /**
     * Check workflow execution rate limit.
     * Default: 50 executions per minute per workflow.
     */
    public boolean checkWorkflowExecutionLimit(String workflowId) {
        return tryAcquire("workflow:" + workflowId + ":executions", 50, 60);
    }

    /**
     * Check workflow execution rate limit with custom values.
     */
    public boolean checkWorkflowExecutionLimit(String workflowId, int limit, int windowSeconds) {
        return tryAcquire("workflow:" + workflowId + ":executions", limit, windowSeconds);
    }

    /**
     * Check global execution rate limit.
     * Default: 1000 executions per minute globally.
     */
    public boolean checkGlobalExecutionLimit() {
        return tryAcquire("global:executions", 1000, 60);
    }

    /**
     * Check global execution rate limit with custom values.
     */
    public boolean checkGlobalExecutionLimit(int limit, int windowSeconds) {
        return tryAcquire("global:executions", limit, windowSeconds);
    }

    /**
     * Check webhook trigger rate limit.
     * Default: 100 triggers per minute per webhook.
     */
    public boolean checkWebhookTriggerLimit(String webhookId) {
        return tryAcquire("webhook:" + webhookId + ":triggers", 100, 60);
    }

    /**
     * Get current count for a rate limit key.
     */
    public long getCurrentCount(String key) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        try {
            Long count = valueCommands.get(redisKey);
            return count != null ? count : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get remaining quota for a rate limit.
     */
    public long getRemainingQuota(String key, int limit) {
        long current = getCurrentCount(key);
        return Math.max(0, limit - current);
    }

    /**
     * Reset rate limit counter (for testing or admin purposes).
     */
    public void resetLimit(String key) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        try {
            keyCommands.del(redisKey);
            LOG.debugf("Reset rate limit: %s", key);
        } catch (Exception e) {
            LOG.warnf("Error resetting rate limit: %s", e.getMessage());
        }
    }
}
