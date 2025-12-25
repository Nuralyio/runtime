package com.nuraly.library.permission;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Client for calling the Permission API to manage resource permissions.
 * Can be injected into services to check or grant permissions programmatically.
 */
@ApplicationScoped
public class PermissionClient {

    private static final Logger LOGGER = Logger.getLogger(PermissionClient.class.getName());
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    @ConfigProperty(name = "permission.api.base-url", defaultValue = "http://localhost/api")
    String permissionApiBaseUrl;

    /**
     * Initialize owner permissions for a newly created resource.
     * Grants full permissions (read, write, delete, execute, share) to the creator.
     *
     * @param resourceType The type of resource (e.g., "function", "page")
     * @param resourceId   The ID of the resource
     * @param userId       The UUID of the user who should own the resource
     * @return true if successful, false otherwise
     */
    public boolean initOwnerPermissions(String resourceType, String resourceId, String userId) {
        if (userId == null || userId.isEmpty()) {
            LOGGER.warning("Cannot init owner permissions: userId is null or empty");
            return false;
        }

        String url = permissionApiBaseUrl + "/resources/" + resourceType + "/" + resourceId + "/init-owner";

        try {
            Map<String, String> body = new HashMap<>();
            body.put("userId", userId);
            String jsonBody = objectMapper.writeValueAsString(body);

            HttpURLConnection connection = createPostConnection(url, jsonBody);
            int statusCode = connection.getResponseCode();

            if (statusCode >= 200 && statusCode < 300) {
                LOGGER.fine("Successfully initialized owner permissions for " + resourceType + "/" + resourceId);
                return true;
            } else {
                LOGGER.warning("Failed to init owner permissions: HTTP " + statusCode);
                return false;
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error calling permission API: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Check if a user has a specific permission on a resource.
     *
     * @param request The permission check request
     * @return true if user has permission, false otherwise
     */
    public boolean hasPermission(PermissionCheckRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);
            String url = permissionApiBaseUrl + "/permissions/has";

            HttpURLConnection connection = createPostConnection(url, payload);
            int responseCode = connection.getResponseCode();

            return responseCode == 200;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to check permission: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Check if anonymous access is allowed for a specific resource and permission.
     * Uses the existing /check-anonymous endpoint.
     *
     * @param resourceType   The type of resource (e.g., "function", "page")
     * @param resourceId     The ID of the resource
     * @param permissionType The permission to check (e.g., "function:execute")
     * @return true if anonymous access is allowed, false otherwise
     */
    public boolean checkAnonymousAccess(String resourceType, String resourceId, String permissionType) {
        try {
            String url = permissionApiBaseUrl + "/resources/" + resourceType + "/" + resourceId
                       + "/check-anonymous?permission=" + java.net.URLEncoder.encode(permissionType, StandardCharsets.UTF_8);

            HttpURLConnection connection = (HttpURLConnection) new java.net.URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);

            int responseCode = connection.getResponseCode();

            if (responseCode == 200) {
                try (java.io.InputStream is = connection.getInputStream()) {
                    JsonNode json = objectMapper.readTree(is);
                    return json.has("allowed") && json.get("allowed").asBoolean(false);
                }
            }
            return false;
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to check anonymous access: " + e.getMessage());
            return false;
        }
    }

    /**
     * Get list of resource IDs the user can access.
     *
     * @param resourceType The type of resource (e.g., "function")
     * @param userHeader   The X-USER header value (JSON string with user info)
     * @return List of accessible resource IDs
     */
    public List<String> getAccessibleResources(String resourceType, String userHeader) {
        List<String> result = new ArrayList<>();
        String url = permissionApiBaseUrl + "/resources/" + resourceType + "/accessible";

        try {
            HttpURLConnection connection = createGetConnection(url, userHeader);
            int statusCode = connection.getResponseCode();

            if (statusCode == 200) {
                StringBuilder response = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                }

                JsonNode json = objectMapper.readTree(response.toString());
                JsonNode resourceIds = json.get("resourceIds");
                if (resourceIds != null && resourceIds.isArray()) {
                    for (JsonNode id : resourceIds) {
                        result.add(id.asText());
                    }
                }
            } else {
                LOGGER.warning("Failed to get accessible resources: HTTP " + statusCode);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error getting accessible resources: " + e.getMessage(), e);
        }

        return result;
    }

    /**
     * Create HTTP GET connection with X-USER header.
     */
    private HttpURLConnection createGetConnection(String urlString, String userHeader) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(urlString).openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Content-Type", "application/json");
        if (userHeader != null && !userHeader.isEmpty()) {
            connection.setRequestProperty("X-USER", userHeader);
        }
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        return connection;
    }

    /**
     * Create HTTP POST connection.
     */
    private HttpURLConnection createPostConnection(String urlString, String payload) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(urlString).openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        connection.setDoOutput(true);

        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = payload.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        return connection;
    }
}
