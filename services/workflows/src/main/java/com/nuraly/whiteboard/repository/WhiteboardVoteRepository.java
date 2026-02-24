package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardVoteEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardVoteRepository implements PanacheRepositoryBase<WhiteboardVoteEntity, UUID> {

    public List<WhiteboardVoteEntity> findByElementId(UUID elementId) {
        return list("elementId", elementId);
    }

    public List<WhiteboardVoteEntity> findByWhiteboardId(UUID whiteboardId) {
        return list("whiteboardId", whiteboardId);
    }

    public Optional<WhiteboardVoteEntity> findByElementIdAndUserId(UUID elementId, UUID userId) {
        return find("elementId = ?1 AND userId = ?2", elementId, userId).firstResultOptional();
    }

    public long countByElementId(UUID elementId) {
        return count("elementId", elementId);
    }

    public long deleteByElementId(UUID elementId) {
        return delete("elementId", elementId);
    }

    public long deleteByWhiteboardId(UUID whiteboardId) {
        return delete("whiteboardId", whiteboardId);
    }

    public int deleteByElementIdAndUserId(UUID elementId, UUID userId) {
        return (int) delete("elementId = ?1 AND userId = ?2", elementId, userId);
    }
}
