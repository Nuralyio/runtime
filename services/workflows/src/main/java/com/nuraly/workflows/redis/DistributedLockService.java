package com.nuraly.workflows.redis;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.keys.KeyCommands;
import io.quarkus.redis.datasource.value.SetArgs;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Redis-based distributed lock service.
 * Prevents duplicate execution of scheduled triggers across multiple worker instances.
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

    private final ValueCommands<String, String> valueCommands;
    private final KeyCommands<String> keyCommands;

    // Unique identifier for this worker instance
    private final String workerId = UUID.randomUUID().toString();

    @ConfigProperty(name = "redis.lock.ttl", defaultValue = "60")
    int lockTtlSeconds;

    @Inject
    public DistributedLockService(RedisDataSource redisDataSource) {
        this.valueCommands = redisDataSource.value(String.class, String.class);
        this.keyCommands = redisDataSource.key(String.class);
    }

    /**
     * Try to acquire a lock. Returns true if lock was acquired.
     */
    public boolean tryLock(String lockName) {
        return tryLock(lockName, lockTtlSeconds);
    }

    /**
     * Try to acquire a lock with custom TTL.
     */
    public boolean tryLock(String lockName, int ttlSeconds) {
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
            return false;
        }
    }

    /**
     * Release a lock. Only releases if this worker owns the lock.
     */
    public void unlock(String lockName) {
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
        }
    }

    /**
     * Extend lock TTL (for long-running operations).
     */
    public boolean extendLock(String lockName, int additionalSeconds) {
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
            return false;
        }
    }

    /**
     * Check if a lock is currently held.
     */
    public boolean isLocked(String lockName) {
        String key = LOCK_KEY_PREFIX + lockName;
        try {
            return keyCommands.exists(key);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Execute action with lock. Acquires lock, executes, then releases.
     * Returns empty Optional if lock could not be acquired.
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
