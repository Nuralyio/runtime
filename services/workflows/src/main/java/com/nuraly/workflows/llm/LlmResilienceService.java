package com.nuraly.workflows.llm;

import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resilience service for LLM calls with retry and failover support.
 *
 * Features:
 * - Exponential backoff retry with jitter
 * - Provider failover chain
 * - Circuit breaker per provider
 * - Metrics tracking
 *
 * Usage:
 * <pre>
 * ResilienceConfig config = ResilienceConfig.builder()
 *     .maxRetries(3)
 *     .initialBackoffMs(1000)
 *     .fallbackProviders(List.of("anthropic", "ollama"))
 *     .build();
 *
 * LlmResponse response = resilienceService.executeWithResilience(
 *     request, "openai", apiKey, config);
 * </pre>
 */
@ApplicationScoped
public class LlmResilienceService {

    private static final Logger LOG = Logger.getLogger(LlmResilienceService.class);
    private static final Random JITTER_RANDOM = new Random();

    @Inject
    LlmProviderFactory providerFactory;

    @Inject
    MeterRegistry meterRegistry;

    // Circuit breaker state per provider
    private final ConcurrentHashMap<String, CircuitBreakerState> circuitBreakers = new ConcurrentHashMap<>();

    /**
     * Execute LLM call with retry and failover.
     *
     * @param request The LLM request
     * @param primaryProvider Primary provider name
     * @param apiKey API key for primary provider
     * @param config Resilience configuration
     * @return LLM response
     */
    public LlmResponse executeWithResilience(
            LlmRequest request,
            String primaryProvider,
            String apiKey,
            ResilienceConfig config) {

        return executeWithResilience(request, primaryProvider, apiKey, null, config);
    }

    /**
     * Execute LLM call with retry and failover, with fallback API keys.
     *
     * @param request The LLM request
     * @param primaryProvider Primary provider name
     * @param apiKey API key for primary provider
     * @param fallbackApiKeys API keys for fallback providers (in order)
     * @param config Resilience configuration
     * @return LLM response
     */
    public LlmResponse executeWithResilience(
            LlmRequest request,
            String primaryProvider,
            String apiKey,
            List<String> fallbackApiKeys,
            ResilienceConfig config) {

        long startTime = System.currentTimeMillis();
        Exception lastException = null;
        String lastError = null;

        // Try primary provider with retries
        LlmResponse response = tryProviderWithRetries(
                request, primaryProvider, apiKey, config);

        if (response.isSuccess()) {
            recordSuccess(primaryProvider, System.currentTimeMillis() - startTime);
            return response;
        }

        lastError = response.getError();
        LOG.warnf("Primary provider %s failed: %s", primaryProvider, lastError);

        // Try fallback providers if configured
        if (config.getFallbackProviders() != null && !config.getFallbackProviders().isEmpty()) {
            for (int i = 0; i < config.getFallbackProviders().size(); i++) {
                String fallbackProvider = config.getFallbackProviders().get(i);

                // Skip if circuit is open
                if (isCircuitOpen(fallbackProvider)) {
                    LOG.debugf("Skipping fallback provider %s - circuit is open", fallbackProvider);
                    continue;
                }

                // Get API key for fallback
                String fallbackKey = null;
                if (fallbackApiKeys != null && i < fallbackApiKeys.size()) {
                    fallbackKey = fallbackApiKeys.get(i);
                }

                // Some providers (ollama, local) don't need API keys
                if (fallbackKey == null && requiresApiKey(fallbackProvider)) {
                    LOG.debugf("Skipping fallback provider %s - no API key", fallbackProvider);
                    continue;
                }

                LOG.infof("Attempting failover to provider: %s", fallbackProvider);

                response = tryProviderWithRetries(request, fallbackProvider, fallbackKey, config);

                if (response.isSuccess()) {
                    recordSuccess(fallbackProvider, System.currentTimeMillis() - startTime);
                    recordFailover(primaryProvider, fallbackProvider);
                    return response;
                }

                lastError = response.getError();
                LOG.warnf("Fallback provider %s failed: %s", fallbackProvider, lastError);
            }
        }

        // All providers failed
        recordFailure(primaryProvider, System.currentTimeMillis() - startTime);
        return LlmResponse.error("All LLM providers failed. Last error: " + lastError);
    }

