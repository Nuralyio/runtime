package com.nuraly.workflows.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.hash.HashCommands;
import io.quarkus.redis.datasource.keys.KeyCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Redis-based checkpoint service for workflow execution state recovery.
 * Enables resuming executions from the last completed node after worker crash.
 *
 * GRACEFUL DEGRADATION: If Redis is unavailable, checkpointing is disabled
 * and executions will restart from the beginning on crash (original behavior).
 *
 * Checkpoint data structure (Redis Hash):
 * - execution:{id}:checkpoint
 *   - lastCompletedNodeId: UUID of last successfully completed node
 *   - variables: JSON string of execution variables
 *   - nodeOutputs: JSON map of nodeId -> output
 *   - currentNodeId: UUID of node being processed (null if between nodes)
 *   - updatedAt: Timestamp of last checkpoint
 *
 * TTL: 24 hours (configurable)
 */
@ApplicationScoped
public class ExecutionCheckpointService {

    private static final Logger LOG = Logger.getLogger(ExecutionCheckpointService.class);
    private static final String CHECKPOINT_KEY_PREFIX = "execution:";
    private static final String CHECKPOINT_KEY_SUFFIX = ":checkpoint";

    @Inject
    Instance<RedisDataSource> redisDataSourceInstance;

    private HashCommands<String, String, String> hashCommands;
    private KeyCommands<String> keyCommands;
    private final ObjectMapper objectMapper;
    private boolean redisAvailable = false;

    @ConfigProperty(name = "redis.checkpoint.ttl", defaultValue = "86400")
    int checkpointTtlSeconds;

    public ExecutionCheckpointService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    void init() {
        try {
            if (redisDataSourceInstance.isResolvable()) {
                RedisDataSource dataSource = redisDataSourceInstance.get();
                this.hashCommands = dataSource.hash(String.class, String.class, String.class);
                this.keyCommands = dataSource.key(String.class);
                // Test connection
                keyCommands.exists("__ping__");
                redisAvailable = true;
                LOG.info("Redis checkpoint service initialized successfully");
            } else {
                LOG.info("Redis not configured - checkpointing disabled");
            }
        } catch (Exception e) {
            LOG.warn("Redis unavailable - checkpointing disabled: " + e.getMessage());
            redisAvailable = false;
        }
    }

    /**
     * Check if Redis checkpointing is available.
     */
    public boolean isAvailable() {
        return redisAvailable;
    }

