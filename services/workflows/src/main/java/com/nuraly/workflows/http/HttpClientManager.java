package com.nuraly.workflows.http;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.util.Timeout;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Manages a pooled HTTP client for efficient connection reuse.
 * This significantly improves performance under load by:
 * - Reusing TCP connections (avoiding handshake overhead)
 * - Limiting concurrent connections (preventing socket exhaustion)
 * - Configuring timeouts (preventing hung requests)
 */
@ApplicationScoped
public class HttpClientManager {

    private static final Logger LOG = Logger.getLogger(HttpClientManager.class);

    @ConfigProperty(name = "http.client.pool.max-total", defaultValue = "100")
    int maxTotal;

    @ConfigProperty(name = "http.client.pool.max-per-route", defaultValue = "20")
    int maxPerRoute;

    @ConfigProperty(name = "http.client.timeout.connect-ms", defaultValue = "10000")
    int connectTimeoutMs;

    @ConfigProperty(name = "http.client.timeout.socket-ms", defaultValue = "30000")
    int socketTimeoutMs;

    @ConfigProperty(name = "http.client.timeout.request-ms", defaultValue = "60000")
    int requestTimeoutMs;

    private PoolingHttpClientConnectionManager connectionManager;
    private CloseableHttpClient httpClient;

    void onStart(@Observes StartupEvent ev) {
        initializeClient();
    }

    void onStop(@Observes ShutdownEvent ev) {
        shutdown();
    }

    private void initializeClient() {
        // Configure connection pool
        connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(maxTotal);
        connectionManager.setDefaultMaxPerRoute(maxPerRoute);

        // Configure connection timeouts
        ConnectionConfig connectionConfig = ConnectionConfig.custom()
                .setConnectTimeout(Timeout.of(connectTimeoutMs, TimeUnit.MILLISECONDS))
                .setSocketTimeout(Timeout.of(socketTimeoutMs, TimeUnit.MILLISECONDS))
                .build();
        connectionManager.setDefaultConnectionConfig(connectionConfig);

        // Configure request timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectionRequestTimeout(Timeout.of(requestTimeoutMs, TimeUnit.MILLISECONDS))
                .build();

        // Build the pooled client
        httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .evictExpiredConnections()
                .evictIdleConnections(Timeout.of(30, TimeUnit.SECONDS))
                .build();

        LOG.infof("HTTP client pool initialized: maxTotal=%d, maxPerRoute=%d, connectTimeout=%dms, socketTimeout=%dms",
                maxTotal, maxPerRoute, connectTimeoutMs, socketTimeoutMs);
    }

    /**
     * Get the shared pooled HTTP client.
     * DO NOT close this client - it's managed by the container lifecycle.
     */
    public CloseableHttpClient getClient() {
        return httpClient;
    }

    /**
     * Get current pool statistics for monitoring.
     */
    public PoolStats getPoolStats() {
        if (connectionManager == null) {
            return new PoolStats(0, 0, 0, 0);
        }
        var stats = connectionManager.getTotalStats();
        return new PoolStats(
                stats.getAvailable(),
                stats.getLeased(),
                stats.getPending(),
                stats.getMax()
        );
    }

    private void shutdown() {
        try {
            if (httpClient != null) {
                httpClient.close();
                LOG.info("HTTP client pool shut down");
            }
        } catch (IOException e) {
            LOG.error("Error shutting down HTTP client pool", e);
        }
    }

    public record PoolStats(int available, int leased, int pending, int max) {}
}
