package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.HttpWorkflowResponse;
import com.nuraly.workflows.dto.WorkflowTriggerDTO;
import com.nuraly.workflows.exception.TriggerNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowTriggerService;
import com.nuraly.library.permission.RequiresPermission;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.List;
import java.util.UUID;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Triggers", description = "Operations related to workflow triggers")
public class WorkflowTriggerResource {

    private static final Logger LOG = Logger.getLogger(WorkflowTriggerResource.class);

    @Inject
    WorkflowTriggerService triggerService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
            @APIResponse(responseCode = "200", description = "Workflow triggered or completed"),
            @APIResponse(responseCode = "400", description = "Trigger is disabled or workflow not active"),
            @APIResponse(responseCode = "404", description = "Invalid webhook token"),
            @APIResponse(responseCode = "504", description = "Sync workflow execution timed out")
    })
    public Response triggerWebhook(
            @PathParam("token") String token,
            JsonNode payload) {
        try {
            // Check if workflow has HTTP_START node (sync mode)
            if (configuration.httpSyncEnabled && triggerService.hasHttpStartNode(token)) {
                LOG.infof("Triggering sync webhook: token=%s", token);
                return triggerWebhookSync(token, payload);
            }

            // Async mode (default)
            triggerService.triggerByWebhook(token, payload);
            return Response.ok("{\"status\": \"triggered\"}").build();

        } catch (TriggerNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Invalid webhook token\"}")
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            LOG.errorf(e, "Webhook trigger failed: token=%s", token);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Internal server error\"}")
                    .build();
        }
    }

    /**
     * Synchronous webhook execution.
     * Waits for workflow completion and returns HTTP_END response.
     */
    private Response triggerWebhookSync(String token, JsonNode payload) {
        try {
            HttpWorkflowResponse response = triggerService.triggerByWebhookSync(
                    token, payload, configuration.httpSyncTimeout);

            if (response == null) {
                return Response.status(Response.Status.GATEWAY_TIMEOUT)
                        .entity("{\"error\": \"Workflow execution timed out\"}")
                        .build();
            }

            // Build response with HTTP_END node output
            Response.ResponseBuilder responseBuilder = Response.status(response.getStatusCode());

            // Set content type
            if (response.getContentType() != null) {
                responseBuilder.type(response.getContentType());
            }

            // Set custom headers from HTTP_END node
            if (response.getHeaders() != null) {
                response.getHeaders().forEach(responseBuilder::header);
            }

            // Set body
            if (response.getBody() != null) {
                responseBuilder.entity(response.getBody());
            } else if (response.getError() != null) {
                responseBuilder.entity("{\"error\": \"" + response.getError() + "\"}");
            } else {
                responseBuilder.entity("{\"status\": \"completed\"}");
            }

            return responseBuilder.build();

        } catch (TriggerNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Invalid webhook token\"}")
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            LOG.errorf(e, "Sync webhook execution failed: token=%s", token);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
