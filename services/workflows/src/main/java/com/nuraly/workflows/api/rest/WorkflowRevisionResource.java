package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.ExecuteWorkflowRequest;
import com.nuraly.workflows.dto.WorkflowExecutionDTO;
import com.nuraly.workflows.dto.revision.*;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.RevisionNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowExecutionService;
import com.nuraly.workflows.service.WorkflowRevisionService;
import com.nuraly.library.permission.RequiresPermission;
import io.smallrye.common.annotation.Blocking;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.Map;
import java.util.UUID;

@Path("/api/v1/workflows/{workflowId}/revisions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Revisions", description = "Operations related to workflow revision and publishing")
@Blocking
public class WorkflowRevisionResource {

    @Inject
    WorkflowRevisionService revisionService;

    @Inject
    WorkflowExecutionService executionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== Revision CRUD ====================

    @POST
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Create a new revision", description = "Snapshot the current workflow state as a new revision")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Revision created successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowRevisionDTO> createRevision(
            @PathParam("workflowId") UUID workflowId,
            @HeaderParam("X-USER") String userHeader,
            @Valid CreateRevisionRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowRevisionDTO revision = revisionService.createRevision(workflowId, userUuid, request);
            return RestResponse.status(RestResponse.Status.CREATED, revision);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "List all revisions", description = "List all revisions for a workflow with pagination")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Revisions retrieved successfully"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<ListRevisionsResponse> listRevisions(
            @PathParam("workflowId") UUID workflowId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("limit") @DefaultValue("20") int limit) {
        ListRevisionsResponse response = revisionService.listRevisions(workflowId, page, limit);
        return RestResponse.ok(response);
    }

    @GET
    @Path("/changes")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Get recent changes", description = "Get recent individual changes across workflow, nodes, edges, and triggers")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Changes retrieved successfully"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<RecentChangesResponse> getRecentChanges(
            @PathParam("workflowId") UUID workflowId,
            @QueryParam("limit") @DefaultValue("50") int limit) {
        RecentChangesResponse response = revisionService.getRecentChanges(workflowId, limit);
        return RestResponse.ok(response);
    }

    @GET
    @Path("/{revision}")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Get revision metadata", description = "Get metadata for a specific revision")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Revision retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Revision not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowRevisionDTO> getRevision(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision) {
        try {
            WorkflowRevisionDTO dto = revisionService.getRevision(workflowId, revision);
            return RestResponse.ok(dto);
        } catch (RevisionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/{revision}/preview")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Get revision snapshot", description = "Get the full snapshot for a revision including all versioned data")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Snapshot retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Revision not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<RevisionSnapshotDTO> getRevisionSnapshot(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision) {
        try {
            RevisionSnapshotDTO snapshot = revisionService.getRevisionSnapshot(workflowId, revision);
            return RestResponse.ok(snapshot);
        } catch (RevisionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/{revision}")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Delete a revision", description = "Delete a revision (cannot delete currently published revision)")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Revision deleted successfully"),
            @APIResponse(responseCode = "400", description = "Cannot delete published revision"),
            @APIResponse(responseCode = "404", description = "Revision not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<Void> deleteRevision(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision) {
        try {
            revisionService.deleteRevision(workflowId, revision);
            return RestResponse.noContent();
        } catch (RevisionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IllegalStateException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    // ==================== Publishing ====================

    @GET
    @Path("/published")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Get published version info", description = "Get information about the currently published version")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Published version retrieved successfully"),
            @APIResponse(responseCode = "404", description = "No published version"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowPublishedVersionDTO> getPublishedVersion(
            @PathParam("workflowId") UUID workflowId) {
        WorkflowPublishedVersionDTO published = revisionService.getPublishedVersion(workflowId);
        if (published == null) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
        return RestResponse.ok(published);
    }

    @GET
    @Path("/published/snapshot")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Get published snapshot", description = "Get the full snapshot of the currently published revision")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Published snapshot retrieved successfully"),
            @APIResponse(responseCode = "404", description = "No published version"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<RevisionSnapshotDTO> getPublishedSnapshot(
            @PathParam("workflowId") UUID workflowId) {
        try {
            RevisionSnapshotDTO snapshot = revisionService.getPublishedSnapshot(workflowId);
            return RestResponse.ok(snapshot);
        } catch (RevisionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/publish")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "One-click publish", description = "Create a revision from current state and publish it immediately")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Published successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<PublishCurrentResponse> publishCurrent(
            @PathParam("workflowId") UUID workflowId,
            @HeaderParam("X-USER") String userHeader,
            PublishRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            String description = request != null ? request.getDescription() : null;
            PublishCurrentResponse response = revisionService.publishCurrent(workflowId, userUuid, description);
            return RestResponse.ok(response);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{revision}/publish")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Publish specific revision", description = "Publish a specific existing revision")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Published successfully"),
            @APIResponse(responseCode = "404", description = "Revision or workflow not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowPublishedVersionDTO> publishRevision(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision,
            @HeaderParam("X-USER") String userHeader) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowPublishedVersionDTO published = revisionService.publishRevision(workflowId, revision, userUuid);
            return RestResponse.ok(published);
        } catch (RevisionNotFoundException | WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    // ==================== Restore ====================

    @POST
    @Path("/{revision}/restore")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Restore to revision", description = "Restore the workflow to a specific revision's state")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Restored successfully"),
            @APIResponse(responseCode = "404", description = "Revision or workflow not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowRevisionDTO> restoreRevision(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision,
            @HeaderParam("X-USER") String userHeader,
            RestoreRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            String description = request != null ? request.getDescription() : null;
            WorkflowRevisionDTO newRevision = revisionService.restoreRevision(
                    workflowId, revision, userUuid, description);
            return RestResponse.ok(newRevision);
        } catch (RevisionNotFoundException | WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    // ==================== Execution ====================

    @POST
    @Path("/published/execute")
    @RequiresPermission(
            permissionType = "workflow:execute",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Execute published revision", description = "Execute the currently published revision of the workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Execution started"),
            @APIResponse(responseCode = "404", description = "No published version or workflow not found"),
            @APIResponse(responseCode = "400", description = "Invalid workflow state"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowExecutionDTO> executePublished(
            @PathParam("workflowId") UUID workflowId,
            @HeaderParam("X-USER") String userHeader,
            @Valid ExecuteWorkflowRequest request) {
        try {
            // Get the published revision number
            WorkflowPublishedVersionDTO published = revisionService.getPublishedVersion(workflowId);
            if (published == null) {
                return RestResponse.status(RestResponse.Status.NOT_FOUND);
            }

            String userUuid = extractUserUuid(userHeader);
            WorkflowExecutionDTO execution = executionService.executeWorkflowRevision(
                    workflowId, published.getRevision(), request, userUuid);
            return RestResponse.ok(execution);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @POST
    @Path("/{revision}/execute")
    @RequiresPermission(
            permissionType = "workflow:execute",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Execute specific revision", description = "Execute a specific revision of the workflow (for testing)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Execution started"),
            @APIResponse(responseCode = "404", description = "Revision or workflow not found"),
            @APIResponse(responseCode = "400", description = "Invalid workflow state"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<WorkflowExecutionDTO> executeRevision(
            @PathParam("workflowId") UUID workflowId,
            @PathParam("revision") int revision,
            @HeaderParam("X-USER") String userHeader,
            @Valid ExecuteWorkflowRequest request) {
        try {
            // Verify the revision exists
            revisionService.getRevision(workflowId, revision);

            String userUuid = extractUserUuid(userHeader);
            WorkflowExecutionDTO execution = executionService.executeWorkflowRevision(
                    workflowId, revision, request, userUuid);
            return RestResponse.ok(execution);
        } catch (RevisionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    // ==================== Helper Methods ====================

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

    // ==================== Request DTOs ====================

    public static class PublishRequest {
        private String description;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class RestoreRequest {
        private String description;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
