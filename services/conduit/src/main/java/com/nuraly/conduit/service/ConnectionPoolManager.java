package com.nuraly.conduit.service;

import com.nuraly.conduit.connector.DatabaseConnector;
import com.nuraly.conduit.connector.DatabaseConnectorFactory;
import com.nuraly.conduit.dto.DatabaseCredential;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Manages connection pools for database connections.
 * Pools are cached by connection path for reuse.
 * Optimized for production with horizontal scaling support.
 */
@ApplicationScoped
public class ConnectionPoolManager {

    private static final Logger LOG = Logger.getLogger(ConnectionPoolManager.class);

    // Pool size settings
    @ConfigProperty(name = "db.pool.max-size", defaultValue = "20")
    int maxPoolSize;

    @ConfigProperty(name = "db.pool.min-idle", defaultValue = "5")
    int minIdle;

    // Timeout settings (production-optimized defaults)
    @ConfigProperty(name = "db.pool.idle-timeout", defaultValue = "120000")
    long idleTimeout;

    @ConfigProperty(name = "db.pool.connection-timeout", defaultValue = "10000")
    long connectionTimeout;

    @ConfigProperty(name = "db.pool.max-lifetime", defaultValue = "1800000")
    long maxLifetime;

    @ConfigProperty(name = "db.pool.keepalive-time", defaultValue = "30000")
    long keepaliveTime;

    @ConfigProperty(name = "db.pool.validation-timeout", defaultValue = "5000")
    long validationTimeout;

    @ConfigProperty(name = "db.pool.leak-detection-threshold", defaultValue = "60000")
    long leakDetectionThreshold;

    // Scaling settings
    @ConfigProperty(name = "db.pool.register-mbeans", defaultValue = "true")
    boolean registerMbeans;

    @Inject
    DatabaseConnectorFactory connectorFactory;

    @Inject
    GlobalConnectionLimitService connectionLimitService;

    /** Cache of connection pools by applicationId:connectionPath */
    private final Map<String, HikariDataSource> pools = new ConcurrentHashMap<>();

    /** Scheduler for periodic tasks */
    private ScheduledExecutorService scheduler;

