package com.nuraly.functions.api.rest;

import com.nuraly.functions.dto.EventDTO;
import com.nuraly.functions.service.EventService;
import com.nuraly.functions.exception.EventNotFoundException;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.jboss.resteasy.reactive.RestPath;
import org.jboss.resteasy.reactive.RestResponse;

@Path("/api/v3/events")
@OpenAPIDefinition(
        info = @Info(title = "Event API", version = "1.0"),
        tags = {
                @Tag(name = "Event", description = "Operations related to events")
        }
)
public class EventResource {

    @Inject
    EventService eventService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Events retrieved"),
            @APIResponse(responseCode = "500", description = "Internal server error")
    })
    @Operation(summary = "Retrieve all events")
    public RestResponse<List<EventDTO>> getEvents() {
        List<EventDTO> events = eventService.getEvents();
        return RestResponse.ok(events);
    }

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Event retrieved"),
            @APIResponse(responseCode = "404", description = "Event not found")
    })
    @Operation(summary = "Retrieve an event by ID")
    public RestResponse<EventDTO> getEventById(@PathParam("id") Long eventId) throws EventNotFoundException {
        EventDTO eventDTO = eventService.getEventById(eventId);
        return RestResponse.ok(eventDTO);
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "201", description = "Event created"),
            @APIResponse(responseCode = "400", description = "Invalid request payload")
    })
    @Operation(summary = "Create a new event")
    public RestResponse<EventDTO> createEvent(@Valid EventDTO eventDTO) {
        EventDTO createdEventDTO = eventService.createEvent(eventDTO);
        return RestResponse.status(RestResponse.Status.CREATED, createdEventDTO);
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Event updated"),
            @APIResponse(responseCode = "400", description = "Invalid request payload"),
            @APIResponse(responseCode = "404", description = "Event not found")
    })
    @Operation(summary = "Update an existing event")
    public RestResponse<EventDTO> updateEvent(@RestPath Long id, @Valid EventDTO eventDTO) throws EventNotFoundException {
        EventDTO updatedEventDTO = eventService.updateEvent(id, eventDTO);
        return RestResponse.ok(updatedEventDTO);
    }

    @DELETE
    @Path("/{id}")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Event deleted"),
            @APIResponse(responseCode = "404", description = "Event not found")
    })
    @Operation(summary = "Delete an event by ID")
    public RestResponse<Void> deleteEvent(@RestPath Long id) throws EventNotFoundException {
        eventService.deleteEvent(id);
        return RestResponse.noContent();
    }
}
