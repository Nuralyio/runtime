package com.nuraly.functions.api.rest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.service.Deployment;
import com.nuraly.functions.service.FunctionService;
import com.nuraly.functions.exception.FunctionNotFoundException;

import com.nuraly.library.permission.RequiresPermission;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;
import jakarta.ws.rs.core.UriInfo;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestResponse;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/functions")
@OpenAPIDefinition(
        info = @Info(title = "Function API", version = "1.0"),
        tags = {
                @Tag(name = "Function", description = "Operations related to functions")
        }
)
public class FunctionResource {

    @Inject
    FunctionService functionService;

    @Inject
    Deployment deployment;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Functions retrieved"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Retrieve all functions")
    public RestResponse<List<FunctionDTO>> getFunctions() {
        List<FunctionDTO> functions = functionService.getFunctions();
        return RestResponse.ok(functions);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Function retrieved"),
            @APIResponse(responseCode = "404", description = "Function not found")
    })
    @Operation(summary = "Retrieve a function by ID")
    public RestResponse<FunctionDTO> getFunctionById(@PathParam("id") UUID functionId) throws FunctionNotFoundException {
        FunctionDTO functionDTO = functionService.getFunctionById(functionId);
        return RestResponse.ok(functionDTO);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Function created"),
            @APIResponse(responseCode = "400", description = "Invalid request payload")
    })
    @Operation(summary = "Create a new function")
    public RestResponse<FunctionDTO> createFunction(@Valid FunctionDTO functionDTO) {
        FunctionDTO createdFunctionDTO = functionService.createFunction(functionDTO);
        return RestResponse.status(RestResponse.Status.CREATED, createdFunctionDTO);
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Function updated"),
            @APIResponse(responseCode = "400", description = "Invalid request payload"),
            @APIResponse(responseCode = "404", description = "Function not found")
    })
    @Operation(summary = "Update an existing function")
    public RestResponse<FunctionDTO> updateFunction(@RestPath Long id, @Valid FunctionDTO functionDTO) throws FunctionNotFoundException {
        FunctionDTO updatedFunctionDTO = functionService.updateFunction(id, functionDTO);
        return RestResponse.ok(updatedFunctionDTO);
    }

    @DELETE
    @Path("/{id}")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Function deleted"),
            @APIResponse(responseCode = "404", description = "Function not found")
    })
    @Operation(summary = "Delete a function by ID")
    public RestResponse<Void> deleteFunction(@RestPath UUID id) throws FunctionNotFoundException {
        functionService.deleteFunction(id);
        return RestResponse.noContent();
    }

    @POST
    @Path("/build/{functionId}")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Docker image build started"),
            @APIResponse(responseCode = "400", description = "Invalid function ID"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Build Docker image for a function")
    public RestResponse<String> buildDockerImage(@PathParam("functionId") Long functionId) {
        try {
            String imageName = functionService.buildFunctionDockerImage(functionId);
            return RestResponse.ok("Docker image " + imageName + " build started successfully.");
        } catch (FunctionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST, "Function not found: " + e.getMessage());
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR, "Failed to build Docker image: " + e.getMessage());
        }
    }

    @POST
    @Path("/deploy/{functionId}")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Deployment started successfully"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Deploy a function")
    public RestResponse<String> deployFunction(@PathParam("functionId") Long functionId) {
        try {
            deployment.deploy(functionId);
            return RestResponse.ok("Deployment started successfully.");
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR, "Failed to start deployment: " + e.getMessage());
        }
    }

    @POST
    @Path("/invoke/{functionId}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @RequiresPermission(
            permissionType = "writes",
            resourceType = "function",
            resourceId = "functionid"
    )     @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Function invoked successfully"),
            @APIResponse(responseCode = "404", description = "Function not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Invoke a function")
    public RestResponse<String> postInvokeFunction(@PathParam("functionId") Long functionId, @Valid InvokeRequest request) {
        try {
            String result = functionService.invokeFunction(functionId, request);
            return RestResponse.ok(result);
        } catch (FunctionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND, "Function not found: " + e.getMessage());
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR, "Failed to invoke function: " + e.getMessage());
        }
    }

    @GET
    @Path("/invoke/{functionId}")
    @RequiresPermission(
            permissionType = "execute",
            resourceType = "function",
            resourceId = "#{functionId}"
    )     @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Invocation result retrieved successfully"),
            @APIResponse(responseCode = "404", description = "Function or result not found"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Get the result of a function invocation with dynamic query parameters")
    public RestResponse<String> getInvokeFunction(
            @PathParam("functionId") Long functionId,
            @Context UriInfo uriInfo
    ) {
        try {
            ObjectNode jsonNode = new ObjectNode(new com.fasterxml.jackson.databind.node.JsonNodeFactory(false));
            MultivaluedMap<String, String> queryParams = uriInfo.getQueryParameters();
            for (String key : queryParams.keySet()) {
                List<String> values = queryParams.get(key);
                if (values != null && !values.isEmpty()) {
                    jsonNode.put(key, String.join(",", values));
                }
            }
            InvokeRequest request = new InvokeRequest(jsonNode);
            String result = functionService.invokeFunction(functionId, request);
            return RestResponse.ok(result);
        } catch (FunctionNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND, "Function not found: " + e.getMessage());
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR, "Failed to retrieve invocation result: " + e.getMessage());
        }
    }
}