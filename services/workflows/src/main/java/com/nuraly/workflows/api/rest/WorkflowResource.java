package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowService;
import com.nuraly.library.permission.RequiresPermission;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;
import io.smallrye.common.annotation.Blocking;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/v1/workflows")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow", description = "Operations related to workflows")
@Blocking // Required because PermissionClient uses blocking HttpURLConnection
public class WorkflowResource {

    @Inject
    WorkflowService workflowService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GET
    @Operation(summary = "Retrieve all workflows")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflows retrieved successfully"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<List<WorkflowDTO>> getWorkflows(
            @HeaderParam("X-USER") String userHeader,
            @QueryParam("applicationId") String applicationId) {
        List<WorkflowDTO> workflows = workflowService.getWorkflows(applicationId, userHeader);
        return RestResponse.ok(workflows);
    }

    @GET
    @Path("/{id}")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Retrieve a workflow by ID")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> getWorkflowById(@PathParam("id") UUID id) {
        try {
            WorkflowDTO workflow = workflowService.getWorkflowById(id);
            return RestResponse.ok(workflow);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Operation(summary = "Create a new workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Workflow created successfully"),
            @APIResponse(responseCode = "400", description = "Invalid request")
    })
    public RestResponse<WorkflowDTO> createWorkflow(
            @HeaderParam("X-USER") String userHeader,
            @Valid WorkflowDTO workflowDTO) {
        String userUuid = extractUserUuid(userHeader);
        WorkflowDTO created = workflowService.createWorkflow(workflowDTO, userUuid);
        return RestResponse.status(RestResponse.Status.CREATED, created);
    }

    @PUT
    @Path("/{id}")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Update a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow updated successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> updateWorkflow(
            @PathParam("id") UUID id,
            @Valid WorkflowDTO workflowDTO) {
        try {
            WorkflowDTO updated = workflowService.updateWorkflow(id, workflowDTO);
            return RestResponse.ok(updated);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/{id}")
    @RequiresPermission(
            permissionType = "workflow:delete",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Delete a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Workflow deleted successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<Void> deleteWorkflow(@PathParam("id") UUID id) {
        try {
            workflowService.deleteWorkflow(id);
            return RestResponse.noContent();
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/publish")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Publish (activate) a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow published successfully"),
            @APIResponse(responseCode = "400", description = "Workflow validation failed"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> publishWorkflow(@PathParam("id") UUID id) {
        try {
            WorkflowDTO published = workflowService.publishWorkflow(id);
            return RestResponse.ok(published);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @POST
    @Path("/{id}/pause")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Pause a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow paused successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> pauseWorkflow(@PathParam("id") UUID id) {
        try {
            WorkflowDTO paused = workflowService.pauseWorkflow(id);
            return RestResponse.ok(paused);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/clone")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Clone a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Workflow cloned successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> cloneWorkflow(
            @PathParam("id") UUID id,
            @HeaderParam("X-USER") String userHeader) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowDTO cloned = workflowService.cloneWorkflow(id, userUuid);
            return RestResponse.status(RestResponse.Status.CREATED, cloned);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/validate")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Validate a workflow definition")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Validation result returned"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<ValidationResult> validateWorkflow(@PathParam("id") UUID id) {
        try {
            ValidationResult result = workflowService.validateWorkflow(id);
            return RestResponse.ok(result);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    // Node endpoints
    @GET
    @Path("/{id}/nodes")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Get workflow nodes")
    public RestResponse<List<WorkflowNodeDTO>> getNodes(@PathParam("id") UUID id) {
        try {
            WorkflowDTO workflow = workflowService.getWorkflowById(id);
            return RestResponse.ok(workflow.getNodes());
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/nodes")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Add a node to the workflow")
    public RestResponse<WorkflowNodeDTO> addNode(
            @PathParam("id") UUID id,
            @Valid WorkflowNodeDTO nodeDTO) {
        try {
            WorkflowNodeDTO created = workflowService.addNode(id, nodeDTO);
            return RestResponse.status(RestResponse.Status.CREATED, created);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @PUT
    @Path("/{id}/nodes/{nodeId}")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Update a node in the workflow")
    public RestResponse<WorkflowNodeDTO> updateNode(
            @PathParam("id") UUID id,
            @PathParam("nodeId") UUID nodeId,
            @Valid WorkflowNodeDTO nodeDTO) {
        try {
            WorkflowNodeDTO updated = workflowService.updateNode(nodeId, nodeDTO);
            return RestResponse.ok(updated);
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/{id}/nodes/{nodeId}")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Delete a node from the workflow")
    public RestResponse<Void> deleteNode(
            @PathParam("id") UUID id,
            @PathParam("nodeId") UUID nodeId) {
        try {
            workflowService.deleteNode(nodeId);
            return RestResponse.noContent();
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    // Edge endpoints
    @GET
    @Path("/{id}/edges")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Get workflow edges")
    public RestResponse<List<WorkflowEdgeDTO>> getEdges(@PathParam("id") UUID id) {
        try {
            WorkflowDTO workflow = workflowService.getWorkflowById(id);
            return RestResponse.ok(workflow.getEdges());
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/edges")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Add an edge to the workflow")
    public RestResponse<WorkflowEdgeDTO> addEdge(
            @PathParam("id") UUID id,
            @Valid WorkflowEdgeDTO edgeDTO) {
        try {
            WorkflowEdgeDTO created = workflowService.addEdge(id, edgeDTO);
            return RestResponse.status(RestResponse.Status.CREATED, created);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/{id}/edges/{edgeId}")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Delete an edge from the workflow")
    public RestResponse<Void> deleteEdge(
            @PathParam("id") UUID id,
            @PathParam("edgeId") UUID edgeId) {
        try {
            workflowService.deleteEdge(edgeId);
            return RestResponse.noContent();
        } catch (Exception e) {
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