    @PostConstruct
    void init() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "conduit-pool-monitor");
            t.setDaemon(true);
            return t;
        });

        // Schedule periodic stats reporting for horizontal scaling
        scheduler.scheduleAtFixedRate(this::reportPoolStats, 10, 10, TimeUnit.SECONDS);

        // Schedule heartbeat for instance registry
        scheduler.scheduleAtFixedRate(connectionLimitService::heartbeat, 30, 30, TimeUnit.SECONDS);

        LOG.infof("Connection pool manager initialized. Max: %d, Min idle: %d, Timeout: %dms",
                maxPoolSize, minIdle, connectionTimeout);
    }

    /**
     * Get a connection from the pool, creating the pool if necessary.
     *
     * @param connectionPath Key path in KV store
     * @param applicationId  Application ID
     * @param credential     Database credentials
     * @return Database connection from pool
     */
    public Connection getConnection(String connectionPath, String applicationId, DatabaseCredential credential) throws SQLException {
        String poolKey = buildPoolKey(applicationId, connectionPath);

        HikariDataSource pool = pools.computeIfAbsent(poolKey, k -> {
            // Check global connection limits before creating new pool
            int effectivePoolSize = getEffectivePoolSize(credential);
            if (!connectionLimitService.canAcquireConnection(effectivePoolSize)) {
                LOG.warnf("Global connection limit reached, using reduced pool size for: %s", poolKey);
            }
            return createPool(credential, poolKey);
        });

        return pool.getConnection();
    }

    /**
     * Get a connection directly without pooling (for one-off operations).
     */
    public Connection getDirectConnection(DatabaseCredential credential) throws SQLException {
        DatabaseConnector connector = connectorFactory.getConnector(credential.getType());
        return connector.connect(credential);
    }

    /**
     * Close and remove a specific pool.
     */
    public void closePool(String connectionPath, String applicationId) {
        String poolKey = buildPoolKey(applicationId, connectionPath);
        HikariDataSource pool = pools.remove(poolKey);
        if (pool != null && !pool.isClosed()) {
            LOG.infof("Closing connection pool: %s", poolKey);
            pool.close();
        }
    }

    /**
     * Close all pools (called on shutdown).
     */
    @PreDestroy
    public void closeAllPools() {
        LOG.info("Closing all connection pools...");

        // Shutdown scheduler
        if (scheduler != null) {
            scheduler.shutdown();
            try {
                if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                    scheduler.shutdownNow();
                }
            } catch (InterruptedException e) {
                scheduler.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }

        // Close all pools
        pools.forEach((key, pool) -> {
            if (!pool.isClosed()) {
                pool.close();
            }
        });
        pools.clear();
    }

    /**
     * Get pool statistics for monitoring.
     */
    public PoolStats getPoolStats(String connectionPath, String applicationId) {
        String poolKey = buildPoolKey(applicationId, connectionPath);
        HikariDataSource pool = pools.get(poolKey);

        if (pool == null) {
            return null;
        }

        return new PoolStats(
                pool.getHikariPoolMXBean().getActiveConnections(),
                pool.getHikariPoolMXBean().getIdleConnections(),
                pool.getHikariPoolMXBean().getTotalConnections(),
                pool.getHikariPoolMXBean().getThreadsAwaitingConnection()
        );
    }

    /**
     * Get aggregate statistics for all pools.
     */
    public AggregatePoolStats getAggregateStats() {
        int totalActive = 0;
        int totalIdle = 0;
        int totalConnections = 0;
        int totalAwaiting = 0;
        int poolCount = pools.size();

        for (HikariDataSource pool : pools.values()) {
            if (!pool.isClosed()) {
                try {
                    totalActive += pool.getHikariPoolMXBean().getActiveConnections();
                    totalIdle += pool.getHikariPoolMXBean().getIdleConnections();
                    totalConnections += pool.getHikariPoolMXBean().getTotalConnections();
                    totalAwaiting += pool.getHikariPoolMXBean().getThreadsAwaitingConnection();
                } catch (Exception e) {
                    LOG.debugf("Failed to get stats for pool: %s", e.getMessage());
                }
            }
        }

        return new AggregatePoolStats(
                totalActive,
                totalIdle,
                totalConnections,
                totalAwaiting,
                poolCount,
                connectionLimitService.getInstanceId(),
                connectionLimitService.getActiveInstanceCount()
        );
    }

    /**
     * Check if the pool manager is healthy.
     */
    public boolean isHealthy() {
        // Check if any pools have issues
        for (HikariDataSource pool : pools.values()) {
            if (pool.isClosed()) {
                return false;
            }
            // Check for high waiting threads (indicates pool exhaustion)
            if (pool.getHikariPoolMXBean().getThreadsAwaitingConnection() > maxPoolSize) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if the pool manager is ready to accept requests.
     */
    public boolean isReady() {
        // Ready if we can create pools (scheduler is running)
        return scheduler != null && !scheduler.isShutdown();
    }

    private HikariDataSource createPool(DatabaseCredential credential, String poolKey) {
        LOG.infof("Creating connection pool: %s for %s", poolKey, credential.getType());

        int effectivePoolSize = getEffectivePoolSize(credential);

        HikariConfig config = new HikariConfig();

        // Pool identification (includes instance ID for horizontal scaling)
        String instanceId = connectionLimitService.getInstanceId();
        config.setPoolName(instanceId + "-" + poolKey);

        // Connection settings
        config.setJdbcUrl(credential.buildJdbcUrl());
        config.setUsername(credential.getUsername());
        config.setPassword(credential.getPassword());

        // Pool size settings
        config.setMaximumPoolSize(effectivePoolSize);
        config.setMinimumIdle(Math.min(minIdle, effectivePoolSize));

        // Timeout settings (production-optimized)
        config.setIdleTimeout(idleTimeout);
        config.setConnectionTimeout(credential.getConnectionTimeout() != null ?
                credential.getConnectionTimeout() : connectionTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setKeepaliveTime(keepaliveTime);
        config.setValidationTimeout(validationTimeout);

        // Leak detection (helps find connection leaks in production)
        config.setLeakDetectionThreshold(leakDetectionThreshold);

        // JMX monitoring
        config.setRegisterMbeans(registerMbeans);

        // Database-specific settings
        switch (credential.getType().toLowerCase()) {
            case "postgresql" -> {
                config.setDriverClassName("org.postgresql.Driver");
                if (Boolean.TRUE.equals(credential.getSsl())) {
                    config.addDataSourceProperty("ssl", "true");
                    config.addDataSourceProperty("sslmode",
                            credential.getSslMode() != null ? credential.getSslMode() : "require");
                }
                // PostgreSQL-specific optimizations
                config.addDataSourceProperty("prepareThreshold", "5");
                config.addDataSourceProperty("preparedStatementCacheQueries", "256");
                config.addDataSourceProperty("preparedStatementCacheSizeMiB", "5");
                config.addDataSourceProperty("defaultRowFetchSize", "100");
            }
            case "mysql" -> {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                if (Boolean.TRUE.equals(credential.getSsl())) {
                    config.addDataSourceProperty("useSSL", "true");
                    config.addDataSourceProperty("requireSSL", "true");
                }
                // MySQL-specific optimizations
                config.addDataSourceProperty("cachePrepStmts", "true");
                config.addDataSourceProperty("prepStmtCacheSize", "250");
                config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
                config.addDataSourceProperty("useServerPrepStmts", "true");
                config.addDataSourceProperty("rewriteBatchedStatements", "true");
            }
        }

        // Validation query
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }

    private int getEffectivePoolSize(DatabaseCredential credential) {
        // Priority: credential > recommended (based on scaling) > default
        if (credential.getMaxPoolSize() != null) {
            return credential.getMaxPoolSize();
        }
        return connectionLimitService.getRecommendedPoolSize(maxPoolSize);
    }

    private String buildPoolKey(String applicationId, String connectionPath) {
        return applicationId + "-" + connectionPath;
    }

    /**
     * Report pool statistics to global connection limit service.
     */
    private void reportPoolStats() {
        try {
            int totalConnections = 0;
            for (Map.Entry<String, HikariDataSource> entry : pools.entrySet()) {
                HikariDataSource pool = entry.getValue();
                if (!pool.isClosed()) {
                    int active = pool.getHikariPoolMXBean().getActiveConnections();
                    connectionLimitService.reportConnections(entry.getKey(), active);
                    totalConnections += pool.getHikariPoolMXBean().getTotalConnections();
                }
            }
            connectionLimitService.updateInstanceTotal(totalConnections);
        } catch (Exception e) {
            LOG.debugf("Failed to report pool stats: %s", e.getMessage());
        }
    }

    /**
     * Pool statistics for monitoring.
     */
    public record PoolStats(
            int activeConnections,
            int idleConnections,
            int totalConnections,
            int threadsAwaitingConnection
    ) {}

    /**
     * Aggregate statistics across all pools for this instance.
     */
    public record AggregatePoolStats(
            int totalActiveConnections,
            int totalIdleConnections,
            int totalConnections,
            int totalThreadsAwaiting,
            int poolCount,
            String instanceId,
            int activeInstances
    ) {}
}
