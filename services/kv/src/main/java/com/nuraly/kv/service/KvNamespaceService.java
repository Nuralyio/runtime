package com.nuraly.kv.service;

import com.nuraly.kv.dto.CreateKvNamespaceRequest;
import com.nuraly.kv.dto.KvNamespaceDTO;
import com.nuraly.kv.dto.UpdateKvNamespaceRequest;
import com.nuraly.kv.dto.mapper.KvNamespaceDTOMapper;
import com.nuraly.kv.entity.KvNamespaceEntity;
import com.nuraly.kv.exception.KvNamespaceNotFoundException;
import com.nuralyio.shared.permission.PermissionCheckRequest;
import com.nuralyio.shared.permission.PermissionClient;
import com.nuralyio.shared.permission.exception.PermissionDeniedException;
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

    public List<KvNamespaceDTO> listNamespaces(String applicationId, String userHeader) {
        List<KvNamespaceEntity> entities;
        if (applicationId != null && !applicationId.isEmpty()) {
            entities = KvNamespaceEntity.list("applicationId", applicationId);
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
        String applicationId = request.getApplicationId();
        if (applicationId != null && !applicationId.isEmpty() && userUuid != null) {
            PermissionCheckRequest checkRequest = PermissionCheckRequest.builder()
                .userId(userUuid)
                .permissionType("application:write")
                .resourceType("application")
                .resourceId(applicationId)
                .build();

            if (!permissionClient.hasPermission(checkRequest)) {
                throw new PermissionDeniedException("Permission denied: application:write on " + applicationId);
            }
        }

        KvNamespaceEntity entity = namespaceMapper.toEntity(request);
        entity.createdBy = userUuid;
        entity.persist();

        if (userUuid != null) {
            permissionClient.initOwnerPermissions("kv-namespace", String.valueOf(entity.id), userUuid);
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