    /**
     * Save checkpoint after node completion.
     */
    public void saveCheckpoint(UUID executionId, UUID lastCompletedNodeId,
                                String variables, Map<UUID, JsonNode> nodeOutputs) {
        if (!redisAvailable) return;

        String key = getCheckpointKey(executionId);
        try {
            Map<String, String> checkpoint = new HashMap<>();
            checkpoint.put("lastCompletedNodeId", lastCompletedNodeId.toString());
            checkpoint.put("variables", variables);
            checkpoint.put("nodeOutputs", serializeNodeOutputs(nodeOutputs));
            checkpoint.put("updatedAt", Instant.now().toString());

            hashCommands.hset(key, checkpoint);
            keyCommands.expire(key, checkpointTtlSeconds);

            LOG.debugf("Saved checkpoint for execution %s at node %s", executionId, lastCompletedNodeId);
        } catch (Exception e) {
            LOG.warnf("Error saving checkpoint for execution %s: %s", executionId, e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Mark current node being processed (for crash detection).
     */
    public void markNodeInProgress(UUID executionId, UUID nodeId) {
        if (!redisAvailable) return;

        String key = getCheckpointKey(executionId);
        try {
            hashCommands.hset(key, "currentNodeId", nodeId.toString());
            hashCommands.hset(key, "nodeStartedAt", Instant.now().toString());
            keyCommands.expire(key, checkpointTtlSeconds);
        } catch (Exception e) {
            LOG.warnf("Error marking node in progress: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Clear current node (node completed successfully).
     */
    public void clearCurrentNode(UUID executionId) {
        if (!redisAvailable) return;

        String key = getCheckpointKey(executionId);
        try {
            hashCommands.hdel(key, "currentNodeId", "nodeStartedAt");
        } catch (Exception e) {
            LOG.warnf("Error clearing current node: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Get checkpoint for execution (for resume after crash).
     */
    public Optional<ExecutionCheckpoint> getCheckpoint(UUID executionId) {
        if (!redisAvailable) return Optional.empty();

        String key = getCheckpointKey(executionId);
        try {
            Map<String, String> data = hashCommands.hgetall(key);
            if (data == null || data.isEmpty()) {
                return Optional.empty();
            }

            ExecutionCheckpoint checkpoint = new ExecutionCheckpoint();
            checkpoint.executionId = executionId;

            if (data.containsKey("lastCompletedNodeId")) {
                checkpoint.lastCompletedNodeId = UUID.fromString(data.get("lastCompletedNodeId"));
            }
            if (data.containsKey("variables")) {
                checkpoint.variables = data.get("variables");
            }
            if (data.containsKey("nodeOutputs")) {
                checkpoint.nodeOutputs = deserializeNodeOutputs(data.get("nodeOutputs"));
            }
            if (data.containsKey("currentNodeId")) {
                checkpoint.currentNodeId = UUID.fromString(data.get("currentNodeId"));
            }
            if (data.containsKey("updatedAt")) {
                checkpoint.updatedAt = Instant.parse(data.get("updatedAt"));
            }

            LOG.debugf("Retrieved checkpoint for execution %s", executionId);
            return Optional.of(checkpoint);
        } catch (Exception e) {
            LOG.warnf("Error getting checkpoint for execution %s: %s", executionId, e.getMessage());
            checkRedisConnection();
            return Optional.empty();
        }
    }

    /**
     * Delete checkpoint (execution completed or failed permanently).
     */
    public void deleteCheckpoint(UUID executionId) {
        if (!redisAvailable) return;

        String key = getCheckpointKey(executionId);
        try {
            keyCommands.del(key);
            LOG.debugf("Deleted checkpoint for execution %s", executionId);
        } catch (Exception e) {
            LOG.warnf("Error deleting checkpoint: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Check if execution has a checkpoint (was interrupted).
     */
    public boolean hasCheckpoint(UUID executionId) {
        if (!redisAvailable) return false;

        String key = getCheckpointKey(executionId);
        try {
            return keyCommands.exists(key);
        } catch (Exception e) {
            checkRedisConnection();
            return false;
        }
    }

    private String getCheckpointKey(UUID executionId) {
        return CHECKPOINT_KEY_PREFIX + executionId + CHECKPOINT_KEY_SUFFIX;
    }

    private String serializeNodeOutputs(Map<UUID, JsonNode> nodeOutputs) throws JsonProcessingException {
        if (nodeOutputs == null) return "{}";

        ObjectNode obj = objectMapper.createObjectNode();
        for (Map.Entry<UUID, JsonNode> entry : nodeOutputs.entrySet()) {
            obj.set(entry.getKey().toString(), entry.getValue());
        }
        return objectMapper.writeValueAsString(obj);
    }

    private Map<UUID, JsonNode> deserializeNodeOutputs(String json) {
        Map<UUID, JsonNode> result = new HashMap<>();
        try {
            JsonNode node = objectMapper.readTree(json);
            node.fields().forEachRemaining(entry -> {
                result.put(UUID.fromString(entry.getKey()), entry.getValue());
            });
        } catch (Exception e) {
            LOG.warnf("Error deserializing node outputs: %s", e.getMessage());
        }
        return result;
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
                LOG.warn("Redis connection lost - checkpointing disabled");
                redisAvailable = false;
            }
        }
    }

    /**
     * Checkpoint data class.
     */
    public static class ExecutionCheckpoint {
        public UUID executionId;
        public UUID lastCompletedNodeId;
        public UUID currentNodeId;
        public String variables;
        public Map<UUID, JsonNode> nodeOutputs;
        public Instant updatedAt;
    }
}
