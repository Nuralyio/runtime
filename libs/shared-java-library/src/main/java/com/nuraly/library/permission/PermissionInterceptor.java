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
import java.util.HashMap;
import java.util.Map;

/**
 * Intercepts requests to JAX-RS resource methods
 * and enforces @RequiresPermission checks with dynamic values.
 */
@Provider
@Priority(Priorities.AUTHORIZATION)
public class PermissionInterceptor implements ContainerRequestFilter {

    @Context
    private ResourceInfo resourceInfo;

    @Inject
    @ConfigProperty(name = "permissions.api.url")
    String permissionsApiUrl;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        Method resourceMethod = resourceInfo.getResourceMethod();
        if (resourceMethod == null) {
            return; // No resource method means this is not a JAX-RS endpoint
        }

        // Check if the method has the @RequiresPermission annotation
        RequiresPermission permissionAnno = resourceMethod.getAnnotation(RequiresPermission.class);
        if (permissionAnno == null) {
            return; // No @RequiresPermission annotation; skip further checks
        }
        String user = requestContext.getHeaderString("X-USER");
        if (user == null || user.isEmpty()) {
            throw new PermissionDeniedException("Missing or empty X-USER header");
        } else {
            System.out.println("User ID: " + user);
        }

        JsonNode userNode = new ObjectMapper().readTree(user);


        // Extract parameters from the annotation
        Map<String, Object> params = extractAnnotationParams(permissionAnno, requestContext);

        // Add user dynamically
        params.put("userId", userNode.get("uuid").asText());

        // Perform the permission check
        boolean hasPermission = userHasPermission(params);
        if (!hasPermission) {
            throw new PermissionDeniedException("Permission denied for permissionType: " + permissionAnno.permissionType());
        }
    }

    /**
     * Extract parameters from the annotation, resolving placeholders dynamically.
     */
    private Map<String, Object> extractAnnotationParams(RequiresPermission permissionAnno, ContainerRequestContext requestContext) {
        Map<String, Object> params = new HashMap<>();
        params.put("permissionType", permissionAnno.permissionType());
        params.put("resourceType", permissionAnno.resourceType());
        params.put("resourceId", resolvePlaceholder(permissionAnno.resourceId(), requestContext));
        return params;
    }

    /**
     * Resolve placeholders dynamically from the request context.
     */
    private String resolvePlaceholder(String template, ContainerRequestContext requestContext) {
        if (template.startsWith("#{") && template.endsWith("}")) {
            String paramName = template.substring(2, template.length() - 1);

            // Retrieve parameter from the request path
            String pathParamValue = requestContext.getUriInfo().getPathParameters().getFirst(paramName);
            if (pathParamValue != null) {
                return pathParamValue;
            }

            // Retrieve parameter from the query string
            String queryParamValue = requestContext.getUriInfo().getQueryParameters().getFirst(paramName);
            if (queryParamValue != null) {
                return queryParamValue;
            }
        }
        return template; // Return the template if no dynamic value is found
    }

    /**
     * Custom logic to verify if the current user has the needed permission.
     */
    private boolean userHasPermission(Map<String, Object> params) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String payload = objectMapper.writeValueAsString(params);

            HttpURLConnection connection = getHttpURLConnection(payload);

            int responseCode = connection.getResponseCode();

            return responseCode == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private HttpURLConnection getHttpURLConnection(String payload) throws IOException {
        HttpURLConnection connection =
                (HttpURLConnection) new java.net.URL(permissionsApiUrl).openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setDoOutput(true);

        // Write the payload
        try (java.io.OutputStream os = connection.getOutputStream()) {
            byte[] input = payload.getBytes("utf-8");
            os.write(input, 0, input.length);
        }
        return connection;
    }
}