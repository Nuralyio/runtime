package com.nuraly.kv.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.*;
import com.nuraly.kv.exception.KvEntryNotFoundException;
import com.nuraly.kv.exception.KvNamespaceNotFoundException;
import com.nuraly.kv.exception.KvVersionConflictException;
import com.nuraly.kv.service.KvEntryService;
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

@Path("/api/v1/kv/{namespaceId}")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "KV Entries", description = "Operations for managing KV entries")
public class KvEntryResource {

    @Inject
    KvEntryService entryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GET
    @Path("/entries")
    @RequiresPermission(
        permissionType = "kv-entry:read",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "List entries in a namespace")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entries retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<List<KvEntryDTO>> listEntries(
            @PathParam("namespaceId") UUID namespaceId,
            @QueryParam("prefix") String prefix) {
        try {
            List<KvEntryDTO> entries = entryService.listEntries(namespaceId, prefix);
            return RestResponse.ok(entries);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/entries/{keyPath: .+}")
    @RequiresPermission(
        permissionType = "kv-entry:read",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Get an entry by key")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entry retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<KvEntryDTO> getEntry(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader) {
        try {
            String userId = extractUserUuid(userHeader);
            KvEntryDTO entry = entryService.getEntry(namespaceId, keyPath, userId);
            return RestResponse.ok(entry);
        } catch (KvNamespaceNotFoundException | KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @PUT
    @Path("/entries/{keyPath: .+}")
    @RequiresPermission(
        permissionType = "kv-entry:write",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Set an entry value")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entry set successfully"),
        @APIResponse(responseCode = "404", description = "Namespace not found"),
        @APIResponse(responseCode = "409", description = "Version conflict")
    })
    public RestResponse<KvEntryDTO> setEntry(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            @Valid SetKvEntryRequest request) {
        try {
            String userId = extractUserUuid(userHeader);
            KvEntryDTO entry = entryService.setEntry(namespaceId, keyPath, request, userId);
            return RestResponse.ok(entry);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (KvVersionConflictException e) {
            return RestResponse.status(RestResponse.Status.CONFLICT);
        }
    }

    @DELETE
    @Path("/entries/{keyPath: .+}")
    @RequiresPermission(
        permissionType = "kv-entry:delete",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Delete an entry")
    @APIResponses(value = {
        @APIResponse(responseCode = "204", description = "Entry deleted successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<Void> deleteEntry(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader) {
        try {
            String userId = extractUserUuid(userHeader);
            entryService.deleteEntry(namespaceId, keyPath, userId);
            return RestResponse.noContent();
        } catch (KvNamespaceNotFoundException | KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/bulk/get")
    @RequiresPermission(
        permissionType = "kv-entry:read",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Bulk get entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk get completed"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<BulkOperationResponse> bulkGet(
            @PathParam("namespaceId") UUID namespaceId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkGetRequest request) {
        try {
            String userId = extractUserUuid(userHeader);
            BulkOperationResponse response = entryService.bulkGet(namespaceId, request, userId);
            return RestResponse.ok(response);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/bulk/set")
    @RequiresPermission(
        permissionType = "kv-entry:write",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Bulk set entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk set completed"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<BulkOperationResponse> bulkSet(
            @PathParam("namespaceId") UUID namespaceId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkSetRequest request) {
        try {
            String userId = extractUserUuid(userHeader);
            BulkOperationResponse response = entryService.bulkSet(namespaceId, request, userId);
            return RestResponse.ok(response);
        } catch (KvNamespaceNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/bulk/delete")
    @RequiresPermission(
        permissionType = "kv-entry:delete",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Bulk delete entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk delete completed"),
        @APIResponse(responseCode = "404", description = "Namespace not found")
    })
    public RestResponse<BulkOperationResponse> bulkDelete(
            @PathParam("namespaceId") UUID namespaceId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkDeleteRequest request) {
        try {
            String userId = extractUserUuid(userHeader);
            BulkOperationResponse response = entryService.bulkDelete(namespaceId, request, userId);
            return RestResponse.ok(response);
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
