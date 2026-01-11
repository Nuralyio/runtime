package com.nuraly.workflows.api.rest;

import com.nuraly.workflows.dto.ExecuteWorkflowRequest;
import com.nuraly.workflows.dto.NodeExecutionDTO;
import com.nuraly.workflows.dto.WorkflowExecutionDTO;
import com.nuraly.workflows.exception.ExecutionNotFoundException;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.workflows.service.WorkflowExecutionService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;
import java.util.UUID;

@Path("/api/v1")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Workflow Execution", description = "Operations related to workflow execution")
public class WorkflowExecutionResource {

    @Inject
    WorkflowExecutionService executionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @POST
    @Path("/workflows/{workflowId}/execute")
    @RequiresPermission(
            permissionType = "workflow:execute",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "Execute a workflow")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Workflow execution started"),
            @APIResponse(responseCode = "400", description = "Workflow is not active"),
            @APIResponse(responseCode = "404", description = "Workflow not found")
    })
    public RestResponse<WorkflowExecutionDTO> executeWorkflow(
            @PathParam("workflowId") UUID workflowId,
            @HeaderParam("X-USER") String userHeader,
            @Valid ExecuteWorkflowRequest request) {
        try {
            String userUuid = extractUserUuid(userHeader);
            WorkflowExecutionDTO execution = executionService.executeWorkflow(workflowId, request, userUuid);
            return RestResponse.ok(execution);
        } catch (WorkflowNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @GET
    @Path("/workflows/{workflowId}/executions")
    @RequiresPermission(
            permissionType = "workflow:read",
            resourceType = "workflow",
            resourceId = "#{workflowId}"
    )
    @Operation(summary = "List workflow executions")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Executions retrieved successfully")
    })
    public RestResponse<List<WorkflowExecutionDTO>> getExecutions(
            @PathParam("workflowId") UUID workflowId) {
        List<WorkflowExecutionDTO> executions = executionService.getExecutions(workflowId);
        return RestResponse.ok(executions);
    }

    @GET
    @Path("/executions/{executionId}")
    @Operation(summary = "Get execution details")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Execution retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<WorkflowExecutionDTO> getExecution(
            @PathParam("executionId") UUID executionId) {
        try {
            WorkflowExecutionDTO execution = executionService.getExecution(executionId);
            return RestResponse.ok(execution);
        } catch (ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @GET
    @Path("/executions/{executionId}/nodes")
    @Operation(summary = "Get node execution logs")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Node executions retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<List<NodeExecutionDTO>> getNodeExecutions(
            @PathParam("executionId") UUID executionId) {
        try {
            List<NodeExecutionDTO> nodeExecutions = executionService.getNodeExecutions(executionId);
            return RestResponse.ok(nodeExecutions);
        } catch (ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/executions/{executionId}/cancel")
    @Operation(summary = "Cancel a running execution")
    @APIResponses(value = {
            @APIResponse(responseCode = "204", description = "Execution cancelled"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<Void> cancelExecution(
            @PathParam("executionId") UUID executionId) {
        try {
            executionService.cancelExecution(executionId);
            return RestResponse.noContent();
        } catch (ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/executions/{executionId}/retry")
    @Operation(summary = "Retry a failed execution")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Execution retried"),
            @APIResponse(responseCode = "400", description = "Execution is not in failed state"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<WorkflowExecutionDTO> retryExecution(
            @PathParam("executionId") UUID executionId) {
        try {
            WorkflowExecutionDTO execution = executionService.retryExecution(executionId);
            return RestResponse.ok(execution);
        } catch (ExecutionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (InvalidWorkflowException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }
    }

    @POST
    @Path("/executions/{executionId}/resume")
    @Operation(summary = "Resume a paused execution")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Execution resumed"),
            @APIResponse(responseCode = "400", description = "Execution is not in paused state"),
            @APIResponse(responseCode = "404", description = "Execution not found")
    })
    public RestResponse<WorkflowExecutionDTO> resumeExecution(
            @PathParam("executionId") UUID executionId) {
        try {
            WorkflowExecutionDTO execution = executionService.resumeExecution(executionId);
            return RestResponse.ok(execution);
        } catch (ExecutionNotFoundException e) {
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
}
