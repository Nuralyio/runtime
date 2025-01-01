package com.nuraly.library.permission;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class PermissionDeniedExceptionMapper implements ExceptionMapper<PermissionDeniedException> {

    @Override
    public Response toResponse(PermissionDeniedException exception) {
        return Response.status(Response.Status.FORBIDDEN)
                .entity("{\"error\": \"" + exception.getMessage() + "\"}")
                .build();
    }
}