    /**
     * Try a single provider with retry logic.
     */
    private LlmResponse tryProviderWithRetries(
            LlmRequest request,
            String providerName,
            String apiKey,
            ResilienceConfig config) {

        LlmProvider provider = providerFactory.getProvider(providerName);
        if (provider == null) {
            return LlmResponse.error("Unknown provider: " + providerName);
        }

        // Check circuit breaker
        if (isCircuitOpen(providerName)) {
            return LlmResponse.error("Circuit breaker open for provider: " + providerName);
        }

        LlmResponse lastResponse = null;
        int attempts = 0;
        int maxAttempts = config.getMaxRetries() + 1; // +1 for initial attempt

        while (attempts < maxAttempts) {
            attempts++;

            try {
                Timer.Sample sample = Timer.start(meterRegistry);
                lastResponse = provider.chat(request, apiKey);
                sample.stop(meterRegistry.timer("llm.call.duration",
                        "provider", providerName,
                        "status", lastResponse.isSuccess() ? "success" : "error"));

                if (lastResponse.isSuccess()) {
                    recordCircuitSuccess(providerName);
                    return lastResponse;
                }

                // Check if error is retryable
                if (!isRetryableError(lastResponse.getError(), config)) {
                    LOG.debugf("Non-retryable error from %s: %s", providerName, lastResponse.getError());
                    recordCircuitFailure(providerName);
                    return lastResponse;
                }

                LOG.warnf("Retryable error from %s (attempt %d/%d): %s",
                        providerName, attempts, maxAttempts, lastResponse.getError());

            } catch (Exception e) {
                LOG.warnf(e, "Exception from %s (attempt %d/%d)", providerName, attempts, maxAttempts);
                lastResponse = LlmResponse.error(e.getMessage());

                if (!isRetryableException(e, config)) {
                    recordCircuitFailure(providerName);
                    return lastResponse;
                }
            }

            // Wait before retry (except on last attempt)
            if (attempts < maxAttempts) {
                long backoffMs = calculateBackoff(attempts, config);
                LOG.debugf("Waiting %dms before retry %d", backoffMs, attempts + 1);
                sleep(backoffMs);
            }
        }

        // All retries exhausted
        recordCircuitFailure(providerName);
        return lastResponse != null ? lastResponse : LlmResponse.error("Max retries exceeded");
    }

    /**
     * Calculate backoff with exponential increase and jitter.
     */
    private long calculateBackoff(int attempt, ResilienceConfig config) {
        // Exponential backoff: initialBackoff * 2^(attempt-1)
        long exponentialBackoff = config.getInitialBackoffMs() * (1L << (attempt - 1));

        // Cap at max backoff
        exponentialBackoff = Math.min(exponentialBackoff, config.getMaxBackoffMs());

        // Add jitter (±25%)
        double jitterFactor = 0.75 + (JITTER_RANDOM.nextDouble() * 0.5);
        return (long) (exponentialBackoff * jitterFactor);
    }

