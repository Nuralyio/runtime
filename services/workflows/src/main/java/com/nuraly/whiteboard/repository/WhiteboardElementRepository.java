package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardElementEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardElementRepository implements PanacheRepositoryBase<WhiteboardElementEntity, UUID> {

    public List<WhiteboardElementEntity> findByWhiteboardId(UUID whiteboardId) {
        return list("whiteboard.id = ?1 AND deletedAt IS NULL", whiteboardId);
    }

    public List<WhiteboardElementEntity> findByWhiteboardIdIncludingDeleted(UUID whiteboardId) {
        return list("whiteboard.id", whiteboardId);
    }

    public List<WhiteboardElementEntity> findByWhiteboardIdAndType(UUID whiteboardId, String elementType) {
        return list("whiteboard.id = ?1 AND elementType = ?2 AND deletedAt IS NULL", whiteboardId, elementType);
    }

    public long deleteByWhiteboardId(UUID whiteboardId) {
        return delete("whiteboard.id", whiteboardId);
    }

    /**
     * Soft delete an element (for OT tombstones).
     */
    public int softDelete(UUID elementId) {
        return update("deletedAt = ?1 WHERE id = ?2", Instant.now(), elementId);
    }

    /**
     * Restore a soft-deleted element.
     */
    public int restore(UUID elementId) {
        return update("deletedAt = NULL WHERE id = ?1", elementId);
    }
}
