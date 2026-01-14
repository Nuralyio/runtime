package com.nuraly.kv.service;

import com.nuraly.kv.dto.CreateKvNamespaceRequest;
import com.nuraly.kv.dto.KvNamespaceDTO;
import com.nuraly.kv.dto.UpdateKvNamespaceRequest;
import com.nuraly.kv.dto.mapper.KvNamespaceDTOMapper;
import com.nuraly.kv.entity.KvNamespaceEntity;
import com.nuraly.kv.exception.KvNamespaceNotFoundException;
import com.nuraly.library.permission.PermissionClient;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class KvNamespaceService {

    @Inject
    KvNamespaceDTOMapper namespaceMapper;

    @Inject
    PermissionClient permissionClient;

    @Inject
    KvEventService eventService;

    public List<KvNamespaceDTO> listNamespaces(String applicationId, String scope, String scopedResourceId, String userHeader) {
        List<KvNamespaceEntity> entities;

        // Build dynamic query based on provided filters
        StringBuilder query = new StringBuilder();
        java.util.Map<String, Object> params = new java.util.HashMap<>();

        if (applicationId != null && !applicationId.isEmpty()) {
            query.append("applicationId = :applicationId");
            params.put("applicationId", applicationId);
        }

        if (scope != null && !scope.isEmpty()) {
            if (query.length() > 0) query.append(" AND ");
            query.append("scope = :scope");
            params.put("scope", scope);
        }

        if (scopedResourceId != null && !scopedResourceId.isEmpty()) {
            if (query.length() > 0) query.append(" AND ");
            query.append("scopedResourceId = :scopedResourceId");
            params.put("scopedResourceId", scopedResourceId);
        }

        if (query.length() > 0) {
            entities = KvNamespaceEntity.list(query.toString(), params);
        } else {
            entities = KvNamespaceEntity.listAll();
        }

        List<String> accessibleIds = permissionClient.getAccessibleResources("kv-namespace", userHeader);
        return namespaceMapper.toDTOList(
            entities.stream()
                .filter(e -> accessibleIds.contains(String.valueOf(e.id)))
                .collect(Collectors.toList())
        );
    }

    public KvNamespaceDTO getNamespaceById(UUID namespaceId) {
        KvNamespaceEntity entity = KvNamespaceEntity.findById(namespaceId);
        if (entity == null) {
            throw new KvNamespaceNotFoundException("Namespace not found: " + namespaceId);
        }
        return namespaceMapper.toDTO(entity);
    }

    public KvNamespaceDTO createNamespace(CreateKvNamespaceRequest request, String userUuid) {
        // Note: Permission check for application:write is handled by the gateway
        // The user is already authenticated and the applicationId ownership is verified
        // through the namespace creation process (user must have access to the app)

        KvNamespaceEntity entity = namespaceMapper.toEntity(request);
        entity.createdBy = userUuid;
        entity.persist();

        if (userUuid != null) {
            // Initialize owner permissions for namespace operations (kv-namespace:read/write/delete)
            permissionClient.initOwnerPermissions("kv-namespace", String.valueOf(entity.id), userUuid);
            // Initialize owner permissions for entry operations (kv-entry:read/write/delete)
            permissionClient.initOwnerPermissions("kv-entry", String.valueOf(entity.id), userUuid);
            // Initialize owner permissions for secret operations (kv-secret:rotate)
            permissionClient.initOwnerPermissions("kv-secret", String.valueOf(entity.id), userUuid);
        }

        eventService.publishNamespaceCreated(entity.id, entity.name);

        return namespaceMapper.toDTO(entity);
    }

    public KvNamespaceDTO updateNamespace(UUID namespaceId, UpdateKvNamespaceRequest request, String userUuid) {
        KvNamespaceEntity entity = KvNamespaceEntity.findById(namespaceId);
        if (entity == null) {
            throw new KvNamespaceNotFoundException("Namespace not found: " + namespaceId);
        }

        namespaceMapper.updateEntity(request, entity);
        entity.updatedBy = userUuid;
        entity.persist();

        return namespaceMapper.toDTO(entity);
    }

    public void deleteNamespace(UUID namespaceId) {
        KvNamespaceEntity entity = KvNamespaceEntity.findById(namespaceId);
        if (entity == null) {
            throw new KvNamespaceNotFoundException("Namespace not found: " + namespaceId);
        }

        String name = entity.name;
        entity.delete();

        eventService.publishNamespaceDeleted(namespaceId, name);
    }

    public KvNamespaceEntity getNamespaceEntityById(UUID namespaceId) {
        KvNamespaceEntity entity = KvNamespaceEntity.findById(namespaceId);
        if (entity == null) {
            throw new KvNamespaceNotFoundException("Namespace not found: " + namespaceId);
        }
        return entity;
    }
}
