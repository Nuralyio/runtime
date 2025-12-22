package com.nuraly.library.permission;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * JAX-RS ExceptionMapper for PermissionDeniedException.
 * Returns a standardized JSON error response with 403 Forbidden status.
 */
@Provider
public class PermissionDeniedExceptionMapper implements ExceptionMapper<PermissionDeniedException> {

    @Override
    public Response toResponse(PermissionDeniedException exception) {
        ErrorResponse errorResponse = new ErrorResponse(
            "PERMISSION_DENIED",
            exception.getMessage(),
            exception.getPermissionType(),
            exception.getResourceType(),
            exception.getResourceId()
        );

        return Response.status(Response.Status.FORBIDDEN)
                .type(MediaType.APPLICATION_JSON)
                .entity(errorResponse)
                .build();
    }

    /**
     * Standardized error response structure.
     */
    public static class ErrorResponse {
        private String code;
        private String message;
        private String permissionType;
        private String resourceType;
        private String resourceId;

        public ErrorResponse(String code, String message, String permissionType, String resourceType, String resourceId) {
            this.code = code;
            this.message = message;
            this.permissionType = permissionType;
            this.resourceType = resourceType;
            this.resourceId = resourceId;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
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
}
