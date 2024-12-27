package com.nuraly.functions.api.rest;

import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.service.FunctionService;
import com.nuraly.functions.exception.FunctionNotFoundException;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;
import java.util.UUID;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestResponse;

@Path("/api/v3/functions")
@OpenAPIDefinition(
        info = @Info(title = "Function API", version = "1.0"),
        tags = {
                @Tag(name = "Function", description = "Operations related to functions")
        }
)
public class FunctionResource {

    @Inject
    FunctionService functionService;

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
    public RestResponse<FunctionDTO> updateFunction(@RestPath UUID id, @Valid FunctionDTO functionDTO) throws FunctionNotFoundException {
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
}
