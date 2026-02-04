package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardRevisionEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardRevisionRepository implements PanacheRepositoryBase<WhiteboardRevisionEntity, UUID> {

    public List<WhiteboardRevisionEntity> findByWhiteboardId(UUID whiteboardId) {
        return list("whiteboardId ORDER BY revision DESC", whiteboardId);
    }

    public Optional<WhiteboardRevisionEntity> findByWhiteboardIdAndRevision(UUID whiteboardId, Integer revision) {
        return find("whiteboardId = ?1 AND revision = ?2", whiteboardId, revision).firstResultOptional();
    }

    public Optional<WhiteboardRevisionEntity> findLatestByWhiteboardId(UUID whiteboardId) {
        return find("whiteboardId = ?1 ORDER BY revision DESC", whiteboardId).firstResultOptional();
    }

    public Integer getNextRevisionNumber(UUID whiteboardId) {
        return findLatestByWhiteboardId(whiteboardId)
                .map(r -> r.revision + 1)
                .orElse(1);
    }

    public long countByWhiteboardId(UUID whiteboardId) {
        return count("whiteboardId", whiteboardId);
    }

    public long deleteByWhiteboardId(UUID whiteboardId) {
        return delete("whiteboardId", whiteboardId);
    }
}
