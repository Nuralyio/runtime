package com.nuraly.workflows.api.rest;

import com.nuraly.workflows.dto.WorkflowNodeDTO;
import com.nuraly.workflows.service.WorkflowService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.UUID;

@Path("/api/v1/nodes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Nodes", description = "Operations related to workflow nodes")
public class WorkflowNodeResource {

    @Inject
    WorkflowService workflowService;

    @PUT
    @Path("/{nodeId}")
    @Operation(summary = "Update a node")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Node updated successfully"),
            @APIResponse(responseCode = "404", description = "Node not found")
    })
    public RestResponse<WorkflowNodeDTO> updateNode(
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
    @Path("/{nodeId}")
    @Operation(summary = "Delete a node")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Node deleted successfully"),
            @APIResponse(responseCode = "404", description = "Node not found")
    })
    public RestResponse<Void> deleteNode(@PathParam("nodeId") UUID nodeId) {
        try {
            workflowService.deleteNode(nodeId);
            return RestResponse.noContent();
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }
}
