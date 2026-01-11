package com.nuraly.kv.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.KvEntryDTO;
import com.nuraly.kv.dto.KvEntryVersionDTO;
import com.nuraly.kv.exception.KvEntryNotFoundException;
import com.nuraly.kv.exception.KvNamespaceNotFoundException;
import com.nuraly.kv.service.KvEntryService;
import com.nuralyio.shared.permission.RequiresPermission;
import jakarta.inject.Inject;
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

@Path("/api/v1/kv/{namespaceId}/entries/{keyPath: .+}")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "KV Secrets", description = "Operations for secret rotation and versioning")
public class KvSecretResource {

    @Inject
    KvEntryService entryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @POST
    @Path("/rotate")
    @RequiresPermission(
        permissionType = "kv-secret:rotate",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Rotate a secret value")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Secret rotated successfully"),
        @APIResponse(responseCode = "400", description = "Not a secret namespace"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<KvEntryDTO> rotateSecret(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            Map<String, Object> body) {
        try {
            String userId = extractUserUuid(userHeader);
            Object newValue = body.get("value");
            if (newValue == null) {
                return RestResponse.status(RestResponse.Status.BAD_REQUEST);
            }
            KvEntryDTO rotated = entryService.rotateSecret(namespaceId, keyPath, newValue, userId);
            return RestResponse.ok(rotated);
        } catch (KvNamespaceNotFoundException | KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IllegalStateException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/versions")
    @RequiresPermission(
        permissionType = "kv-entry:read",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Get version history of an entry")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Version history retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<List<KvEntryVersionDTO>> getVersionHistory(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath) {
        try {
            List<KvEntryVersionDTO> versions = entryService.getVersionHistory(namespaceId, keyPath);
            return RestResponse.ok(versions);
        } catch (KvNamespaceNotFoundException | KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/rollback")
    @RequiresPermission(
        permissionType = "kv-secret:rotate",
        resourceType = "kv-namespace",
        resourceId = "#{namespaceId}"
    )
    @Operation(summary = "Rollback to a previous version")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Rollback successful"),
        @APIResponse(responseCode = "404", description = "Entry or version not found")
    })
    public RestResponse<KvEntryDTO> rollbackToVersion(
            @PathParam("namespaceId") UUID namespaceId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            @QueryParam("version") Long targetVersion) {
        try {
            if (targetVersion == null) {
                return RestResponse.status(RestResponse.Status.BAD_REQUEST);
            }
            String userId = extractUserUuid(userHeader);
            KvEntryDTO entry = entryService.rollbackToVersion(namespaceId, keyPath, targetVersion, userId);
            return RestResponse.ok(entry);
        } catch (KvNamespaceNotFoundException | KvEntryNotFoundException e) {
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
