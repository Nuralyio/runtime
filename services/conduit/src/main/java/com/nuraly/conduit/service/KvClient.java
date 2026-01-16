package com.nuraly.conduit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.conduit.dto.DatabaseCredential;
import jakarta.enterprise.context.ApplicationScoped;
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
 */
@ApplicationScoped
public class KvClient {

    private static final Logger LOG = Logger.getLogger(KvClient.class);

    @ConfigProperty(name = "kv.service.url")
    String kvServiceUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Fetch database credentials from KV store.
     *
     * @param connectionPath KV key path (e.g., "postgresql/production-db")
     * @param applicationId  Application ID for scoping
     * @return DatabaseCredential or null if not found
     */
    public DatabaseCredential getCredential(String connectionPath, String applicationId) {
        try {
            String encodedPath = URLEncoder.encode(connectionPath, StandardCharsets.UTF_8);
            String url = String.format("%s/api/v1/kv/entries/%s?applicationId=%s",
                    kvServiceUrl, encodedPath, applicationId);

            LOG.debugf("Fetching credential from KV: %s", url);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode kvEntry = objectMapper.readTree(response.body());

                if (kvEntry.has("value")) {
                    JsonNode valueNode = kvEntry.get("value");

                    // Value might be a JSON string or already parsed object
                    DatabaseCredential credential;
                    if (valueNode.isTextual()) {
                        // Value is a JSON string, need to parse it
                        credential = objectMapper.readValue(valueNode.asText(), DatabaseCredential.class);
                    } else {
                        // Value is already a JSON object
                        credential = objectMapper.treeToValue(valueNode, DatabaseCredential.class);
                    }

                    // Infer type from scope if not set
                    if (credential.getType() == null && kvEntry.has("scope")) {
                        credential.setType(kvEntry.get("scope").asText());
                    }

                    LOG.debugf("Successfully fetched credential for: %s", connectionPath);
                    return credential;
                }
            } else if (response.statusCode() == 404) {
                LOG.warnf("Credential not found: %s", connectionPath);
            } else {
                LOG.errorf("Failed to fetch credential: HTTP %d - %s", response.statusCode(), response.body());
            }

            return null;
        } catch (Exception e) {
            LOG.errorf("Error fetching credential from KV: %s", e.getMessage());
            return null;
        }
    }

    /**
     * Check if a credential exists in KV store.
     */
    public boolean credentialExists(String connectionPath, String applicationId) {
        return getCredential(connectionPath, applicationId) != null;
    }
}
