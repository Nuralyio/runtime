package com.nuraly.parcour.api.rest;

import com.nuraly.parcour.dto.CrawlRequestDTO;
import com.nuraly.parcour.dto.CrawlResultDTO;
import com.nuraly.parcour.service.CrawlerService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.jboss.resteasy.reactive.RestResponse;

@Path("/api/v1/crawler")
@OpenAPIDefinition(
        info = @Info(title = "Crawler API", version = "1.0"),
        tags = {
                @Tag(name = "Crawler", description = "Web crawling operations")
        }
)
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CrawlerResource {

    @Inject
    CrawlerService crawlerService;

    @POST
    @Path("/crawl")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Crawl completed successfully"),
            @APIResponse(responseCode = "400", description = "Invalid request payload"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Crawl URLs", description = "Crawl one or more URLs and extract content")
    public RestResponse<CrawlResultDTO> crawl(@Valid CrawlRequestDTO request) {
        try {
            CrawlResultDTO result = crawlerService.crawl(request);
            return RestResponse.ok(result);
        } catch (Exception e) {
            return RestResponse.status(RestResponse.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @GET
    @Path("/health")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Service is healthy")
    })
    @Operation(summary = "Health check", description = "Check if the crawler service is running")
    public RestResponse<String> health() {
        return RestResponse.ok("{\"status\":\"UP\"}");
    }
}
