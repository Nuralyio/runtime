package com.nuraly.whiteboard.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.whiteboard.dto.*;
import com.nuraly.whiteboard.entity.*;
import com.nuraly.whiteboard.repository.*;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
public class WhiteboardService {

    @Inject
    WhiteboardRepository whiteboardRepository;

    @Inject
    WhiteboardElementRepository elementRepository;

    @Inject
    WhiteboardConnectorRepository connectorRepository;

    @Inject
    WhiteboardCommentRepository commentRepository;

    @Inject
    WhiteboardVoteRepository voteRepository;

    @Inject
    WhiteboardRevisionRepository revisionRepository;

    @Inject
    ObjectMapper objectMapper;

    // ==================== Whiteboard CRUD ====================

    @Transactional
    public WhiteboardDTO createAndMap(CreateWhiteboardDTO dto, String createdBy) {
        WhiteboardEntity whiteboard = new WhiteboardEntity();
        whiteboard.name = dto.name;
        whiteboard.description = dto.description;
        whiteboard.applicationId = dto.applicationId;
        whiteboard.createdBy = createdBy;
        whiteboard.templateId = dto.templateId;

        if (dto.backgroundColor != null) {
            whiteboard.backgroundColor = dto.backgroundColor;
        }
        if (dto.gridEnabled != null) {
            whiteboard.gridEnabled = dto.gridEnabled;
        }
        if (dto.gridSize != null) {
            whiteboard.gridSize = dto.gridSize;
        }
        if (dto.snapToGrid != null) {
            whiteboard.snapToGrid = dto.snapToGrid;
        }

        // Default viewport
        whiteboard.viewport = "{\"zoom\": 1.0, \"panX\": 0, \"panY\": 0}";

        whiteboardRepository.persist(whiteboard);
        return WhiteboardDTO.fromSummary(whiteboard);
    }

    @Transactional
    public Optional<WhiteboardEntity> getById(UUID id) {
        return whiteboardRepository.findByIdWithAll(id);
    }

    @Transactional
    public Optional<WhiteboardDTO> getByIdAsDTO(UUID id) {
        return whiteboardRepository.findByIdWithAll(id)
                .map(WhiteboardDTO::from);
    }

    @Transactional
    public List<WhiteboardDTO> listAll() {
        return whiteboardRepository.listAll().stream()
                .map(WhiteboardDTO::fromSummary)
                .toList();
    }

    @Transactional
    public List<WhiteboardDTO> listByApplicationId(String applicationId) {
        return whiteboardRepository.findByApplicationId(applicationId).stream()
                .map(WhiteboardDTO::fromSummary)
                .toList();
    }

    public List<WhiteboardEntity> getByApplicationId(String applicationId) {
        return whiteboardRepository.findByApplicationId(applicationId);
    }

    @Transactional
    public WhiteboardDTO updateAndMap(UUID id, CreateWhiteboardDTO dto) {
        WhiteboardEntity whiteboard = whiteboardRepository.findByIdWithAll(id)
                .orElseThrow(() -> new NotFoundException("Whiteboard not found: " + id));

        if (dto.name != null) whiteboard.name = dto.name;
        if (dto.description != null) whiteboard.description = dto.description;
        if (dto.backgroundColor != null) whiteboard.backgroundColor = dto.backgroundColor;
        if (dto.gridEnabled != null) whiteboard.gridEnabled = dto.gridEnabled;
        if (dto.gridSize != null) whiteboard.gridSize = dto.gridSize;
        if (dto.snapToGrid != null) whiteboard.snapToGrid = dto.snapToGrid;

        return WhiteboardDTO.from(whiteboard);
    }

    @Transactional
    public void delete(UUID id) {
        WhiteboardEntity whiteboard = whiteboardRepository.findById(id);
        if (whiteboard == null) {
            throw new NotFoundException("Whiteboard not found: " + id);
        }
        whiteboardRepository.delete(whiteboard);
    }

    // ==================== Element Operations ====================

    @Transactional
    public WhiteboardElementEntity addElement(UUID whiteboardId, CreateElementDTO dto, UUID createdBy) {
        WhiteboardEntity whiteboard = whiteboardRepository.findById(whiteboardId);
        if (whiteboard == null) {
            throw new NotFoundException("Whiteboard not found: " + whiteboardId);
        }

        WhiteboardElementEntity element = new WhiteboardElementEntity();
        element.whiteboard = whiteboard;
        element.name = dto.name != null ? dto.name : "Element";
        element.elementType = dto.elementType;
        element.positionX = dto.positionX != null ? dto.positionX : 0;
        element.positionY = dto.positionY != null ? dto.positionY : 0;
        element.width = dto.width;
        element.height = dto.height;
        element.zIndex = dto.zIndex != null ? dto.zIndex : 0;
        element.rotation = dto.rotation != null ? dto.rotation : 0f;
        element.opacity = dto.opacity != null ? dto.opacity : 1f;
        element.configuration = dto.configuration;
        element.backgroundColor = dto.backgroundColor;
        element.borderColor = dto.borderColor;
        element.borderWidth = dto.borderWidth;
        element.borderRadius = dto.borderRadius;
        element.textContent = dto.textContent;
        element.fontSize = dto.fontSize;
        element.fontFamily = dto.fontFamily;
        element.textColor = dto.textColor;
        element.textAlign = dto.textAlign;
        element.imageUrl = dto.imageUrl;
        element.imageAlt = dto.imageAlt;
        element.pathData = dto.pathData;
        element.shapeType = dto.shapeType;
        element.fillColor = dto.fillColor;
        element.createdBy = createdBy;
        element.lastEditedBy = createdBy;

        elementRepository.persist(element);
        return element;
    }

