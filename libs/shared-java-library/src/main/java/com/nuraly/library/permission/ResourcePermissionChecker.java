package com.nuraly.library.permission;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.logging.Logger;

/**
 * Generic permission checker for any resource type.
 *
 * This class provides a unified way to check permissions across all resource types
 * (functions, pages, components, workflows, etc.) using:
 * 1. Owner check - resource creator has all permissions
 * 2. Role-based inheritance - via ApplicationMember → ApplicationRole tables
 * 3. Direct grants - via ResourcePermission table
 *
 * Usage:
 * <pre>
 * permissionChecker.checkPermission(
 *     "function",           // resourceType
 *     "123",                // resourceId
 *     "app-456",            // applicationId (for role lookup)
 *     "user-uuid",          // userId
 *     "creator-uuid",       // ownerId (resource creator)
 *     "function:build"      // permissionType
 * );
 * </pre>
 */
@ApplicationScoped
public class ResourcePermissionChecker {

    private static final Logger LOGGER = Logger.getLogger(ResourcePermissionChecker.class.getName());

    @Inject
    PermissionClient permissionClient;

    /**
     * Check if user has permission on a resource.
     *
     * @param resourceType e.g., "function", "page", "component"
     * @param resourceId the resource ID
     * @param applicationId the application this resource belongs to (for role-based inheritance)
     * @param userId the user requesting access
     * @param ownerId the resource creator/owner (has all permissions on their resource)
     * @param permissionType scoped permission e.g., "function:read", "page:write"
     * @throws PermissionDeniedException if user doesn't have permission
     */
    public void checkPermission(
            String resourceType,
            String resourceId,
            String applicationId,
            String userId,
            String ownerId,
            String permissionType) throws PermissionDeniedException {

        // Authentication required
        if (userId == null || userId.isEmpty()) {
            throw new PermissionDeniedException("Authentication required");
        }

        // Owner has all permissions on their resource
        if (userId.equals(ownerId)) {
            LOGGER.fine("User " + userId + " is owner of " + resourceType + " [" + resourceId + "], access granted");
            return;
        }

        // Check via permission API (uses role tables and direct grants)
        PermissionCheckRequest request = PermissionCheckRequest.builder()
                .userId(userId)
                .permissionType(permissionType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .applicationId(applicationId)
                .build();

        LOGGER.fine("Checking permission: " + permissionType + " on " + resourceType + " [" + resourceId +
                   "] for user " + userId + " in app " + applicationId);

        if (!permissionClient.hasPermission(request)) {
            throw new PermissionDeniedException(
                "Permission denied: " + permissionType + " on " + resourceType + " [" + resourceId + "]"
            );
        }

        LOGGER.fine("Permission granted: " + permissionType + " on " + resourceType + " [" + resourceId + "]");
    }

    /**
     * Check if user has permission without throwing exception.
     *
     * @return true if user has permission, false otherwise
     */
    public boolean hasPermission(
            String resourceType,
            String resourceId,
            String applicationId,
            String userId,
            String ownerId,
            String permissionType) {

        // No user = no permission
        if (userId == null || userId.isEmpty()) {
            return false;
        }

        // Owner has all permissions
        if (userId.equals(ownerId)) {
            return true;
        }

        // Check via permission API
        PermissionCheckRequest request = PermissionCheckRequest.builder()
                .userId(userId)
                .permissionType(permissionType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .applicationId(applicationId)
                .build();

        return permissionClient.hasPermission(request);
    }

    /**
     * Check permission for anonymous users.
     * Only succeeds if the resource has been explicitly made accessible to anonymous users.
     *
     * @param resourceType e.g., "function", "page"
     * @param resourceId the resource ID
     * @param permissionType the required permission
     * @throws PermissionDeniedException if anonymous access is not allowed
     */
    public void checkAnonymousPermission(
            String resourceType,
            String resourceId,
            String permissionType) throws PermissionDeniedException {

        if (!permissionClient.checkAnonymousAccess(resourceType, resourceId, permissionType)) {
            throw new PermissionDeniedException(
                "Anonymous access denied: " + permissionType + " on " + resourceType + " [" + resourceId + "]"
            );
        }
    }
}
