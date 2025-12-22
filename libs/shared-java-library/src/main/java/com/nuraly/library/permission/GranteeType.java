package com.nuraly.library.permission;

/**
 * Enumeration of grantee types matching the API service patterns.
 */
public enum GranteeType {
    /**
     * Direct access granted to a specific user by UUID.
     */
    USER("user"),

    /**
     * Access granted via application role membership.
     */
    ROLE("role"),

    /**
     * Public access - anyone with the link can access (authenticated or not).
     */
    PUBLIC("public"),

    /**
     * Anonymous access - explicitly granted for unauthenticated users.
     */
    ANONYMOUS("anonymous");

    private final String value;

    GranteeType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static GranteeType fromValue(String value) {
        for (GranteeType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        return null;
    }
}