    @Transactional
    public WhiteboardElementEntity updateElement(UUID whiteboardId, UUID elementId, CreateElementDTO dto, UUID editedBy) {
        WhiteboardElementEntity element = elementRepository.findById(elementId);
        if (element == null || !element.whiteboard.id.equals(whiteboardId)) {
            throw new NotFoundException("Element not found: " + elementId);
        }

        if (dto.name != null) element.name = dto.name;
        if (dto.positionX != null) element.positionX = dto.positionX;
        if (dto.positionY != null) element.positionY = dto.positionY;
        if (dto.width != null) element.width = dto.width;
        if (dto.height != null) element.height = dto.height;
        if (dto.zIndex != null) element.zIndex = dto.zIndex;
        if (dto.rotation != null) element.rotation = dto.rotation;
        if (dto.opacity != null) element.opacity = dto.opacity;
        if (dto.configuration != null) element.configuration = dto.configuration;
        if (dto.backgroundColor != null) element.backgroundColor = dto.backgroundColor;
        if (dto.borderColor != null) element.borderColor = dto.borderColor;
        if (dto.borderWidth != null) element.borderWidth = dto.borderWidth;
        if (dto.borderRadius != null) element.borderRadius = dto.borderRadius;
        if (dto.textContent != null) element.textContent = dto.textContent;
        if (dto.fontSize != null) element.fontSize = dto.fontSize;
        if (dto.fontFamily != null) element.fontFamily = dto.fontFamily;
        if (dto.textColor != null) element.textColor = dto.textColor;
        if (dto.textAlign != null) element.textAlign = dto.textAlign;
        if (dto.imageUrl != null) element.imageUrl = dto.imageUrl;
        if (dto.pathData != null) element.pathData = dto.pathData;
        if (dto.shapeType != null) element.shapeType = dto.shapeType;
        if (dto.fillColor != null) element.fillColor = dto.fillColor;

        element.lastEditedBy = editedBy;

        return element;
    }

    @Transactional
    public WhiteboardElementDTO addElementAndMap(UUID whiteboardId, CreateElementDTO dto, UUID createdBy) {
        return WhiteboardElementDTO.from(addElement(whiteboardId, dto, createdBy));
    }

    @Transactional
    public WhiteboardElementDTO updateElementAndMap(UUID whiteboardId, UUID elementId, CreateElementDTO dto, UUID editedBy) {
        return WhiteboardElementDTO.from(updateElement(whiteboardId, elementId, dto, editedBy));
    }

    @Transactional
    public void deleteElement(UUID whiteboardId, UUID elementId) {
        WhiteboardElementEntity element = elementRepository.findById(elementId);
        if (element == null || !element.whiteboard.id.equals(whiteboardId)) {
            throw new NotFoundException("Element not found: " + elementId);
        }
        // Soft delete for OT
        element.deletedAt = Instant.now();
    }

    // ==================== Comment Operations ====================

    public List<WhiteboardCommentEntity> getComments(UUID whiteboardId) {
        return commentRepository.findByWhiteboardId(whiteboardId);
    }

    @Transactional
    public WhiteboardCommentEntity addComment(UUID whiteboardId, UUID elementId, String content,
                                               UUID authorId, String authorName, UUID parentId) {
        WhiteboardCommentEntity comment = new WhiteboardCommentEntity();
        comment.whiteboardId = whiteboardId;
        comment.elementId = elementId;
        comment.content = content;
        comment.authorId = authorId;
        comment.authorName = authorName;
        comment.parentId = parentId;

        commentRepository.persist(comment);
        return comment;
    }

    @Transactional
    public void resolveComment(UUID commentId, UUID resolvedBy) {
        WhiteboardCommentEntity comment = commentRepository.findById(commentId);
        if (comment == null) {
            throw new NotFoundException("Comment not found: " + commentId);
        }
        comment.resolve(resolvedBy);
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        WhiteboardCommentEntity comment = commentRepository.findById(commentId);
        if (comment == null) {
            throw new NotFoundException("Comment not found: " + commentId);
        }
        commentRepository.delete(comment);
    }

    // ==================== Vote Operations ====================

