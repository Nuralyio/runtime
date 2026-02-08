package com.nuraly.workflows.api.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowService;
import com.nuraly.workflows.service.WorkflowExecutionService;
import com.nuraly.workflows.service.WorkflowTriggerService;
import jakarta.ws.rs.core.Response;
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

    @Inject
    WorkflowExecutionService executionService;

    @Inject
    WorkflowTriggerService triggerService;

    @Inject
    Configuration configuration;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GET
    @Operation(summary = "Retrieve all workflows")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflows retrieved successfully"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    public RestResponse<List<WorkflowDTO>> getWorkflows(
            @HeaderParam("X-USER") String userHeader,
            @QueryParam("applicationId") String applicationId,
            @QueryParam("isTemplate") Boolean isTemplate) {
        List<WorkflowDTO> workflows = workflowService.getWorkflows(applicationId, userHeader, isTemplate);
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

    // Template endpoints

    @GET
    @Path("/templates")
    @Operation(summary = "List all workflow templates")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Templates retrieved successfully")
    })
    public RestResponse<List<WorkflowDTO>> getTemplates() {
        List<WorkflowDTO> templates = workflowService.getTemplates();
        return RestResponse.ok(templates);
    }

    @PUT
    @Path("/{id}/template")
    @RequiresPermission(
            permissionType = "workflow:write",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Set or unset a workflow as a template")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Template flag updated successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowDTO> setTemplate(
            @PathParam("id") UUID id,
            Map<String, Boolean> body) {
        try {
            boolean isTemplate = body != null && Boolean.TRUE.equals(body.get("isTemplate"));
            WorkflowDTO updated = workflowService.setTemplate(id, isTemplate);
            return RestResponse.ok(updated);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/create-from-template/{templateId}")
    @Operation(summary = "Create a new workflow from a template")
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Workflow created from template successfully"),
            @APIResponse(responseCode = "400", description = "Workflow is not a template"),
            @APIResponse(responseCode = "404", description = "Template not found")
    })
    public RestResponse<WorkflowDTO> createFromTemplate(
            @PathParam("templateId") UUID templateId,
            @HeaderParam("X-USER") String userHeader,
            @Valid CreateFromTemplateRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowDTO created = workflowService.createFromTemplate(templateId, request, userUuid);
            return RestResponse.status(RestResponse.Status.CREATED, created);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
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

    @POST
    @Path("/{id}/execute")
    @RequiresPermission(
            permissionType = "workflow:execute",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Execute a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow execution started"),
            @APIResponse(responseCode = "400", description = "Workflow is not active"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowExecutionDTO> executeWorkflow(
            @PathParam("id") UUID id,
            @HeaderParam("X-USER") String userHeader,
            @Valid ExecuteWorkflowRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowExecutionDTO execution = executionService.executeWorkflow(id, request, userUuid);
            return RestResponse.ok(execution);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
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

    @GET
    @Path("/{id}/latest-node-outputs")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Get latest node outputs for variable discovery")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Node outputs retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<Map<String, JsonNode>> getLatestNodeOutputs(@PathParam("id") UUID id) {
        try {
            Map<String, JsonNode> nodeOutputs = executionService.getLatestNodeOutputs(id);
            return RestResponse.ok(nodeOutputs);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/{id}/latest-execution")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Get the latest execution with node executions")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Latest execution retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Workflow not found or no executions")
    })
    public RestResponse<WorkflowExecutionDTO> getLatestExecution(@PathParam("id") UUID id) {
        try {
            WorkflowExecutionDTO execution = executionService.getLatestExecution(id);
            if (execution == null) {
                return RestResponse.status(RestResponse.Status.NOT_FOUND);
            }
            return RestResponse.ok(execution);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/{id}/executions/{executionId}/nodes")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Get node executions for a specific execution")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Node executions retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<List<NodeExecutionDTO>> getNodeExecutions(
            @PathParam("id") UUID id,
            @PathParam("executionId") UUID executionId) {
        try {
            List<NodeExecutionDTO> nodeExecutions = executionService.getNodeExecutions(executionId);
            return RestResponse.ok(nodeExecutions);
        } catch (com.nuraly.workflows.exception.ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/{id}/executions/{executionId}/nodes/{nodeId}/retry")
    @RequiresPermission(
            permissionType = "workflow:execute",
            resourceType = "workflow",
            resourceId = "#{id}"
    )
    @Operation(summary = "Retry a specific node within an execution")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Node retry started"),
            @APIResponse(responseCode = "400", description = "Cannot retry node in current state"),
            @APIResponse(responseCode = "404", description = "Execution or node not found")
    })
    public RestResponse<WorkflowExecutionDTO> retryNode(
            @PathParam("id") UUID id,
            @PathParam("executionId") UUID executionId,
            @PathParam("nodeId") UUID nodeId) {
        try {
            WorkflowExecutionDTO execution = executionService.retryNode(executionId, nodeId);
            return RestResponse.ok(execution);
        } catch (com.nuraly.workflows.exception.ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/{id}/trigger")
    @Operation(summary = "Trigger workflow via HTTP GET")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow executed successfully"),
            @APIResponse(responseCode = "400", description = "Workflow has no HTTP trigger"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "504", description = "Workflow execution timed out")
    })
    public Response triggerWorkflowGet(@PathParam("id") UUID id) {
        return triggerWorkflowWithPath(id, null, null);
    }

    @GET
    @Path("/{id}/trigger/{path: .+}")
    @Operation(summary = "Trigger workflow via HTTP GET with path")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow executed successfully"),
            @APIResponse(responseCode = "400", description = "Workflow has no HTTP trigger"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "504", description = "Workflow execution timed out")
    })
    public Response triggerWorkflowGetWithPath(
            @PathParam("id") UUID id,
            @PathParam("path") String path) {
        return triggerWorkflowWithPath(id, path, null);
    }

    @POST
    @Path("/{id}/trigger")
    @Operation(summary = "Trigger workflow via HTTP POST")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow executed successfully"),
            @APIResponse(responseCode = "400", description = "Workflow has no HTTP trigger"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "504", description = "Workflow execution timed out")
    })
    public Response triggerWorkflow(
            @PathParam("id") UUID id,
            JsonNode payload) {
        return triggerWorkflowWithPath(id, null, payload);
    }

    @POST
    @Path("/{id}/trigger/{path: .+}")
    @Operation(summary = "Trigger workflow via HTTP POST with custom path")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow executed successfully"),
            @APIResponse(responseCode = "400", description = "Workflow has no HTTP trigger"),
            @APIResponse(responseCode = "404", description = "Workflow not found"),
            @APIResponse(responseCode = "504", description = "Workflow execution timed out")
    })
    public Response triggerWorkflowWithPath(
            @PathParam("id") UUID id,
            @PathParam("path") String path,
            JsonNode payload) {
        try {
            HttpWorkflowResponse response = triggerService.triggerByWorkflowId(
                    id, path, payload, configuration.httpSyncTimeout);

            if (response == null) {
                return Response.status(Response.Status.GATEWAY_TIMEOUT)
                        .entity("{\"error\": \"Workflow execution timed out\"}")
                        .build();
            }

            Response.ResponseBuilder responseBuilder = Response.status(response.getStatusCode());

            // Add execution ID header for frontend tracking via socket.io
            if (response.getExecutionId() != null) {
                responseBuilder.header("X-Execution-Id", response.getExecutionId().toString());
            }

            if (response.getContentType() != null) {
                responseBuilder.type(response.getContentType());
            }

            if (response.getHeaders() != null) {
                response.getHeaders().forEach(responseBuilder::header);
            }

            if (response.getBody() != null) {
                responseBuilder.entity(response.getBody());
            } else if (response.getError() != null) {
                responseBuilder.entity("{\"error\": \"" + response.getError() + "\"}");
            } else {
                responseBuilder.entity("{\"status\": \"completed\"}");
            }

            return responseBuilder.build();

        } catch (WorkflowNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Workflow not found\"}")
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/{id}/trigger/chat")
    @Operation(summary = "Trigger workflow from chatbot (async execution)")
    @APIResponses(value = {
            @APIResponse(responseCode = "202", description = "Workflow execution started"),
            @APIResponse(responseCode = "400", description = "Workflow has no CHAT_START trigger"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public Response triggerWorkflowFromChat(
            @PathParam("id") UUID id,
            JsonNode payload) {
        try {
            // Start async execution and return immediately
            // The chatbot will track progress via socket.io
            var execution = triggerService.triggerAsync(id, "CHAT", payload);

            if (execution == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Failed to start workflow execution\"}")
                        .build();
            }

            return Response.status(Response.Status.ACCEPTED)
                    .header("X-Execution-Id", execution.id.toString())
                    .entity("{\"executionId\": \"" + execution.id + "\", \"status\": \"QUEUED\"}")
                    .build();

        } catch (WorkflowNotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"Workflow not found\"}")
                    .build();
        } catch (IllegalStateException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}
