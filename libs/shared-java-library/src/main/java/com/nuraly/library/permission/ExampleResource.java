package com.nuraly.library.permission;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;


@Path("/examples")
public class ExampleResource {
    @GET
    @Path("/secure-data")
    @RequiresPermission(
            permissionType = "write",
            resourceType = "function",
            resourceId = "functionid"
    )    public Response getSecureData() {
        return Response.ok("Seqqcure data accessed successfully!").build();
    }

    @GET
    @Path("/secure-allow")
    @RequiresPermission(
            permissionType = "writes",
            resourceType = "function",
            resourceId = "functionid"
    )
    public Response getSecureDataallow() {
        return Response.ok("Seqqcure data accessed successfully!").build();
    }
}