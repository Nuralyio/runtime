package com.nuraly.workflows.test;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.HashMap;
import java.util.Map;

/**
 * Test resource that starts a PostgreSQL container with PGVector extension.
 * Used for integration testing of vector storage and search operations.
 */
public class PostgresVectorResource implements QuarkusTestResourceLifecycleManager {

    private static final String PGVECTOR_IMAGE = "pgvector/pgvector:pg16";

    private PostgreSQLContainer<?> postgres;

    @Override
    public Map<String, String> start() {
        postgres = new PostgreSQLContainer<>(PGVECTOR_IMAGE)
                .withDatabaseName("workflow_test")
                .withUsername("test")
                .withPassword("test")
                .withCommand("postgres", "-c", "shared_preload_libraries=vector");

        postgres.start();

        // Enable vector extension
        try (var conn = java.sql.DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())) {
            conn.createStatement().execute("CREATE EXTENSION IF NOT EXISTS vector");
        } catch (Exception e) {
            throw new RuntimeException("Failed to enable vector extension", e);
        }

        Map<String, String> config = new HashMap<>();
        config.put("quarkus.datasource.jdbc.url", postgres.getJdbcUrl());
        config.put("quarkus.datasource.username", postgres.getUsername());
        config.put("quarkus.datasource.password", postgres.getPassword());
        config.put("quarkus.flyway.migrate-at-start", "true");
        config.put("quarkus.hibernate-orm.database.generation", "none");

        return config;
    }

    @Override
    public void stop() {
        if (postgres != null) {
            postgres.stop();
        }
    }
}
