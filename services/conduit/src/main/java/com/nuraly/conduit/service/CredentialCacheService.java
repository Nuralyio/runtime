package com.nuraly.conduit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.conduit.dto.DatabaseCredential;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

/**
 * Redis-based credential caching service.
 * Reduces load on KV service by caching credentials with TTL.
 * Supports horizontal scaling with shared cache across instances.
 *
 * Gracefully degrades to no-op if Redis is unavailable.
 */
@ApplicationScoped
public class CredentialCacheService {

    private static final Logger LOG = Logger.getLogger(CredentialCacheService.class);
    private static final String CACHE_PREFIX = "conduit:credential:";

    @Inject
    Instance<RedisDataSource> redisDataSourceInstance;

    @ConfigProperty(name = "cache.credential.ttl-seconds", defaultValue = "300")
    long credentialTtlSeconds;

    @ConfigProperty(name = "cache.credential.enabled", defaultValue = "true")
    boolean cacheEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ValueCommands<String, String> valueCommands;
    private boolean redisAvailable = false;

    @PostConstruct
    void init() {
        if (!cacheEnabled) {
            LOG.info("Credential cache disabled by configuration");
            return;
        }

        try {
            if (redisDataSourceInstance.isResolvable()) {
                RedisDataSource redisDataSource = redisDataSourceInstance.get();
                this.valueCommands = redisDataSource.value(String.class, String.class);
                // Test connection
                valueCommands.get(CACHE_PREFIX + "ping");
                redisAvailable = true;
                LOG.infof("Credential cache initialized. TTL: %ds", credentialTtlSeconds);
            } else {
                LOG.warn("Redis not configured, credential caching disabled");
            }
        } catch (Exception e) {
            LOG.warnf("Redis unavailable, credential caching disabled: %s", e.getMessage());
            redisAvailable = false;
        }
    }

    /**
     * Get cached credential or return null if not cached.
     */
    public DatabaseCredential get(String connectionPath, String applicationId) {
        if (!isEnabled()) {
            return null;
        }

        try {
            String key = buildKey(connectionPath, applicationId);
            String cached = valueCommands.get(key);

            if (cached != null) {
                LOG.debugf("Cache HIT for credential: %s", key);
                return objectMapper.readValue(cached, DatabaseCredential.class);
            }

            LOG.debugf("Cache MISS for credential: %s", key);
            return null;
        } catch (Exception e) {
            LOG.warnf("Failed to get cached credential: %s", e.getMessage());
            return null;
        }
    }

    /**
     * Cache a credential with TTL.
     */
    public void put(String connectionPath, String applicationId, DatabaseCredential credential) {
        if (!isEnabled() || credential == null) {
            return;
        }

        try {
            String key = buildKey(connectionPath, applicationId);
            String json = objectMapper.writeValueAsString(credential);
            valueCommands.setex(key, credentialTtlSeconds, json);
            LOG.debugf("Cached credential: %s (TTL: %ds)", key, credentialTtlSeconds);
        } catch (JsonProcessingException e) {
            LOG.warnf("Failed to cache credential: %s", e.getMessage());
        }
    }

    /**
     * Invalidate cached credential.
     */
    public void invalidate(String connectionPath, String applicationId) {
        if (!isEnabled()) {
            return;
        }

        try {
            String key = buildKey(connectionPath, applicationId);
            valueCommands.getdel(key);
            LOG.debugf("Invalidated cached credential: %s", key);
        } catch (Exception e) {
            LOG.warnf("Failed to invalidate cached credential: %s", e.getMessage());
        }
    }

    /**
     * Check if cache is healthy (Redis connection works).
     */
    public boolean isHealthy() {
        if (!isEnabled()) {
            return true; // Not enabled = healthy (graceful degradation)
        }

        try {
            valueCommands.get(CACHE_PREFIX + "health-check");
            return true;
        } catch (Exception e) {
            LOG.warnf("Redis health check failed: %s", e.getMessage());
            return false;
        }
    }

    private boolean isEnabled() {
        return cacheEnabled && redisAvailable && valueCommands != null;
    }

    private String buildKey(String connectionPath, String applicationId) {
        return CACHE_PREFIX + applicationId + ":" + connectionPath;
    }
}
