package com.nuraly.library.permission;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.lang.reflect.Method;
import java.net.HttpURLConnection;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * JAX-RS filter that intercepts requests and enforces @RequiresPermission checks.
 *
 * Matching the API service authorization patterns:
 * 1. First checks direct resource permissions (user, public, anonymous)
 * 2. Then checks application-level role permissions if applicationId is provided
 * 3. Supports dynamic placeholder resolution for path/query parameters
 * 4. Allows anonymous/public access if explicitly configured
 */
@Provider
@Priority(Priorities.AUTHORIZATION)
public class PermissionInterceptor implements ContainerRequestFilter {

    private static final Logger LOGGER = Logger.getLogger(PermissionInterceptor.class.getName());
    private static final String X_USER_HEADER = "X-USER";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Context
    private ResourceInfo resourceInfo;

    @Inject
    @ConfigProperty(name = "permissions.api.url")
    String permissionsApiUrl;

    @Inject
    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    boolean permissionsEnabled;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // Skip if permissions are disabled (e.g., in dev mode)
        if (!permissionsEnabled) {
            LOGGER.fine("Permission checks disabled");
            return;
        }

        Method resourceMethod = resourceInfo.getResourceMethod();
        if (resourceMethod == null) {
            return;
        }

        // Check method-level annotation first, then class-level
        RequiresPermission permissionAnno = resourceMethod.getAnnotation(RequiresPermission.class);
        if (permissionAnno == null) {
            permissionAnno = resourceInfo.getResourceClass().getAnnotation(RequiresPermission.class);
        }

        if (permissionAnno == null) {
            return; // No permission annotation, allow access
        }

        // Parse user from X-USER header
        NUser user = extractUser(requestContext);

        // Check if anonymous access is allowed and user is anonymous
        if (user.isAnonymous()) {
            if (permissionAnno.allowAnonymous()) {
                // Check if resource has anonymous permission via API
                if (checkAnonymousAccess(permissionAnno, requestContext)) {
                    LOGGER.fine("Anonymous access granted for resource");
                    return;
                }
            }
            throw new PermissionDeniedException("Authentication required");
        }

        // Check if public access is allowed (authenticated user accessing public resource)
        if (permissionAnno.allowPublic()) {
            if (checkPublicAccess(permissionAnno, requestContext)) {
                LOGGER.fine("Public access granted for resource");
                return;
            }
        }

        // Build permission check request
        PermissionCheckRequest checkRequest = buildPermissionCheckRequest(user, permissionAnno, requestContext);

        // Perform permission check
        if (!userHasPermission(checkRequest)) {
            String resourceId = resolvePlaceholder(permissionAnno.resourceId(), requestContext);
            throw new PermissionDeniedException(
                "Permission denied: " + permissionAnno.permissionType() +
                " on " + permissionAnno.resourceType() +
                (!"*".equals(resourceId) ? " [" + resourceId + "]" : "")
            );
        }
    }

    /**
     * Extract user from X-USER header.
     */
    private NUser extractUser(ContainerRequestContext requestContext) {
        String userHeader = requestContext.getHeaderString(X_USER_HEADER);

        if (userHeader == null || userHeader.isEmpty()) {
            return NUser.anonymous();
        }

        try {
            return objectMapper.readValue(userHeader, NUser.class);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to parse X-USER header: " + e.getMessage());
            return NUser.anonymous();
        }
    }

    /**
     * Build permission check request from annotation and context.
     */
    private PermissionCheckRequest buildPermissionCheckRequest(
            NUser user,
            RequiresPermission permissionAnno,
            ContainerRequestContext requestContext) {

        return PermissionCheckRequest.builder()
                .userId(user.getUuid())
                .permissionType(permissionAnno.permissionType())
                .resourceType(permissionAnno.resourceType())
                .resourceId(resolvePlaceholder(permissionAnno.resourceId(), requestContext))
                .applicationId(resolvePlaceholder(permissionAnno.applicationId(), requestContext))
                .anonymous(user.isAnonymous())
                .build();
    }

    /**
     * Resolve placeholders dynamically from the request context.
     * Supports #{paramName} syntax for path and query parameters.
     */
    private String resolvePlaceholder(String template, ContainerRequestContext requestContext) {
        if (template == null || template.isEmpty()) {
            return template;
        }

        if (template.startsWith("#{") && template.endsWith("}")) {
            String paramName = template.substring(2, template.length() - 1);

            // Try path parameter first
            String pathValue = requestContext.getUriInfo().getPathParameters().getFirst(paramName);
            if (pathValue != null) {
                return pathValue;
            }

            // Try query parameter
            String queryValue = requestContext.getUriInfo().getQueryParameters().getFirst(paramName);
            if (queryValue != null) {
                return queryValue;
            }
        }

        return template;
    }

    /**
     * Check if resource allows anonymous access.
     */
    private boolean checkAnonymousAccess(RequiresPermission permissionAnno, ContainerRequestContext requestContext) {
        try {
            PermissionCheckRequest checkRequest = PermissionCheckRequest.builder()
                    .permissionType(permissionAnno.permissionType())
                    .resourceType(permissionAnno.resourceType())
                    .resourceId(resolvePlaceholder(permissionAnno.resourceId(), requestContext))
                    .granteeType(GranteeType.ANONYMOUS)
                    .anonymous(true)
                    .build();

            return userHasPermission(checkRequest);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to check anonymous access: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check if resource allows public access.
     */
    private boolean checkPublicAccess(RequiresPermission permissionAnno, ContainerRequestContext requestContext) {
        try {
            PermissionCheckRequest checkRequest = PermissionCheckRequest.builder()
                    .permissionType(permissionAnno.permissionType())
                    .resourceType(permissionAnno.resourceType())
                    .resourceId(resolvePlaceholder(permissionAnno.resourceId(), requestContext))
                    .granteeType(GranteeType.PUBLIC)
                    .build();

            return userHasPermission(checkRequest);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to check public access: " + e.getMessage());
            return false;
        }
    }

    /**
     * Check permission via the permissions API.
     */
    private boolean userHasPermission(PermissionCheckRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(request);
            HttpURLConnection connection = createConnection(payload);

            int responseCode = connection.getResponseCode();

            if (responseCode == 200) {
                return true;
            } else if (responseCode == 403) {
                return false;
            } else {
                LOGGER.warning("Unexpected response from permissions API: " + responseCode);
                return false;
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to check permission: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Create HTTP connection to the permissions API.
     */
    private HttpURLConnection createConnection(String payload) throws IOException {
        HttpURLConnection connection =
                (HttpURLConnection) new java.net.URL(permissionsApiUrl).openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        connection.setDoOutput(true);

        try (java.io.OutputStream os = connection.getOutputStream()) {
            byte[] input = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        return connection;
    }
}
