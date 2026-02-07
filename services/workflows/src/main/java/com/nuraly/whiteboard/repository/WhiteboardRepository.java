package com.nuraly.whiteboard.repository;

import com.nuraly.whiteboard.entity.WhiteboardEntity;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class WhiteboardRepository implements PanacheRepositoryBase<WhiteboardEntity, UUID> {

    public Optional<WhiteboardEntity> findByIdWithElements(UUID id) {
        return find("SELECT w FROM WhiteboardEntity w LEFT JOIN FETCH w.elements WHERE w.id = ?1", id)
                .firstResultOptional();
    }

    /**
     * Fetch a whiteboard with both elements and connectors eagerly loaded.
     * Uses two separate queries to avoid Hibernate's MultipleBagFetchException
     * (cannot JOIN FETCH two List collections in a single query).
     */
    public Optional<WhiteboardEntity> findByIdWithAll(UUID id) {
        // First query: fetch whiteboard + elements
        Optional<WhiteboardEntity> result = find(
                "SELECT DISTINCT w FROM WhiteboardEntity w LEFT JOIN FETCH w.elements WHERE w.id = ?1", id)
                .firstResultOptional();

        if (result.isPresent()) {
            // Second query: fetch connectors into the same persistence context
            find("SELECT DISTINCT w FROM WhiteboardEntity w LEFT JOIN FETCH w.connectors WHERE w.id = ?1", id)
                    .firstResultOptional();
        }

        return result;
    }

    public List<WhiteboardEntity> findByApplicationId(String applicationId) {
        return list("applicationId", applicationId);
    }

    public List<WhiteboardEntity> findByCreatedBy(String createdBy) {
        return list("createdBy", createdBy);
    }

    public long countByApplicationId(String applicationId) {
        return count("applicationId", applicationId);
    }
}
