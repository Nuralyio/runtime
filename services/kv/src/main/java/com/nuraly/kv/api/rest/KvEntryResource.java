package com.nuraly.kv.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.*;
import com.nuraly.kv.exception.KvEntryNotFoundException;
import com.nuraly.kv.exception.KvVersionConflictException;
import com.nuraly.kv.service.KvEntryService;
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

@Path("/api/v1/kv")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "KV Entries", description = "Operations for managing KV entries")
public class KvEntryResource {

    @Inject
    KvEntryService entryService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GET
    @Path("/entries")
    @Operation(summary = "List entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entries retrieved successfully")
    })
    public RestResponse<List<KvEntryDTO>> listEntries(
            @QueryParam("applicationId") String applicationId,
            @QueryParam("scope") String scope,
            @QueryParam("scopedResourceId") String scopedResourceId,
            @QueryParam("prefix") String prefix) {
        // applicationId is optional - if not provided, returns all entries
        List<KvEntryDTO> entries = entryService.listEntries(applicationId, scope, scopedResourceId, prefix);
        return RestResponse.ok(entries);
    }

    @GET
    @Path("/entries/{keyPath: .+}")
    @Operation(summary = "Get an entry by key")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entry retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<KvEntryDTO> getEntry(
            @QueryParam("applicationId") String applicationId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        try {
            String userId = extractUserUuid(userHeader);
            KvEntryDTO entry = entryService.getEntry(applicationId, keyPath, userId);
            return RestResponse.ok(entry);
        } catch (KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @PUT
    @Path("/entries/{keyPath: .+}")
    @Operation(summary = "Set an entry value")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Entry set successfully"),
        @APIResponse(responseCode = "409", description = "Version conflict")
    })
    public RestResponse<KvEntryDTO> setEntry(
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            @Valid SetKvEntryRequest request) {
        try {
            String userId = extractUserUuid(userHeader);
            KvEntryDTO entry = entryService.setEntry(keyPath, request, userId);
            return RestResponse.ok(entry);
        } catch (KvVersionConflictException e) {
            return RestResponse.status(RestResponse.Status.CONFLICT);
        }
    }

    @DELETE
    @Path("/entries/{keyPath: .+}")
    @Operation(summary = "Delete an entry")
    @APIResponses(value = {
        @APIResponse(responseCode = "204", description = "Entry deleted successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<Void> deleteEntry(
            @QueryParam("applicationId") String applicationId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        try {
            String userId = extractUserUuid(userHeader);
            entryService.deleteEntry(applicationId, keyPath, userId);
            return RestResponse.noContent();
        } catch (KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/entries/{keyPath: .+}/rotate")
    @Operation(summary = "Rotate a secret value")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Secret rotated successfully"),
        @APIResponse(responseCode = "404", description = "Entry not found"),
        @APIResponse(responseCode = "400", description = "Entry is not a secret")
    })
    public RestResponse<KvEntryDTO> rotateSecret(
            @QueryParam("applicationId") String applicationId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            Map<String, Object> body) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        try {
            String userId = extractUserUuid(userHeader);
            Object newValue = body.get("value");
            KvEntryDTO entry = entryService.rotateSecret(applicationId, keyPath, newValue, userId);
            return RestResponse.ok(entry);
        } catch (KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IllegalStateException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/entries/{keyPath: .+}/versions")
    @Operation(summary = "Get version history for an entry")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Version history retrieved"),
        @APIResponse(responseCode = "404", description = "Entry not found")
    })
    public RestResponse<List<KvEntryVersionDTO>> getVersionHistory(
            @QueryParam("applicationId") String applicationId,
            @PathParam("keyPath") String keyPath) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        try {
            List<KvEntryVersionDTO> versions = entryService.getVersionHistory(applicationId, keyPath);
            return RestResponse.ok(versions);
        } catch (KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/entries/{keyPath: .+}/rollback")
    @Operation(summary = "Rollback to a previous version")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Rollback successful"),
        @APIResponse(responseCode = "404", description = "Entry or version not found")
    })
    public RestResponse<KvEntryDTO> rollbackToVersion(
            @QueryParam("applicationId") String applicationId,
            @PathParam("keyPath") String keyPath,
            @HeaderParam("X-USER") String userHeader,
            Map<String, Object> body) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        try {
            String userId = extractUserUuid(userHeader);
            Long targetVersion = ((Number) body.get("version")).longValue();
            KvEntryDTO entry = entryService.rollbackToVersion(applicationId, keyPath, targetVersion, userId);
            return RestResponse.ok(entry);
        } catch (KvEntryNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/bulk/get")
    @Operation(summary = "Bulk get entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk get completed")
    })
    public RestResponse<BulkOperationResponse> bulkGet(
            @QueryParam("applicationId") String applicationId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkGetRequest request) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        String userId = extractUserUuid(userHeader);
        BulkOperationResponse response = entryService.bulkGet(applicationId, request, userId);
        return RestResponse.ok(response);
    }

    @POST
    @Path("/bulk/set")
    @Operation(summary = "Bulk set entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk set completed")
    })
    public RestResponse<BulkOperationResponse> bulkSet(
            @QueryParam("applicationId") String applicationId,
            @QueryParam("scope") String scope,
            @QueryParam("scopedResourceId") String scopedResourceId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkSetRequest request) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        String userId = extractUserUuid(userHeader);
        BulkOperationResponse response = entryService.bulkSet(applicationId, scope, scopedResourceId, request, userId);
        return RestResponse.ok(response);
    }

    @POST
    @Path("/bulk/delete")
    @Operation(summary = "Bulk delete entries")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Bulk delete completed")
    })
    public RestResponse<BulkOperationResponse> bulkDelete(
            @QueryParam("applicationId") String applicationId,
            @HeaderParam("X-USER") String userHeader,
            @Valid BulkDeleteRequest request) {
        if (applicationId == null || applicationId.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
        String userId = extractUserUuid(userHeader);
        BulkOperationResponse response = entryService.bulkDelete(applicationId, request, userId);
        return RestResponse.ok(response);
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
