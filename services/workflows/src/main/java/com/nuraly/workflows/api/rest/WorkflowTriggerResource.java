package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.exception.TriggerNotFoundException;
import com.nuraly.workflows.service.TriggerManagerService;
import com.nuraly.workflows.service.WorkflowTriggerService;
import com.nuraly.workflows.triggers.connectors.TelegramConnector;
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
    TriggerManagerService triggerManagerService;

    @Inject
    Configuration configuration;

    @Inject
    TelegramConnector telegramConnector;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
    @Operation(summary = "Webhook trigger endpoint (token-based)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow triggered or completed"),
            @APIResponse(responseCode = "400", description = "Trigger is disabled or workflow not active"),
            @APIResponse(responseCode = "404", description = "Invalid webhook token"),
            @APIResponse(responseCode = "504", description = "Sync workflow execution timed out")
    })
    public Response triggerWebhook(
            @PathParam("token") String token,
            @HeaderParam("X-Telegram-Bot-Api-Secret-Token") String telegramSecretToken,
            JsonNode payload) {
        try {
            // Validate Telegram secret token if present
            if (telegramSecretToken != null && !telegramSecretToken.isEmpty()) {
                if (!triggerService.validateTelegramSecret(token, telegramSecretToken, telegramConnector)) {
                    return Response.status(Response.Status.FORBIDDEN)
                            .entity("{\"error\": \"Invalid secret token\"}")
                            .build();
                }
                // This is a Telegram webhook delivery — process via connector
                triggerService.processTelegramWebhookUpdate(token, payload, telegramConnector);
                return Response.ok("{\"status\": \"triggered\"}").build();
            }

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

    // =====================================================
    // Persistent Trigger Management Endpoints
    // =====================================================

    @POST
    @Path("/triggers/{triggerId}/activate")
    @Operation(summary = "Activate a persistent trigger (start connection)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Trigger activation initiated"),
            @APIResponse(responseCode = "404", description = "Trigger not found"),
            @APIResponse(responseCode = "409", description = "Resource busy")
    })
    public RestResponse<TriggerActivationResult> activateTrigger(
            @PathParam("triggerId") UUID triggerId) {
        TriggerActivationResult result = triggerManagerService.activateTrigger(triggerId);
        if (result.isSuccess()) {
            return RestResponse.ok(result);
        } else if (result.getFailureReason() != null && result.getFailureReason().contains("not found")) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND, result);
        } else {
            return RestResponse.status(RestResponse.Status.CONFLICT, result);
        }
    }

    @POST
    @Path("/triggers/{triggerId}/deactivate")
    @Operation(summary = "Deactivate a persistent trigger (stop connection)")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Trigger deactivated"),
            @APIResponse(responseCode = "404", description = "Trigger not found or not active")
    })
    public RestResponse<Void> deactivateTrigger(
            @PathParam("triggerId") UUID triggerId,
            @QueryParam("graceful") @DefaultValue("true") boolean graceful) {
        triggerManagerService.deactivateTrigger(triggerId, graceful);
        return RestResponse.noContent();
    }

    @POST
    @Path("/triggers/{triggerId}/dev-mode")
    @Operation(summary = "Enable dev mode (pause production trigger, start dev trigger)")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Dev mode enabled"),
            @APIResponse(responseCode = "404", description = "Trigger not found"),
            @APIResponse(responseCode = "400", description = "Failed to enable dev mode")
    })
    public RestResponse<DevModeResult> enableDevMode(
            @PathParam("triggerId") UUID devTriggerId,
            @QueryParam("duration") @DefaultValue("3600000") long durationMs) {
        DevModeResult result = triggerManagerService.requestDevMode(devTriggerId, durationMs);
        if (result.isSuccess()) {
            return RestResponse.ok(result);
        } else {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST, result);
        }
    }

    @DELETE
    @Path("/triggers/{triggerId}/dev-mode")
    @Operation(summary = "Disable dev mode (stop dev trigger, resume production)")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Dev mode disabled")
    })
    public RestResponse<Void> disableDevMode(@PathParam("triggerId") UUID devTriggerId) {
        triggerManagerService.releaseDevMode(devTriggerId);
        return RestResponse.noContent();
    }

    @GET
    @Path("/triggers/{triggerId}/status")
    @Operation(summary = "Get trigger connection status")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Trigger status retrieved"),
            @APIResponse(responseCode = "404", description = "Trigger not found")
    })
    public RestResponse<TriggerStatusDTO> getTriggerStatus(@PathParam("triggerId") UUID triggerId) {
        TriggerStatusDTO status = triggerManagerService.getTriggerStatus(triggerId);
        if (status == null) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
        return RestResponse.ok(status);
    }

    @GET
    @Path("/trigger-resources")
    @Operation(summary = "List all trigger resources and their ownership status")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Resources listed")
    })
    public RestResponse<List<TriggerResourceDTO>> listTriggerResources(
            @QueryParam("type") TriggerType type) {
        List<TriggerResourceDTO> resources = triggerManagerService.listResources(type);
        return RestResponse.ok(resources);
    }

    @DELETE
    @Path("/trigger-resources/{resourceKey}")
    @Operation(summary = "Force release resource ownership (admin)")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Resource released")
    })
    public RestResponse<Void> forceReleaseResource(@PathParam("resourceKey") String resourceKey) {
        triggerManagerService.forceReleaseResource(resourceKey);
        return RestResponse.noContent();
    }
}
