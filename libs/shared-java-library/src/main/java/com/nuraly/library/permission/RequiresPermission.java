package com.nuraly.library.permission;

import jakarta.interceptor.InterceptorBinding;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;

/**
 * Annotation to enforce permission checks on JAX-RS resource methods.
 *
 * Supports dynamic value resolution using #{paramName} syntax for path/query parameters.
 *
 * Examples:
 * - @RequiresPermission(permissionType = "read", resourceType = "function", resourceId = "*")
 * - @RequiresPermission(permissionType = "write", resourceType = "page", resourceId = "#{id}")
 * - @RequiresPermission(permissionType = "execute", resourceType = "function", resourceId = "#{functionId}", applicationId = "#{appId}")
 */
@InterceptorBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RequiresPermission {
    /**
     * The permission type required (e.g., "read", "write", "delete", "share", "execute").
     * Also supports resource-scoped permissions like "page:read", "function:execute".
     */
    String permissionType();

    /**
     * The type of resource being accessed (e.g., "function", "page", "component", "application").
     */
    String resourceType();

    /**
     * The ID of the specific resource. Use "*" for all resources of the type.
     * Supports dynamic resolution with #{paramName} syntax.
     */
    String resourceId();

    /**
     * Optional application ID for role-based permission checks.
     * When provided, the system will also check application-level role permissions.
     * Supports dynamic resolution with #{paramName} syntax.
     */
    String applicationId() default "";

    /**
     * If true, allows anonymous access if the resource has anonymous permission granted.
     * Default is false.
     */
    boolean allowAnonymous() default false;

    /**
     * If true, allows public access if the resource has public permission granted.
     * Default is false.
     */
    boolean allowPublic() default false;
}
