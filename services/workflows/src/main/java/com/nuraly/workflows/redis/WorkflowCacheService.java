package com.nuraly.workflows.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.SetArgs;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Redis-based caching service for workflow definitions.
 * Reduces database load by caching frequently accessed workflows.
 *
 * GRACEFUL DEGRADATION: If Redis is unavailable, operations are skipped
 * and the system falls back to database-only mode.
 *
 * Cache keys:
 * - workflow:{id} - Full workflow entity
 * - workflow:{id}:nodes - List of workflow nodes
 *
 * TTL: 5 minutes (configurable)
 */
@ApplicationScoped
public class WorkflowCacheService {

    private static final Logger LOG = Logger.getLogger(WorkflowCacheService.class);
    private static final String WORKFLOW_KEY_PREFIX = "workflow:";
    private static final String NODES_KEY_SUFFIX = ":nodes";

    @Inject
    Instance<RedisDataSource> redisDataSourceInstance;

    private ValueCommands<String, String> redis;
    private final ObjectMapper objectMapper;
    private boolean redisAvailable = false;

    @ConfigProperty(name = "redis.cache.workflow.ttl", defaultValue = "300")
    int workflowTtlSeconds;

    public WorkflowCacheService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @PostConstruct
    void init() {
        try {
            if (redisDataSourceInstance.isResolvable()) {
                RedisDataSource dataSource = redisDataSourceInstance.get();
                this.redis = dataSource.value(String.class, String.class);
                // Test connection
                redis.get("__ping__");
                redisAvailable = true;
                LOG.info("Redis cache service initialized successfully");
            } else {
                LOG.info("Redis not configured - caching disabled");
            }
        } catch (Exception e) {
            LOG.warn("Redis unavailable - caching disabled: " + e.getMessage());
            redisAvailable = false;
        }
    }

    /**
     * Check if Redis caching is available.
     */
    public boolean isAvailable() {
        return redisAvailable;
    }

    /**
     * Get workflow from cache, or empty if not cached or Redis unavailable.
     */
    public Optional<WorkflowEntity> getWorkflow(UUID workflowId) {
        if (!redisAvailable) return Optional.empty();

        String key = WORKFLOW_KEY_PREFIX + workflowId;
        try {
            String cached = redis.get(key);
            if (cached != null) {
                LOG.debugf("Cache HIT for workflow: %s", workflowId);
                return Optional.of(objectMapper.readValue(cached, WorkflowEntity.class));
            }
            LOG.debugf("Cache MISS for workflow: %s", workflowId);
        } catch (Exception e) {
            LOG.warnf("Error reading workflow from cache: %s", e.getMessage());
            checkRedisConnection();
        }
        return Optional.empty();
    }

    /**
     * Cache a workflow entity.
     */
    public void cacheWorkflow(WorkflowEntity workflow) {
        if (!redisAvailable || workflow == null || workflow.id == null) return;

        String key = WORKFLOW_KEY_PREFIX + workflow.id;
        try {
            String json = objectMapper.writeValueAsString(workflow);
            redis.set(key, json, new SetArgs().ex(Duration.ofSeconds(workflowTtlSeconds)));
            LOG.debugf("Cached workflow: %s (TTL: %ds)", workflow.id, workflowTtlSeconds);
        } catch (Exception e) {
            LOG.warnf("Error caching workflow: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Get workflow nodes from cache.
     */
    public Optional<List<WorkflowNodeEntity>> getWorkflowNodes(UUID workflowId) {
        if (!redisAvailable) return Optional.empty();

        String key = WORKFLOW_KEY_PREFIX + workflowId + NODES_KEY_SUFFIX;
        try {
            String cached = redis.get(key);
            if (cached != null) {
                LOG.debugf("Cache HIT for workflow nodes: %s", workflowId);
                return Optional.of(objectMapper.readValue(cached,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, WorkflowNodeEntity.class)));
            }
        } catch (Exception e) {
            LOG.warnf("Error reading workflow nodes from cache: %s", e.getMessage());
            checkRedisConnection();
        }
        return Optional.empty();
    }

    /**
     * Cache workflow nodes.
     */
    public void cacheWorkflowNodes(UUID workflowId, List<WorkflowNodeEntity> nodes) {
        if (!redisAvailable || workflowId == null || nodes == null) return;

        String key = WORKFLOW_KEY_PREFIX + workflowId + NODES_KEY_SUFFIX;
        try {
            String json = objectMapper.writeValueAsString(nodes);
            redis.set(key, json, new SetArgs().ex(Duration.ofSeconds(workflowTtlSeconds)));
            LOG.debugf("Cached %d nodes for workflow: %s", nodes.size(), workflowId);
        } catch (Exception e) {
            LOG.warnf("Error caching workflow nodes: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Invalidate workflow cache (call on workflow update/delete).
     */
    public void invalidateWorkflow(UUID workflowId) {
        if (!redisAvailable || workflowId == null) return;

        try {
            redis.getdel(WORKFLOW_KEY_PREFIX + workflowId);
            redis.getdel(WORKFLOW_KEY_PREFIX + workflowId + NODES_KEY_SUFFIX);
            LOG.debugf("Invalidated cache for workflow: %s", workflowId);
        } catch (Exception e) {
            LOG.warnf("Error invalidating workflow cache: %s", e.getMessage());
            checkRedisConnection();
        }
    }

    /**
     * Get or load workflow - checks cache first, then loads from DB and caches.
     */
    public WorkflowEntity getOrLoadWorkflow(UUID workflowId) {
        // Try cache first
        Optional<WorkflowEntity> cached = getWorkflow(workflowId);
        if (cached.isPresent()) {
            return cached.get();
        }

        // Load from database
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow != null) {
            cacheWorkflow(workflow);
        }
        return workflow;
    }

    /**
     * Re-check Redis connection after an error.
     */
    private void checkRedisConnection() {
        try {
            if (redis != null) {
                redis.get("__ping__");
            }
        } catch (Exception e) {
            if (redisAvailable) {
                LOG.warn("Redis connection lost - switching to database-only mode");
                redisAvailable = false;
            }
        }
    }
}
