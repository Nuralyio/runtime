package com.nuraly.library.permission;

/**
 * Exception thrown when a user lacks the required permission to access a resource.
 */
public class PermissionDeniedException extends RuntimeException {

    private String permissionType;
    private String resourceType;
    private String resourceId;

    public PermissionDeniedException(String message) {
        super(message);
    }

    public PermissionDeniedException(String message, String permissionType, String resourceType, String resourceId) {
        super(message);
        this.permissionType = permissionType;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    public static PermissionDeniedException forResource(String permissionType, String resourceType, String resourceId) {
        String message = String.format(
            "Permission denied: %s on %s%s",
            permissionType,
            resourceType,
            resourceId != null && !"*".equals(resourceId) ? " [" + resourceId + "]" : ""
        );
        return new PermissionDeniedException(message, permissionType, resourceType, resourceId);
    }

    public static PermissionDeniedException authenticationRequired() {
        return new PermissionDeniedException("Authentication required");
    }

    public String getPermissionType() {
        return permissionType;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }
}
