package com.nuraly.conduit.health;

import com.nuraly.conduit.service.ConnectionPoolManager;
import com.nuraly.conduit.service.CredentialCacheService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.HealthCheckResponseBuilder;
import org.eclipse.microprofile.health.Readiness;

/**
 * Readiness health check for Kubernetes/load balancer.
 * Returns UP if the service is ready to accept traffic.
 */
@Readiness
@ApplicationScoped
public class ConduitReadinessCheck implements HealthCheck {

    @Inject
    ConnectionPoolManager poolManager;

    @Inject
    CredentialCacheService cacheService;

    @Override
    public HealthCheckResponse call() {
        HealthCheckResponseBuilder builder = HealthCheckResponse.named("conduit-readiness");

        boolean poolReady = poolManager.isReady();
        boolean cacheReady = cacheService.isHealthy();

        builder.withData("poolReady", poolReady)
               .withData("cacheReady", cacheReady);

        // Service is ready if pool manager is ready
        // Cache being down is acceptable (graceful degradation)
        if (poolReady) {
            return builder.up().build();
        } else {
            return builder.down().build();
        }
    }
}
