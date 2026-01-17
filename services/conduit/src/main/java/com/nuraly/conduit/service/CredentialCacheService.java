package com.nuraly.conduit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.conduit.dto.DatabaseCredential;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.time.Duration;

/**
 * Redis-based credential caching service.
 * Reduces load on KV service by caching credentials with TTL.
 * Supports horizontal scaling with shared cache across instances.
 */
@ApplicationScoped
public class CredentialCacheService {

    private static final Logger LOG = Logger.getLogger(CredentialCacheService.class);
    private static final String CACHE_PREFIX = "conduit:credential:";

    @Inject
    RedisDataSource redisDataSource;

    @ConfigProperty(name = "cache.credential.ttl-seconds", defaultValue = "300")
    long credentialTtlSeconds;

    @ConfigProperty(name = "cache.credential.enabled", defaultValue = "true")
    boolean cacheEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ValueCommands<String, String> valueCommands;

    @PostConstruct
    void init() {
        this.valueCommands = redisDataSource.value(String.class, String.class);
        LOG.infof("Credential cache initialized. Enabled: %s, TTL: %ds", cacheEnabled, credentialTtlSeconds);
    }

    /**
     * Get cached credential or return null if not cached.
     */
    public DatabaseCredential get(String connectionPath, String applicationId) {
        if (!cacheEnabled) {
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
        if (!cacheEnabled || credential == null) {
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
        if (!cacheEnabled) {
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
        try {
            valueCommands.get(CACHE_PREFIX + "health-check");
            return true;
        } catch (Exception e) {
            LOG.warnf("Redis health check failed: %s", e.getMessage());
            return false;
        }
    }

    private String buildKey(String connectionPath, String applicationId) {
        return CACHE_PREFIX + applicationId + ":" + connectionPath;
    }
}
