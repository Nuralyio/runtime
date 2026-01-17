package com.nuraly.conduit.health;

import com.nuraly.conduit.service.ConnectionPoolManager;
import com.nuraly.conduit.service.CredentialCacheService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Liveness;

/**
 * Liveness health check for Kubernetes/load balancer.
 * Returns UP if the service is alive and can process requests.
 */
@Liveness
@ApplicationScoped
public class ConduitHealthCheck implements HealthCheck {

    @Inject
    ConnectionPoolManager poolManager;

    @Inject
    CredentialCacheService cacheService;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder builder = HealthCheckResponse.named("conduit-liveness");

        boolean poolHealthy = poolManager.isHealthy();
        boolean cacheHealthy = cacheService.isHealthy();

        ConnectionPoolManager.AggregatePoolStats stats = poolManager.getAggregateStats();

        builder.withData("poolHealthy", poolHealthy)
               .withData("cacheHealthy", cacheHealthy)
               .withData("instanceId", stats.instanceId())
               .withData("activeInstances", stats.activeInstances())
               .withData("totalPools", stats.poolCount())
               .withData("totalConnections", stats.totalConnections())
               .withData("activeConnections", stats.totalActiveConnections())
               .withData("awaitingConnections", stats.totalThreadsAwaiting());

        if (poolHealthy) {
            return builder.up().build();
        } else {
            return builder.down().build();
        }
    }
}
