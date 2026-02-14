package com.nuraly.docgen.api.rest;

import com.nuraly.docgen.dto.GenerateRequest;
import com.nuraly.docgen.dto.GenerateResponse;
import com.nuraly.docgen.dto.TemplateDTO;
import com.nuraly.docgen.exception.TemplateNotFoundException;
import com.nuraly.docgen.service.DocumentService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/documents")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Document Generator", description = "Operations for generating Word documents from templates")
public class DocumentResource {

    @Inject
    DocumentService documentService;

    @POST
    @Path("/templates")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Upload a document template")
    @APIResponses(value = {
        @APIResponse(responseCode = "201", description = "Template uploaded successfully"),
        @APIResponse(responseCode = "400", description = "Invalid request")
    })
    public RestResponse<TemplateDTO> uploadTemplate(
            @RestForm("file") FileUpload file,
            @RestForm("name") String name,
            @RestForm("description") String description,
            @RestForm("applicationId") String applicationId,
            @HeaderParam("X-USER") String userHeader) {
        if (file == null || name == null || name.isEmpty()) {
            return RestResponse.status(RestResponse.Status.BAD_REQUEST);
        }

        try (InputStream is = new FileInputStream(file.uploadedFile().toFile())) {
            String userId = extractUserUuid(userHeader);
            TemplateDTO template = documentService.uploadTemplate(name, description, applicationId, userId, is, file.fileName());
            return RestResponse.status(RestResponse.Status.CREATED, template);
        } catch (IOException e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @GET
    @Path("/templates")
    @Operation(summary = "List templates")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Templates retrieved successfully")
    })
    public RestResponse<List<TemplateDTO>> listTemplates(
            @QueryParam("applicationId") String applicationId) {
        List<TemplateDTO> templates = documentService.getTemplates(applicationId);
        return RestResponse.ok(templates);
    }

    @GET
    @Path("/templates/{id}")
    @Operation(summary = "Get template details")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Template retrieved successfully"),
        @APIResponse(responseCode = "404", description = "Template not found")
    })
    public RestResponse<TemplateDTO> getTemplate(@PathParam("id") UUID id) {
        try {
            TemplateDTO template = documentService.getTemplate(id);
            return RestResponse.ok(template);
        } catch (TemplateNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @DELETE
    @Path("/templates/{id}")
    @Operation(summary = "Delete a template")
    @APIResponses(value = {
        @APIResponse(responseCode = "204", description = "Template deleted successfully"),
        @APIResponse(responseCode = "404", description = "Template not found")
    })
    public RestResponse<Void> deleteTemplate(@PathParam("id") UUID id) {
        try {
            documentService.deleteTemplate(id);
            return RestResponse.noContent();
        } catch (TemplateNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
    }

    @POST
    @Path("/generate")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Operation(summary = "Generate a document synchronously")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Document generated successfully"),
        @APIResponse(responseCode = "404", description = "Template not found"),
        @APIResponse(responseCode = "500", description = "Generation failed")
    })
    public RestResponse<byte[]> generate(@Valid GenerateRequest request) {
        try {
            Path outputPath = documentService.generate(request);
            byte[] fileBytes = Files.readAllBytes(outputPath);

            return RestResponse.ResponseBuilder.ok(fileBytes)
                    .header("Content-Disposition", "attachment; filename=\"" + outputPath.getFileName() + "\"")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    .build();
        } catch (TemplateNotFoundException e) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        } catch (IOException e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @GET
    @Path("/jobs/{id}")
    @Operation(summary = "Check job status")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "Job status retrieved"),
        @APIResponse(responseCode = "404", description = "Job not found")
    })
    public RestResponse<GenerateResponse> getJob(@PathParam("id") UUID id) {
        GenerateResponse response = documentService.getJob(id);
        if (response == null) {
            return RestResponse.status(RestResponse.Status.NOT_FOUND);
        }
        return RestResponse.ok(response);
    }

    @GET
    @Path("/files/{filename}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Operation(summary = "Download a generated file")
    @APIResponses(value = {
        @APIResponse(responseCode = "200", description = "File downloaded"),
        @APIResponse(responseCode = "404", description = "File not found")
    })
    public RestResponse<byte[]> downloadFile(@PathParam("filename") String filename) {
        try {
            Path filePath = Paths.get("/app/uploads/generated", filename);
            if (!Files.exists(filePath)) {
                return RestResponse.status(RestResponse.Status.NOT_FOUND);
            }

            byte[] fileBytes = Files.readAllBytes(filePath);
            return RestResponse.ResponseBuilder.ok(fileBytes)
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    .build();
        } catch (IOException e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR);
        }
    }

    private String extractUserUuid(String userHeader) {
        if (userHeader == null || userHeader.isEmpty()) {
            return null;
        }
        try {
            var objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var user = objectMapper.readValue(userHeader, java.util.Map.class);
            return (String) user.get("uuid");
        } catch (Exception e) {
            return null;
        }
    }
}
