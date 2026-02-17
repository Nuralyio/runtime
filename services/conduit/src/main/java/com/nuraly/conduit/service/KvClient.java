package com.nuraly.conduit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.conduit.dto.DatabaseCredential;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Client for fetching database credentials from the KV service.
 * Uses Redis caching to reduce load on KV service.
 */
@ApplicationScoped
public class KvClient {

    private static final Logger LOG = Logger.getLogger(KvClient.class);

    @ConfigProperty(name = "kv.service.url")
    String kvServiceUrl;

    @ConfigProperty(name = "kv.service.timeout-ms", defaultValue = "5000")
    long kvServiceTimeoutMs;

    @Inject
    CredentialCacheService cacheService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Fetch database credentials from KV store with caching.
     *
     * @param connectionPath KV key path (e.g., "postgresql/production-db")
     * @param applicationId  Application ID for scoping
     * @return DatabaseCredential or null if not found
     */
    public DatabaseCredential getCredential(String connectionPath, String applicationId) {
        // Try cache first
        DatabaseCredential cached = cacheService.get(connectionPath, applicationId);
        if (cached != null) {
            return cached;
        }

        // Fetch from KV service
        DatabaseCredential credential = fetchFromKvService(connectionPath, applicationId);

        // Cache the result
        if (credential != null) {
            cacheService.put(connectionPath, applicationId, credential);
        }

        return credential;
    }

    /**
     * Fetch credential directly from KV service (bypasses cache).
     */
    public DatabaseCredential fetchFromKvService(String connectionPath, String applicationId) {
        try {
            String encodedPath = URLEncoder.encode(connectionPath, StandardCharsets.UTF_8);
            String url = String.format("%s/api/v1/kv/entries/%s?applicationId=%s",
                    kvServiceUrl, encodedPath, applicationId);

            LOG.debugf("Fetching credential from KV: %s", url);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofMillis(kvServiceTimeoutMs))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return parseCredential(response.body(), connectionPath);
            } else if (response.statusCode() == 404) {
                LOG.warnf("Credential not found: %s", connectionPath);
            } else {
                LOG.errorf("Failed to fetch credential: HTTP %d - %s", response.statusCode(), response.body());
            }

            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            LOG.errorf("Interrupted while fetching credential from KV: %s", e.getMessage());
            return null;
        } catch (Exception e) {
            LOG.errorf("Error fetching credential from KV: %s", e.getMessage());
            return null;
        }
    }

    private DatabaseCredential parseCredential(String body, String connectionPath) throws Exception {
        JsonNode kvEntry = objectMapper.readTree(body);
        if (!kvEntry.has("value")) {
            return null;
        }

        JsonNode valueNode = kvEntry.get("value");
        DatabaseCredential credential;
        if (valueNode.isTextual()) {
            credential = objectMapper.readValue(valueNode.asText(), DatabaseCredential.class);
        } else {
            credential = objectMapper.treeToValue(valueNode, DatabaseCredential.class);
        }

        if (credential.getType() == null && kvEntry.has("scope")) {
            credential.setType(kvEntry.get("scope").asText());
        }

        LOG.debugf("Successfully fetched credential for: %s", connectionPath);
        return credential;
    }

    /**
     * Check if a credential exists in KV store.
     */
    public boolean credentialExists(String connectionPath, String applicationId) {
        return getCredential(connectionPath, applicationId) != null;
    }

    /**
     * Invalidate cached credential (call when credential is updated).
     */
    public void invalidateCredential(String connectionPath, String applicationId) {
        cacheService.invalidate(connectionPath, applicationId);
    }

    /**
     * Refresh credential from KV service (bypasses and updates cache).
     */
    public DatabaseCredential refreshCredential(String connectionPath, String applicationId) {
        cacheService.invalidate(connectionPath, applicationId);
        return getCredential(connectionPath, applicationId);
    }
}
