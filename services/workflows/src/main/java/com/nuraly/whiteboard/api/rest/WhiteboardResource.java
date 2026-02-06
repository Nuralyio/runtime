package com.nuraly.whiteboard.api.rest;

import com.nuraly.whiteboard.dto.*;
import com.nuraly.whiteboard.entity.WhiteboardCommentEntity;
import com.nuraly.whiteboard.entity.WhiteboardElementEntity;
import com.nuraly.whiteboard.entity.WhiteboardEntity;
import com.nuraly.whiteboard.entity.WhiteboardRevisionEntity;
import com.nuraly.whiteboard.service.WhiteboardService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Path("/api/v1/whiteboards")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class WhiteboardResource {

    @Inject
    WhiteboardService whiteboardService;

    // ==================== Whiteboard CRUD ====================

    @POST
    public Response createWhiteboard(CreateWhiteboardDTO dto, @HeaderParam("X-User-Id") String userId) {
        WhiteboardDTO result = whiteboardService.createAndMap(dto, userId);
        return Response.created(URI.create("/api/v1/whiteboards/" + result.id))
                .entity(result)
                .build();
    }

    @GET
    @Path("/{id}")
    public Response getWhiteboard(@PathParam("id") UUID id) {
        return whiteboardService.getByIdAsDTO(id)
                .map(dto -> Response.ok(dto).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @GET
    public Response listWhiteboards(@QueryParam("applicationId") String applicationId) {
        List<WhiteboardDTO> whiteboards;
        if (applicationId != null && !applicationId.isBlank()) {
            whiteboards = whiteboardService.listByApplicationId(applicationId);
        } else {
            whiteboards = whiteboardService.listAll();
        }
        return Response.ok(whiteboards).build();
    }

    @PUT
    @Path("/{id}")
    public Response updateWhiteboard(@PathParam("id") UUID id, CreateWhiteboardDTO dto) {
        WhiteboardDTO result = whiteboardService.updateAndMap(id, dto);
        return Response.ok(result).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteWhiteboard(@PathParam("id") UUID id) {
        whiteboardService.delete(id);
        return Response.noContent().build();
    }

    // ==================== Element Operations ====================

    @POST
    @Path("/{id}/elements")
    public Response addElement(
            @PathParam("id") UUID whiteboardId,
            CreateElementDTO dto,
            @HeaderParam("X-User-Id") String userId
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        WhiteboardElementDTO result = whiteboardService.addElementAndMap(whiteboardId, dto, userUuid);
        return Response.created(URI.create("/api/v1/whiteboards/" + whiteboardId + "/elements/" + result.id))
                .entity(result)
                .build();
    }

    @PUT
    @Path("/{id}/elements/{elementId}")
    public Response updateElement(
            @PathParam("id") UUID whiteboardId,
            @PathParam("elementId") UUID elementId,
            CreateElementDTO dto,
            @HeaderParam("X-User-Id") String userId
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        WhiteboardElementDTO result = whiteboardService.updateElementAndMap(whiteboardId, elementId, dto, userUuid);
        return Response.ok(result).build();
    }

    @DELETE
    @Path("/{id}/elements/{elementId}")
    public Response deleteElement(
            @PathParam("id") UUID whiteboardId,
            @PathParam("elementId") UUID elementId
    ) {
        whiteboardService.deleteElement(whiteboardId, elementId);
        return Response.noContent().build();
    }

    // ==================== Comment Operations ====================

    @GET
    @Path("/{id}/comments")
    public Response getComments(@PathParam("id") UUID whiteboardId) {
        List<CommentDTO> comments = whiteboardService.getComments(whiteboardId)
                .stream()
                .map(CommentDTO::from)
                .toList();
        return Response.ok(comments).build();
    }

    @POST
    @Path("/{id}/comments")
    public Response addComment(
            @PathParam("id") UUID whiteboardId,
            CreateCommentDTO dto,
            @HeaderParam("X-User-Id") String userId,
            @HeaderParam("X-User-Name") String userName
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        WhiteboardCommentEntity comment = whiteboardService.addComment(
                whiteboardId,
                dto.elementId,
                dto.content,
                userUuid,
                userName,
                dto.parentId
        );
        return Response.created(URI.create("/api/v1/whiteboards/" + whiteboardId + "/comments/" + comment.id))
                .entity(CommentDTO.from(comment))
                .build();
    }

    @POST
    @Path("/{id}/comments/{commentId}/resolve")
    public Response resolveComment(
            @PathParam("id") UUID whiteboardId,
            @PathParam("commentId") UUID commentId,
            @HeaderParam("X-User-Id") String userId
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        whiteboardService.resolveComment(commentId, userUuid);
        return Response.ok().build();
    }

    @DELETE
    @Path("/{id}/comments/{commentId}")
    public Response deleteComment(
            @PathParam("id") UUID whiteboardId,
            @PathParam("commentId") UUID commentId
    ) {
        whiteboardService.deleteComment(commentId);
        return Response.noContent().build();
    }

    // ==================== Vote Operations ====================

    @GET
    @Path("/{id}/elements/{elementId}/votes")
    public Response getVotes(
            @PathParam("id") UUID whiteboardId,
            @PathParam("elementId") UUID elementId
    ) {
        VoteSummaryDTO summary = whiteboardService.getVoteSummary(whiteboardId, elementId);
        return Response.ok(summary).build();
    }

    @POST
    @Path("/{id}/elements/{elementId}/votes")
    public Response castVote(
            @PathParam("id") UUID whiteboardId,
            @PathParam("elementId") UUID elementId,
            CastVoteDTO dto,
            @HeaderParam("X-User-Id") String userId,
            @HeaderParam("X-User-Name") String userName
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        VoteSummaryDTO summary = whiteboardService.castVote(
                whiteboardId,
                elementId,
                userUuid,
                userName,
                dto.value
        );
        return Response.ok(summary).build();
    }

    @DELETE
    @Path("/{id}/elements/{elementId}/votes")
    public Response removeVote(
            @PathParam("id") UUID whiteboardId,
            @PathParam("elementId") UUID elementId,
            @HeaderParam("X-User-Id") String userId
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        whiteboardService.removeVote(elementId, userUuid);
        return Response.noContent().build();
    }

    // ==================== Revision Operations ====================

    @GET
    @Path("/{id}/revisions")
    public Response getRevisions(@PathParam("id") UUID whiteboardId) {
        List<RevisionDTO> revisions = whiteboardService.getRevisions(whiteboardId)
                .stream()
                .map(RevisionDTO::from)
                .toList();
        return Response.ok(revisions).build();
    }

    @POST
    @Path("/{id}/revisions")
    public Response createRevision(
            @PathParam("id") UUID whiteboardId,
            CreateRevisionDTO dto,
            @HeaderParam("X-User-Id") String userId
    ) {
        UUID userUuid = userId != null ? UUID.fromString(userId) : null;
        WhiteboardRevisionEntity revision = whiteboardService.createRevision(
                whiteboardId,
                userUuid,
                dto != null ? dto.label : null
        );
        return Response.created(URI.create("/api/v1/whiteboards/" + whiteboardId + "/revisions/" + revision.revision))
                .entity(RevisionDTO.from(revision))
                .build();
    }

    @POST
    @Path("/{id}/revisions/{revision}/restore")
    public Response restoreRevision(
            @PathParam("id") UUID whiteboardId,
            @PathParam("revision") Integer revision
    ) {
        WhiteboardDTO result = whiteboardService.restoreRevisionAndMap(whiteboardId, revision);
        return Response.ok(result).build();
    }
}
