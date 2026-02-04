package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardCommentEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardCommentRepository implements PanacheRepositoryBase<WhiteboardCommentEntity, UUID> {

    public List<WhiteboardCommentEntity> findByWhiteboardId(UUID whiteboardId) {
        return list("whiteboardId", whiteboardId);
    }

    public List<WhiteboardCommentEntity> findByElementId(UUID elementId) {
        return list("elementId", elementId);
    }

    public List<WhiteboardCommentEntity> findRootCommentsByWhiteboardId(UUID whiteboardId) {
        return list("whiteboardId = ?1 AND parentId IS NULL", whiteboardId);
    }

    public List<WhiteboardCommentEntity> findReplies(UUID parentId) {
        return list("parentId", parentId);
    }

    public List<WhiteboardCommentEntity> findUnresolvedByWhiteboardId(UUID whiteboardId) {
        return list("whiteboardId = ?1 AND resolved = false", whiteboardId);
    }

    public long countByWhiteboardId(UUID whiteboardId) {
        return count("whiteboardId", whiteboardId);
    }

    public long countUnresolvedByWhiteboardId(UUID whiteboardId) {
        return count("whiteboardId = ?1 AND resolved = false", whiteboardId);
    }

    public long deleteByWhiteboardId(UUID whiteboardId) {
        return delete("whiteboardId", whiteboardId);
    }

    public long deleteByElementId(UUID elementId) {
        return delete("elementId", elementId);
    }
}
