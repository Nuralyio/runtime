package com.nuraly.conduit.service;

import com.nuraly.conduit.connector.DatabaseConnector;
import com.nuraly.conduit.connector.DatabaseConnectorFactory;
import com.nuraly.conduit.dto.DatabaseCredential;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages connection pools for database connections.
 * Pools are cached by connection path for reuse.
 */
@ApplicationScoped
public class ConnectionPoolManager {

    private static final Logger LOG = Logger.getLogger(ConnectionPoolManager.class);

    @ConfigProperty(name = "db.pool.max-size", defaultValue = "10")
    int maxPoolSize;

    @ConfigProperty(name = "db.pool.min-idle", defaultValue = "2")
    int minIdle;

    @ConfigProperty(name = "db.pool.idle-timeout", defaultValue = "300000")
    long idleTimeout;

    @ConfigProperty(name = "db.pool.connection-timeout", defaultValue = "30000")
    long connectionTimeout;

    @Inject
    DatabaseConnectorFactory connectorFactory;

    /** Cache of connection pools by applicationId:connectionPath */
    private final Map<String, HikariDataSource> pools = new ConcurrentHashMap<>();

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

        HikariDataSource pool = pools.computeIfAbsent(poolKey, k -> createPool(credential, poolKey));

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

    private HikariDataSource createPool(DatabaseCredential credential, String poolKey) {
        LOG.infof("Creating connection pool: %s for %s", poolKey, credential.getType());

        HikariConfig config = new HikariConfig();
        config.setPoolName(poolKey);
        config.setJdbcUrl(credential.buildJdbcUrl());
        config.setUsername(credential.getUsername());
        config.setPassword(credential.getPassword());

        config.setMaximumPoolSize(credential.getMaxPoolSize() != null ? credential.getMaxPoolSize() : maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(idleTimeout);
        config.setConnectionTimeout(credential.getConnectionTimeout() != null ?
                credential.getConnectionTimeout() : connectionTimeout);

        // Database-specific settings
        switch (credential.getType().toLowerCase()) {
            case "postgresql" -> {
                config.setDriverClassName("org.postgresql.Driver");
                if (Boolean.TRUE.equals(credential.getSsl())) {
                    config.addDataSourceProperty("ssl", "true");
                    config.addDataSourceProperty("sslmode",
                            credential.getSslMode() != null ? credential.getSslMode() : "require");
                }
            }
            case "mysql" -> {
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                if (Boolean.TRUE.equals(credential.getSsl())) {
                    config.addDataSourceProperty("useSSL", "true");
                    config.addDataSourceProperty("requireSSL", "true");
                }
            }
        }

        // Validation query
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }

    private String buildPoolKey(String applicationId, String connectionPath) {
        return applicationId + ":" + connectionPath;
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
}