    /**
     * Check if error message indicates a retryable error.
     */
    private boolean isRetryableError(String error, ResilienceConfig config) {
        if (error == null) return false;

        String lowerError = error.toLowerCase();

        // Always retry these
        if (lowerError.contains("rate limit") ||
            lowerError.contains("rate_limit") ||
            lowerError.contains("429") ||
            lowerError.contains("timeout") ||
            lowerError.contains("timed out") ||
            lowerError.contains("connection reset") ||
            lowerError.contains("connection refused") ||
            lowerError.contains("503") ||
            lowerError.contains("502") ||
            lowerError.contains("500") ||
            lowerError.contains("server error") ||
            lowerError.contains("internal error") ||
            lowerError.contains("temporarily unavailable") ||
            lowerError.contains("overloaded")) {
            return true;
        }

        // Check custom retryable patterns
        if (config.getRetryableErrors() != null) {
            for (String pattern : config.getRetryableErrors()) {
                if (lowerError.contains(pattern.toLowerCase())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if exception is retryable.
     */
    private boolean isRetryableException(Exception e, ResilienceConfig config) {
        // Network exceptions are generally retryable
        if (e instanceof java.net.SocketTimeoutException ||
            e instanceof java.net.ConnectException ||
            e instanceof java.io.IOException) {
            return true;
        }

        // Check error message
        return isRetryableError(e.getMessage(), config);
    }

    /**
     * Check if provider requires API key.
     */
    private boolean requiresApiKey(String providerName) {
        return !("ollama".equalsIgnoreCase(providerName) ||
                 "local".equalsIgnoreCase(providerName));
    }

    // ========================================================================
    // Circuit Breaker
    // ========================================================================

    private boolean isCircuitOpen(String providerName) {
        CircuitBreakerState state = circuitBreakers.get(providerName);
        if (state == null) return false;

        if (state.isOpen()) {
            // Check if recovery period has passed
            if (System.currentTimeMillis() - state.lastFailureTime > state.recoveryDelayMs) {
                state.halfOpen = true;
                LOG.infof("Circuit breaker for %s is now half-open", providerName);
                return false;
            }
            return true;
        }
        return false;
    }

    private void recordCircuitSuccess(String providerName) {
        CircuitBreakerState state = circuitBreakers.get(providerName);
        if (state != null) {
            if (state.halfOpen) {
                state.successCount.incrementAndGet();
                if (state.successCount.get() >= state.successThreshold) {
                    state.reset();
                    LOG.infof("Circuit breaker for %s is now closed", providerName);
                }
            } else {
                state.failureCount.set(0);
            }
        }
    }

    private void recordCircuitFailure(String providerName) {
        CircuitBreakerState state = circuitBreakers.computeIfAbsent(
                providerName, k -> new CircuitBreakerState());

        state.failureCount.incrementAndGet();
        state.lastFailureTime = System.currentTimeMillis();

        if (state.halfOpen) {
            state.open = true;
            state.halfOpen = false;
            LOG.warnf("Circuit breaker for %s is now open (failed in half-open)", providerName);
        } else if (state.failureCount.get() >= state.failureThreshold) {
            state.open = true;
            LOG.warnf("Circuit breaker for %s is now open (failure threshold reached)", providerName);
        }
    }

    // ========================================================================
    // Metrics
    // ========================================================================

    private void recordSuccess(String provider, long durationMs) {
        meterRegistry.counter("llm.resilience.success", "provider", provider).increment();
        meterRegistry.timer("llm.resilience.duration", "provider", provider, "status", "success")
                .record(Duration.ofMillis(durationMs));
    }

    private void recordFailure(String provider, long durationMs) {
        meterRegistry.counter("llm.resilience.failure", "provider", provider).increment();
        meterRegistry.timer("llm.resilience.duration", "provider", provider, "status", "failure")
                .record(Duration.ofMillis(durationMs));
    }

    private void recordFailover(String fromProvider, String toProvider) {
        meterRegistry.counter("llm.resilience.failover",
                "from", fromProvider, "to", toProvider).increment();
        LOG.infof("LLM failover: %s -> %s", fromProvider, toProvider);
    }

    private void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    // ========================================================================
    // Configuration
    // ========================================================================

    /**
     * Resilience configuration.
     */
    public static class ResilienceConfig {
        private int maxRetries = 3;
        private long initialBackoffMs = 1000;
        private long maxBackoffMs = 30000;
        private long timeoutMs = 60000;
        private List<String> fallbackProviders;
        private List<String> retryableErrors;

        // Circuit breaker settings
        private int circuitBreakerFailureThreshold = 5;
        private long circuitBreakerRecoveryDelayMs = 60000;
        private int circuitBreakerSuccessThreshold = 3;

        public static ResilienceConfig defaults() {
            return new ResilienceConfig();
        }

        public static Builder builder() {
            return new Builder();
        }

        // Getters
        public int getMaxRetries() { return maxRetries; }
        public long getInitialBackoffMs() { return initialBackoffMs; }
        public long getMaxBackoffMs() { return maxBackoffMs; }
        public long getTimeoutMs() { return timeoutMs; }
        public List<String> getFallbackProviders() { return fallbackProviders; }
        public List<String> getRetryableErrors() { return retryableErrors; }
        public int getCircuitBreakerFailureThreshold() { return circuitBreakerFailureThreshold; }
        public long getCircuitBreakerRecoveryDelayMs() { return circuitBreakerRecoveryDelayMs; }
        public int getCircuitBreakerSuccessThreshold() { return circuitBreakerSuccessThreshold; }

        public static class Builder {
            private final ResilienceConfig config = new ResilienceConfig();

            public Builder maxRetries(int maxRetries) {
                config.maxRetries = maxRetries;
                return this;
            }

            public Builder initialBackoffMs(long initialBackoffMs) {
                config.initialBackoffMs = initialBackoffMs;
                return this;
            }

            public Builder maxBackoffMs(long maxBackoffMs) {
                config.maxBackoffMs = maxBackoffMs;
                return this;
            }

            public Builder timeoutMs(long timeoutMs) {
                config.timeoutMs = timeoutMs;
                return this;
            }

            public Builder fallbackProviders(List<String> fallbackProviders) {
                config.fallbackProviders = fallbackProviders;
                return this;
            }

            public Builder retryableErrors(List<String> retryableErrors) {
                config.retryableErrors = retryableErrors;
                return this;
            }

            public Builder circuitBreakerFailureThreshold(int threshold) {
                config.circuitBreakerFailureThreshold = threshold;
                return this;
            }

            public Builder circuitBreakerRecoveryDelayMs(long delayMs) {
                config.circuitBreakerRecoveryDelayMs = delayMs;
                return this;
            }

            public Builder circuitBreakerSuccessThreshold(int threshold) {
                config.circuitBreakerSuccessThreshold = threshold;
                return this;
            }

            public ResilienceConfig build() {
                return config;
            }
        }
    }

    /**
     * Circuit breaker state for a provider.
     */
    private static class CircuitBreakerState {
        volatile boolean open = false;
        volatile boolean halfOpen = false;
        final AtomicInteger failureCount = new AtomicInteger(0);
        final AtomicInteger successCount = new AtomicInteger(0);
        volatile long lastFailureTime = 0;

        // Configurable thresholds
        int failureThreshold = 5;
        long recoveryDelayMs = 60000;
        int successThreshold = 3;

        boolean isOpen() {
            return open && !halfOpen;
        }

        void reset() {
            open = false;
            halfOpen = false;
            failureCount.set(0);
            successCount.set(0);
        }
    }
}
