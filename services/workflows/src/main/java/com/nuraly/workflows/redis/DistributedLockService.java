package com.nuraly.workflows.redis;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.UUID;
import java.util.function.Supplier;

/**
 * Redis-based distributed lock service.
 * Prevents duplicate execution of scheduled triggers across multiple worker instances.
 *
 * GRACEFUL DEGRADATION: If Redis is unavailable, locks are not enforced
 * and duplicate executions may occur (original behavior before Redis).
 *
 * Uses Redis SETNX (SET if Not eXists) pattern for atomic lock acquisition.
 *
 * Lock keys:
 * - lock:trigger:{triggerId} - Scheduled trigger execution lock
 * - lock:execution:{executionId} - Execution processing lock
 * - lock:scheduler:{name} - Scheduler job lock
 */
@ApplicationScoped
public class DistributedLockService {

    private static final Logger LOG = Logger.getLogger(DistributedLockService.class);
    private static final String LOCK_KEY_PREFIX = "lock:";

    @Inject
    Instance<RedisDataSource> redisDataSourceInstance;

    private ValueCommands<String, String> valueCommands;
    private KeyCommands<String> keyCommands;
    private boolean redisAvailable = false;

    // Unique identifier for this worker instance
    private final String workerId = UUID.randomUUID().toString();

    @ConfigProperty(name = "redis.lock.ttl", defaultValue = "60")
    int lockTtlSeconds;

    @PostConstruct
    void init() {
        try {
            if (redisDataSourceInstance.isResolvable()) {
                RedisDataSource dataSource = redisDataSourceInstance.get();
                this.valueCommands = dataSource.value(String.class, String.class);
                this.keyCommands = dataSource.key(String.class);
                // Test connection
                keyCommands.exists("__ping__");
                redisAvailable = true;
                LOG.infof("Redis lock service initialized (workerId: %s)", workerId);
            } else {
                LOG.info("Redis not configured - distributed locking disabled");
            }
        } catch (Exception e) {
            LOG.warn("Redis unavailable - distributed locking disabled: " + e.getMessage());
            redisAvailable = false;
        }
    }

    /**
     * Check if Redis locking is available.
     */
    public boolean isAvailable() {
        return redisAvailable;
    }

    /**
     * Try to acquire a lock. Returns true if lock was acquired or Redis unavailable.
     */
    public boolean tryLock(String lockName) {
        return tryLock(lockName, lockTtlSeconds);
    }

    /**
     * Try to acquire a lock with custom TTL.
     * Returns true if lock acquired OR if Redis is unavailable (fail-open).
     */
    public boolean tryLock(String lockName, int ttlSeconds) {
        if (!redisAvailable) {
            // Fail open - allow operation if Redis unavailable
            return true;
        }

        String key = LOCK_KEY_PREFIX + lockName;
        try {
            // SETNX with expiration - atomic operation
            Boolean result = valueCommands.setnx(key, workerId);
            if (Boolean.TRUE.equals(result)) {
                // Lock acquired, set expiration
                keyCommands.expire(key, ttlSeconds);
                LOG.debugf("Acquired lock: %s (worker: %s, TTL: %ds)", lockName, workerId, ttlSeconds);
                return true;
            }
            LOG.debugf("Failed to acquire lock: %s (held by another worker)", lockName);
            return false;
        } catch (Exception e) {
            LOG.warnf("Error acquiring lock %s: %s", lockName, e.getMessage());
            checkRedisConnection();
            // Fail open on error
            return true;
        }
    }

    /**
     * Release a lock. Only releases if this worker owns the lock.
     */
    public void unlock(String lockName) {
        if (!redisAvailable) return;

        String key = LOCK_KEY_PREFIX + lockName;
        try {
            // Only delete if we own the lock
            String owner = valueCommands.get(key);
            if (workerId.equals(owner)) {
                keyCommands.del(key);
                LOG.debugf("Released lock: %s", lockName);
            } else {
                LOG.debugf("Cannot release lock %s (owned by: %s, we are: %s)", lockName, owner, workerId);
            }
        } catch (Exception e) {
            LOG.warnf("Error releasing lock %s: %s", lockName, e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Extend lock TTL (for long-running operations).
     */
    public boolean extendLock(String lockName, int additionalSeconds) {
        if (!redisAvailable) return true;

        String key = LOCK_KEY_PREFIX + lockName;
        try {
            String owner = valueCommands.get(key);
            if (workerId.equals(owner)) {
                keyCommands.expire(key, additionalSeconds);
                LOG.debugf("Extended lock: %s by %ds", lockName, additionalSeconds);
                return true;
            }
            return false;
        } catch (Exception e) {
            LOG.warnf("Error extending lock %s: %s", lockName, e.getMessage());
            checkRedisConnection();
            return true;
        }
    }

    /**
     * Check if a lock is currently held.
     */
    public boolean isLocked(String lockName) {
        if (!redisAvailable) return false;

        String key = LOCK_KEY_PREFIX + lockName;
        try {
            return keyCommands.exists(key);
        } catch (Exception e) {
            checkRedisConnection();
            return false;
        }
    }

    /**
     * Execute action with lock. Acquires lock, executes, then releases.
     * Returns result if successful, or executes without lock if Redis unavailable.
     */
    public <T> LockResult<T> withLock(String lockName, Supplier<T> action) {
        if (!tryLock(lockName)) {
            return LockResult.notAcquired();
        }
        try {
            T result = action.get();
            return LockResult.success(result);
        } finally {
            unlock(lockName);
        }
    }

    /**
     * Execute action with lock (no return value).
     */
    public boolean withLock(String lockName, Runnable action) {
        if (!tryLock(lockName)) {
            return false;
        }
        try {
            action.run();
            return true;
        } finally {
            unlock(lockName);
        }
    }

    /**
     * Get lock for trigger execution (prevents duplicate triggers).
     */
    public boolean tryLockTrigger(UUID triggerId) {
        return tryLock("trigger:" + triggerId, 120); // 2 minute lock for triggers
    }

    /**
     * Release trigger lock.
     */
    public void unlockTrigger(UUID triggerId) {
        unlock("trigger:" + triggerId);
    }

    /**
     * Get lock for workflow execution (prevents duplicate processing).
     */
    public boolean tryLockExecution(UUID executionId) {
        return tryLock("execution:" + executionId, 300); // 5 minute lock for executions
    }

    /**
     * Release execution lock.
     */
    public void unlockExecution(UUID executionId) {
        unlock("execution:" + executionId);
    }

    /**
     * Get this worker's unique ID.
     */
    public String getWorkerId() {
        return workerId;
    }

    /**
     * Re-check Redis connection after an error.
     */
    private void checkRedisConnection() {
        try {
            if (keyCommands != null) {
                keyCommands.exists("__ping__");
            }
        } catch (Exception e) {
            if (redisAvailable) {
                LOG.warn("Redis connection lost - distributed locking disabled");
                redisAvailable = false;
            }
        }
    }

    /**
     * Result wrapper for lock-protected operations.
     */
    public static class LockResult<T> {
        private final boolean acquired;
        private final T value;

        private LockResult(boolean acquired, T value) {
            this.acquired = acquired;
            this.value = value;
        }

        public static <T> LockResult<T> success(T value) {
            return new LockResult<>(true, value);
        }

        public static <T> LockResult<T> notAcquired() {
            return new LockResult<>(false, null);
        }

        public boolean wasAcquired() {
            return acquired;
        }

        public T getValue() {
            return value;
        }
    }
}
