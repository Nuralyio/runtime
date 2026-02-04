package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardConnectorEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardConnectorRepository implements PanacheRepositoryBase<WhiteboardConnectorEntity, UUID> {

    public List<WhiteboardConnectorEntity> findByWhiteboardId(UUID whiteboardId) {
        return list("whiteboard.id = ?1 AND deletedAt IS NULL", whiteboardId);
    }

    public List<WhiteboardConnectorEntity> findBySourceElementId(UUID sourceElementId) {
        return list("sourceElementId = ?1 AND deletedAt IS NULL", sourceElementId);
    }

    public List<WhiteboardConnectorEntity> findByTargetElementId(UUID targetElementId) {
        return list("targetElementId = ?1 AND deletedAt IS NULL", targetElementId);
    }

    public long deleteByWhiteboardId(UUID whiteboardId) {
        return delete("whiteboard.id", whiteboardId);
    }

    /**
     * Soft delete a connector (for OT tombstones).
     */
    public int softDelete(UUID connectorId) {
        return update("deletedAt = ?1 WHERE id = ?2", Instant.now(), connectorId);
    }
}