    public VoteSummaryDTO getVoteSummary(UUID whiteboardId, UUID elementId) {
        List<WhiteboardVoteEntity> votes = voteRepository.findByElementId(elementId);

        VoteSummaryDTO summary = new VoteSummaryDTO();
        summary.elementId = elementId;
        summary.totalVotes = votes.size();
        summary.voteCounts = votes.stream()
                .collect(Collectors.groupingBy(v -> v.value, Collectors.counting()));
        summary.votes = votes.stream()
                .map(v -> VoteSummaryDTO.VoteDTO.of(v.userId, v.userName, v.value))
                .toList();

        return summary;
    }

    @Transactional
    public VoteSummaryDTO castVote(UUID whiteboardId, UUID elementId, UUID userId, String userName, String value) {
        // Check if user already voted
        Optional<WhiteboardVoteEntity> existingVote = voteRepository.findByElementIdAndUserId(elementId, userId);

        if (existingVote.isPresent()) {
            // Update existing vote
            WhiteboardVoteEntity vote = existingVote.get();
            vote.value = value;
        } else {
            // Create new vote
            WhiteboardVoteEntity vote = new WhiteboardVoteEntity();
            vote.whiteboardId = whiteboardId;
            vote.elementId = elementId;
            vote.userId = userId;
            vote.userName = userName;
            vote.value = value;
            voteRepository.persist(vote);
        }

        return getVoteSummary(whiteboardId, elementId);
    }

    @Transactional
    public void removeVote(UUID elementId, UUID userId) {
        voteRepository.deleteByElementIdAndUserId(elementId, userId);
    }

    // ==================== Revision Operations ====================

    public List<WhiteboardRevisionEntity> getRevisions(UUID whiteboardId) {
        return revisionRepository.findByWhiteboardId(whiteboardId);
    }

    @Transactional
    public WhiteboardRevisionEntity createRevision(UUID whiteboardId, UUID createdBy, String label) {
        WhiteboardEntity whiteboard = whiteboardRepository.findByIdWithAll(whiteboardId)
                .orElseThrow(() -> new NotFoundException("Whiteboard not found: " + whiteboardId));

        WhiteboardRevisionEntity revision = new WhiteboardRevisionEntity();
        revision.whiteboardId = whiteboardId;
        revision.revision = revisionRepository.getNextRevisionNumber(whiteboardId);
        revision.label = label;
        revision.createdBy = createdBy;

        // Create snapshot
        try {
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("elements", whiteboard.elements.stream()
                    .filter(e -> e.deletedAt == null)
                    .map(WhiteboardElementDTO::from)
                    .toList());
            snapshot.put("connectors", whiteboard.connectors.stream()
                    .filter(c -> c.deletedAt == null)
                    .map(WhiteboardConnectorDTO::from)
                    .toList());
            snapshot.put("settings", Map.of(
                    "backgroundColor", whiteboard.backgroundColor,
                    "gridEnabled", whiteboard.gridEnabled,
                    "gridSize", whiteboard.gridSize,
                    "snapToGrid", whiteboard.snapToGrid,
                    "viewport", whiteboard.viewport
            ));

            revision.snapshot = objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to create revision snapshot", e);
        }

        revisionRepository.persist(revision);
        return revision;
    }

    @Transactional
    public WhiteboardEntity restoreRevision(UUID whiteboardId, Integer revisionNumber) {
        WhiteboardEntity whiteboard = whiteboardRepository.findByIdWithAll(whiteboardId)
                .orElseThrow(() -> new NotFoundException("Whiteboard not found: " + whiteboardId));

        WhiteboardRevisionEntity revision = revisionRepository.findByWhiteboardIdAndRevision(whiteboardId, revisionNumber)
                .orElseThrow(() -> new NotFoundException("Revision not found: " + revisionNumber));

        // Parse snapshot and restore
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> snapshot = objectMapper.readValue(revision.snapshot, Map.class);

            // Clear existing elements (soft delete)
            whiteboard.elements.forEach(e -> e.deletedAt = Instant.now());
            whiteboard.connectors.forEach(c -> c.deletedAt = Instant.now());

            // Restore settings
            @SuppressWarnings("unchecked")
            Map<String, Object> settings = (Map<String, Object>) snapshot.get("settings");
            if (settings != null) {
                whiteboard.backgroundColor = (String) settings.get("backgroundColor");
                whiteboard.gridEnabled = (Boolean) settings.get("gridEnabled");
                whiteboard.gridSize = (Integer) settings.get("gridSize");
                whiteboard.snapToGrid = (Boolean) settings.get("snapToGrid");
                whiteboard.viewport = (String) settings.get("viewport");
            }

            // Note: Full element restoration would require recreating entities from the snapshot
            // This is a simplified version - full implementation would deserialize and create new entities

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to restore revision", e);
        }

        return whiteboard;
    }

    @Transactional
    public WhiteboardDTO restoreRevisionAndMap(UUID whiteboardId, Integer revisionNumber) {
        WhiteboardEntity whiteboard = restoreRevision(whiteboardId, revisionNumber);
        return WhiteboardDTO.from(whiteboard);
    }
}
