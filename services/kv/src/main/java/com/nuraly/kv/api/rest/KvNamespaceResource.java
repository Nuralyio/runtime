package com.nuraly.kv.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.CreateKvNamespaceRequest;
import com.nuraly.kv.dto.KvNamespaceDTO;
import com.nuraly.kv.dto.UpdateKvNamespaceRequest;
import com.nuraly.kv.exception.KvNamespaceNotFoundException;
import com.nuraly.kv.service.KvNamespaceService;
import com.nuralyio.shared.permission.RequiresPermission;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/v1/kv/namespaces")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "KV Namespaces", description = "Operations for managing KV namespaces")
public class KvNamespaceResource {

    @Inject
    KvNamespaceService namespaceService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GET
    @Operation(summary = "List all namespaces")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Namespaces retrieved successfully")
    })
    public RestResponse<List<KvNamespaceDTO>> listNamespaces(
            @HeaderParam("X-USER") String userHeader,
            @QueryParam("applicationId") String applicationId) {
        List<KvNamespaceDTO> namespaces = namespaceService.listNamespaces(applicationId, userHeader);
        return RestResponse.ok(namespaces);
    }

    @GET
    @Path("/{id}")
    @RequiresPermission(
        permissionType = "kv-namespace:read",
        resourceType = "kv-namespace",
        resourceId = "#{id}"
    )
    @Operation(summary = "Get namespace by ID")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Namespace retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<KvNamespaceDTO> getNamespace(@PathParam("id") UUID id) {
        try {
            KvNamespaceDTO namespace = namespaceService.getNamespaceById(id);
            return RestResponse.ok(namespace);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Operation(summary = "Create a new namespace")
    @APIResponses(value = {
        @APIResponse(responseCode = "201", description = "Namespace created successfully"),
        @APIResponse(responseCode = "400", description = "Invalid request")
    })
    public RestResponse<KvNamespaceDTO> createNamespace(
            @HeaderParam("X-USER") String userHeader,
            @Valid CreateKvNamespaceRequest request) {
        String userUuid = extractUserUuid(userHeader);
        KvNamespaceDTO created = namespaceService.createNamespace(request, userUuid);
        return RestResponse.status(RestResponse.Status.CREATED, created);
    }

    @PUT
    @Path("/{id}")
    @RequiresPermission(
        permissionType = "kv-namespace:write",
        resourceType = "kv-namespace",
        resourceId = "#{id}"
    )
    @Operation(summary = "Update a namespace")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Namespace updated successfully"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<KvNamespaceDTO> updateNamespace(
            @PathParam("id") UUID id,
            @HeaderParam("X-USER") String userHeader,
            @Valid UpdateKvNamespaceRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            KvNamespaceDTO updated = namespaceService.updateNamespace(id, request, userUuid);
            return RestResponse.ok(updated);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/{id}")
    @RequiresPermission(
        permissionType = "kv-namespace:delete",
        resourceType = "kv-namespace",
        resourceId = "#{id}"
    )
    @Operation(summary = "Delete a namespace")
    @APIResponses(value = {
        @APIResponse(responseCode = "204", description = "Namespace deleted successfully"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<Void> deleteNamespace(@PathParam("id") UUID id) {
        try {
            namespaceService.deleteNamespace(id);
            return RestResponse.noContent();
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    private String extractUserUuid(String userHeader) {
        if (userHeader == null || userHeader.isEmpty()) {
            return null;
        }
        try {
            Map<String, Object> user = objectMapper.readValue(userHeader, Map.class);
            return (String) user.get("uuid");
        } catch (Exception e) {
            return null;
        }
    }
}
