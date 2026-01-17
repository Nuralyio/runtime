package com.nuraly.workflows.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.SetArgs;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.enterprise.context.ApplicationScoped;
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

    private final ValueCommands<String, String> redis;
    private final ObjectMapper objectMapper;

    @ConfigProperty(name = "redis.cache.workflow.ttl", defaultValue = "300")
    int workflowTtlSeconds;

    @Inject
    public WorkflowCacheService(RedisDataSource redisDataSource) {
        this.redis = redisDataSource.value(String.class, String.class);
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Get workflow from cache, or load from database if not cached.
     */
    public Optional<WorkflowEntity> getWorkflow(UUID workflowId) {
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
        }
        return Optional.empty();
    }

    /**
     * Cache a workflow entity.
     */
    public void cacheWorkflow(WorkflowEntity workflow) {
        if (workflow == null || workflow.id == null) return;

        String key = WORKFLOW_KEY_PREFIX + workflow.id;
        try {
            String json = objectMapper.writeValueAsString(workflow);
            redis.set(key, json, new SetArgs().ex(Duration.ofSeconds(workflowTtlSeconds)));
            LOG.debugf("Cached workflow: %s (TTL: %ds)", workflow.id, workflowTtlSeconds);
        } catch (JsonProcessingException e) {
            LOG.warnf("Error caching workflow: %s", e.getMessage());
        }
    }

    /**
     * Get workflow nodes from cache.
     */
    public Optional<List<WorkflowNodeEntity>> getWorkflowNodes(UUID workflowId) {
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
        }
        return Optional.empty();
    }

    /**
     * Cache workflow nodes.
     */
    public void cacheWorkflowNodes(UUID workflowId, List<WorkflowNodeEntity> nodes) {
        if (workflowId == null || nodes == null) return;

        String key = WORKFLOW_KEY_PREFIX + workflowId + NODES_KEY_SUFFIX;
        try {
            String json = objectMapper.writeValueAsString(nodes);
            redis.set(key, json, new SetArgs().ex(Duration.ofSeconds(workflowTtlSeconds)));
            LOG.debugf("Cached %d nodes for workflow: %s", nodes.size(), workflowId);
        } catch (JsonProcessingException e) {
            LOG.warnf("Error caching workflow nodes: %s", e.getMessage());
        }
    }

    /**
     * Invalidate workflow cache (call on workflow update/delete).
     */
    public void invalidateWorkflow(UUID workflowId) {
        if (workflowId == null) return;

        try {
            redis.getdel(WORKFLOW_KEY_PREFIX + workflowId);
            redis.getdel(WORKFLOW_KEY_PREFIX + workflowId + NODES_KEY_SUFFIX);
            LOG.debugf("Invalidated cache for workflow: %s", workflowId);
        } catch (Exception e) {
            LOG.warnf("Error invalidating workflow cache: %s", e.getMessage());
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
}
