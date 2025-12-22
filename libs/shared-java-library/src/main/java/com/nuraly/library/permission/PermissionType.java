package com.nuraly.library.permission;

/**
 * Enumeration of permission types matching the API service patterns.
 * Supports both simple permissions and resource-scoped permissions.
 */
public enum PermissionType {
    // Simple permissions
    READ("read"),
    WRITE("write"),
    DELETE("delete"),
    SHARE("share"),
    EXECUTE("execute"),
    CREATE("create"),

    // Resource-scoped permissions (can be extended per resource type)
    PAGE_CREATE("page:create"),
    PAGE_READ("page:read"),
    PAGE_WRITE("page:write"),
    PAGE_DELETE("page:delete"),
    PAGE_SHARE("page:share"),

    COMPONENT_CREATE("component:create"),
    COMPONENT_READ("component:read"),
    COMPONENT_WRITE("component:write"),
    COMPONENT_DELETE("component:delete"),
    COMPONENT_SHARE("component:share"),

    FUNCTION_CREATE("function:create"),
    FUNCTION_READ("function:read"),
    FUNCTION_WRITE("function:write"),
    FUNCTION_DELETE("function:delete"),
    FUNCTION_EXECUTE("function:execute"),
    FUNCTION_DEPLOY("function:deploy"),
    FUNCTION_BUILD("function:build"),

    APPLICATION_READ("application:read"),
    APPLICATION_WRITE("application:write"),
    APPLICATION_DELETE("application:delete"),

    MEMBER_INVITE("member:invite"),
    MEMBER_UPDATE("member:update"),
    MEMBER_REMOVE("member:remove"),

    // Wildcard permissions
    ALL("*");

    private final String value;

    PermissionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    /**
     * Check if this permission type matches the required permission.
     * Supports wildcard matching:
     * - "*" matches everything
     * - "page:*" matches all page permissions
     */
    public boolean matches(String requiredPermission) {
        if (this == ALL || "*".equals(this.value)) {
            return true;
        }

        if (this.value.equals(requiredPermission)) {
            return true;
        }

        // Check for resource wildcard (e.g., "page:*" matches "page:read")
        if (this.value.endsWith(":*") && requiredPermission.contains(":")) {
            String resourceType = this.value.substring(0, this.value.indexOf(':'));
            String requiredResource = requiredPermission.substring(0, requiredPermission.indexOf(':'));
            return resourceType.equals(requiredResource);
        }

        return false;
    }

    public static PermissionType fromValue(String value) {
        for (PermissionType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}
