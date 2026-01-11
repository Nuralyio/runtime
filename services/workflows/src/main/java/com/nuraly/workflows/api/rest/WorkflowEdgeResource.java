package com.nuraly.workflows.api.rest;

import com.nuraly.workflows.service.WorkflowService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.UUID;

@Path("/api/v1/edges")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Edges", description = "Operations related to workflow edges")
public class WorkflowEdgeResource {

    @Inject
    WorkflowService workflowService;

    @DELETE
    @Path("/{edgeId}")
    @Operation(summary = "Delete an edge")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Edge deleted successfully"),
            @APIResponse(responseCode = "404", description = "Edge not found")
    })
    public RestResponse<Void> deleteEdge(@PathParam("edgeId") UUID edgeId) {
        try {
            workflowService.deleteEdge(edgeId);
            return RestResponse.noContent();
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }
}
