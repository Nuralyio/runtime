package com.nuraly.conduit.service;

import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.UUID;

/**
 * Tracks global connection usage across all instances for horizontal scaling.
 * Prevents overwhelming the database when multiple instances are running.
 */
@ApplicationScoped
public class GlobalConnectionLimitService {

    private static final Logger LOG = Logger.getLogger(GlobalConnectionLimitService.class);
    private static final String GLOBAL_CONNECTIONS_KEY = "conduit:global:connections:";
    private static final String INSTANCE_REGISTRY_KEY = "conduit:instances:";

    @Inject
    RedisDataSource redisDataSource;

    @ConfigProperty(name = "scaling.global-max-connections", defaultValue = "100")
    int globalMaxConnections;

    @ConfigProperty(name = "scaling.instance-id", defaultValue = "")
    String configuredInstanceId;

    @ConfigProperty(name = "scaling.enabled", defaultValue = "true")
    boolean scalingEnabled;

    private ValueCommands<String, String> valueCommands;
    private String instanceId;

    @PostConstruct
    void init() {
        this.valueCommands = redisDataSource.value(String.class, String.class);
        this.instanceId = configuredInstanceId.isEmpty()
            ? "conduit-" + UUID.randomUUID().toString().substring(0, 8)
            : configuredInstanceId;

        if (scalingEnabled) {
            registerInstance();
        }

        LOG.infof("Global connection limit service initialized. Instance: %s, Global max: %d, Enabled: %s",
                instanceId, globalMaxConnections, scalingEnabled);
    }

    @PreDestroy
    void shutdown() {
        if (scalingEnabled) {
            unregisterInstance();
        }
    }

    /**
     * Get the instance ID for this service instance.
     */
    public String getInstanceId() {
        return instanceId;
    }

    /**
     * Report current connection count for this instance.
     */
    public void reportConnections(String poolKey, int activeConnections) {
        if (!scalingEnabled) {
            return;
        }

        try {
            String key = GLOBAL_CONNECTIONS_KEY + instanceId + ":" + poolKey;
            valueCommands.setex(key, 60, String.valueOf(activeConnections)); // 60s TTL for auto-cleanup
        } catch (Exception e) {
            LOG.debugf("Failed to report connections: %s", e.getMessage());
        }
    }

    /**
     * Check if we can acquire more connections based on global limit.
     */
    public boolean canAcquireConnection(int requestedConnections) {
        if (!scalingEnabled) {
            return true;
        }

        try {
            int totalConnections = getEstimatedGlobalConnections();
            boolean allowed = (totalConnections + requestedConnections) <= globalMaxConnections;

            if (!allowed) {
                LOG.warnf("Global connection limit would be exceeded. Current: %d, Requested: %d, Max: %d",
                        totalConnections, requestedConnections, globalMaxConnections);
            }

            return allowed;
        } catch (Exception e) {
            LOG.warnf("Failed to check global connections, allowing request: %s", e.getMessage());
            return true; // Fail open
        }
    }

    /**
     * Get estimated total connections across all instances.
     * This is an approximation based on reported values.
     */
    public int getEstimatedGlobalConnections() {
        if (!scalingEnabled) {
            return 0;
        }

        // Note: In production, you'd want to use Redis SCAN for this
        // For simplicity, we track per-instance totals
        try {
            String totalKey = GLOBAL_CONNECTIONS_KEY + "total";
            String total = valueCommands.get(totalKey);
            return total != null ? Integer.parseInt(total) : 0;
        } catch (Exception e) {
            LOG.debugf("Failed to get global connections: %s", e.getMessage());
            return 0;
        }
    }

    /**
     * Update the total connection count for this instance.
     */
    public void updateInstanceTotal(int totalConnections) {
        if (!scalingEnabled) {
            return;
        }

        try {
            String key = INSTANCE_REGISTRY_KEY + instanceId + ":connections";
            valueCommands.setex(key, 30, String.valueOf(totalConnections)); // 30s TTL
        } catch (Exception e) {
            LOG.debugf("Failed to update instance total: %s", e.getMessage());
        }
    }

    /**
     * Get the number of active instances.
     */
    public int getActiveInstanceCount() {
        if (!scalingEnabled) {
            return 1;
        }

        try {
            String countKey = INSTANCE_REGISTRY_KEY + "count";
            String count = valueCommands.get(countKey);
            return count != null ? Math.max(1, Integer.parseInt(count)) : 1;
        } catch (Exception e) {
            return 1;
        }
    }

    /**
     * Calculate recommended max pool size for this instance based on global limits.
     */
    public int getRecommendedPoolSize(int defaultPoolSize) {
        if (!scalingEnabled) {
            return defaultPoolSize;
        }

        int instanceCount = getActiveInstanceCount();
        int recommended = globalMaxConnections / instanceCount;

        // Don't go below minimum or above configured default
        return Math.max(5, Math.min(recommended, defaultPoolSize));
    }

    private void registerInstance() {
        try {
            String key = INSTANCE_REGISTRY_KEY + instanceId;
            valueCommands.setex(key, 60, "active"); // 60s TTL, needs heartbeat
            incrementInstanceCount(1);
            LOG.infof("Registered instance: %s", instanceId);
        } catch (Exception e) {
            LOG.warnf("Failed to register instance: %s", e.getMessage());
        }
    }

    private void unregisterInstance() {
        try {
            String key = INSTANCE_REGISTRY_KEY + instanceId;
            valueCommands.getdel(key);
            incrementInstanceCount(-1);
            LOG.infof("Unregistered instance: %s", instanceId);
        } catch (Exception e) {
            LOG.warnf("Failed to unregister instance: %s", e.getMessage());
        }
    }

    private void incrementInstanceCount(int delta) {
        try {
            String countKey = INSTANCE_REGISTRY_KEY + "count";
            String current = valueCommands.get(countKey);
            int newCount = Math.max(0, (current != null ? Integer.parseInt(current) : 0) + delta);
            valueCommands.set(countKey, String.valueOf(newCount));
        } catch (Exception e) {
            LOG.debugf("Failed to update instance count: %s", e.getMessage());
        }
    }

    /**
     * Send heartbeat to keep instance registration alive.
     */
    public void heartbeat() {
        if (!scalingEnabled) {
            return;
        }

        try {
            String key = INSTANCE_REGISTRY_KEY + instanceId;
            valueCommands.setex(key, 60, "active");
        } catch (Exception e) {
            LOG.debugf("Failed to send heartbeat: %s", e.getMessage());
        }
    }
}
