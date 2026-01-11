package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.dto.WorkflowTriggerDTO;
import com.nuraly.workflows.exception.TriggerNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowTriggerService;
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
import java.util.UUID;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Triggers", description = "Operations related to workflow triggers")
public class WorkflowTriggerResource {

    @Inject
    WorkflowTriggerService triggerService;

    @GET
    @Path("/workflows/{workflowId}/triggers")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "List workflow triggers")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Triggers retrieved successfully")
    })
    public RestResponse<List<WorkflowTriggerDTO>> getTriggers(
            @PathParam("workflowId") UUID workflowId) {
        List<WorkflowTriggerDTO> triggers = triggerService.getTriggers(workflowId);
        return RestResponse.ok(triggers);
    }

    @POST
    @Path("/workflows/{workflowId}/triggers")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Create a trigger")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Trigger created successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowTriggerDTO> createTrigger(
            @PathParam("workflowId") UUID workflowId,
            @Valid WorkflowTriggerDTO triggerDTO) {
        try {
            WorkflowTriggerDTO created = triggerService.createTrigger(workflowId, triggerDTO);
            return RestResponse.status(RestResponse.Status.CREATED, created);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @PUT
    @Path("/triggers/{triggerId}")
    @Operation(summary = "Update a trigger")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Trigger updated successfully"),
            @APIResponse(responseCode = "404", description = "Trigger not found")
    })
    public RestResponse<WorkflowTriggerDTO> updateTrigger(
            @PathParam("triggerId") UUID triggerId,
            @Valid WorkflowTriggerDTO triggerDTO) {
        try {
            WorkflowTriggerDTO updated = triggerService.updateTrigger(triggerId, triggerDTO);
            return RestResponse.ok(updated);
        } catch (TriggerNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/triggers/{triggerId}")
    @Operation(summary = "Delete a trigger")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Trigger deleted successfully"),
            @APIResponse(responseCode = "404", description = "Trigger not found")
    })
    public RestResponse<Void> deleteTrigger(@PathParam("triggerId") UUID triggerId) {
        try {
            triggerService.deleteTrigger(triggerId);
            return RestResponse.noContent();
        } catch (TriggerNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/triggers/{triggerId}/enable")
    @Operation(summary = "Enable a trigger")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Trigger enabled"),
            @APIResponse(responseCode = "404", description = "Trigger not found")
    })
    public RestResponse<Void> enableTrigger(@PathParam("triggerId") UUID triggerId) {
        try {
            triggerService.enableTrigger(triggerId);
            return RestResponse.noContent();
        } catch (TriggerNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/triggers/{triggerId}/disable")
    @Operation(summary = "Disable a trigger")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Trigger disabled"),
            @APIResponse(responseCode = "404", description = "Trigger not found")
    })
    public RestResponse<Void> disableTrigger(@PathParam("triggerId") UUID triggerId) {
        try {
            triggerService.disableTrigger(triggerId);
            return RestResponse.noContent();
        } catch (TriggerNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/webhooks/{token}")
    @Operation(summary = "Webhook trigger endpoint")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow triggered"),
            @APIResponse(responseCode = "400", description = "Trigger is disabled or workflow not active"),
            @APIResponse(responseCode = "404", description = "Invalid webhook token")
    })
    public RestResponse<String> triggerWebhook(
            @PathParam("token") String token,
            JsonNode payload) {
        try {
            triggerService.triggerByWebhook(token, payload);
            return RestResponse.ok("{\"status\": \"triggered\"}");
        } catch (TriggerNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IllegalStateException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR);
        }
    }
}
