package com.nuraly.kv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.*;
import com.nuraly.kv.dto.mapper.KvEntryDTOMapper;
import com.nuraly.kv.dto.mapper.KvEntryVersionDTOMapper;
import com.nuraly.kv.entity.KvEntryEntity;
import com.nuraly.kv.entity.KvEntryVersionEntity;
import com.nuraly.kv.entity.KvNamespaceEntity;
import com.nuraly.kv.entity.enums.KvValueType;
import com.nuraly.kv.exception.KvEntryNotFoundException;
import com.nuraly.kv.exception.KvVersionConflictException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.*;

@ApplicationScoped
@Transactional
public class KvEntryService {

    @Inject
    KvNamespaceService namespaceService;

    @Inject
    KvEncryptionService encryptionService;

    @Inject
    KvAuditService auditService;

    @Inject
    KvEventService eventService;

    @Inject
    KvEntryDTOMapper entryMapper;

    @Inject
    KvEntryVersionDTOMapper versionMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<KvEntryDTO> listEntries(UUID namespaceId, String prefix) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);

        List<KvEntryEntity> entries;
        if (prefix != null && !prefix.isEmpty()) {
            entries = KvEntryEntity.list("namespace = ?1 and keyPath like ?2",
                namespace, prefix + "%");
        } else {
            entries = KvEntryEntity.list("namespace", namespace);
        }

        List<KvEntryDTO> dtos = new ArrayList<>();
        for (KvEntryEntity entry : entries) {
            KvEntryDTO dto = entryMapper.toDTO(entry);
            dto.setValue(decryptAndParseValue(entry, namespace.isSecretNamespace));
            dtos.add(dto);
        }
        return dtos;
    }

    public KvEntryDTO getEntry(UUID namespaceId, String keyPath, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);
        KvEntryEntity entry = findEntry(namespace, keyPath);

        auditService.logRead(namespaceId, entry.id, keyPath, userId, true);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(decryptAndParseValue(entry, namespace.isSecretNamespace));
        return dto;
    }

    public KvEntryDTO setEntry(UUID namespaceId, String keyPath, SetKvEntryRequest request, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);

        KvEntryEntity entry = KvEntryEntity.find("namespace = ?1 and keyPath = ?2",
            namespace, keyPath).firstResult();

        boolean isNew = entry == null;

        if (isNew) {
            entry = new KvEntryEntity();
            entry.namespace = namespace;
            entry.keyPath = keyPath;
            entry.createdBy = userId;
        } else {
            if (request.getExpectedVersion() != null &&
                !request.getExpectedVersion().equals(entry.version)) {
                throw new KvVersionConflictException(
                    "Version conflict: expected " + request.getExpectedVersion() +
                    " but found " + entry.version);
            }

            if (Boolean.TRUE.equals(namespace.isSecretNamespace)) {
                saveVersionHistory(entry, userId, "update");
            }
        }

        String valueToStore = serializeValue(request.getValue(), request.getValueType());
        if (Boolean.TRUE.equals(namespace.isSecretNamespace)) {
            valueToStore = encryptionService.encrypt(valueToStore);
            entry.isEncrypted = true;
        }

        entry.valueData = valueToStore;
        entry.valueType = request.getValueType() != null ? request.getValueType() : KvValueType.STRING;
        entry.metadata = request.getMetadata();
        entry.updatedBy = userId;

        Long ttl = request.getTtlSeconds();
        if (ttl == null && namespace.defaultTtlSeconds != null) {
            ttl = namespace.defaultTtlSeconds;
        }
        if (ttl != null && ttl > 0) {
            entry.expiresAt = Instant.now().plusSeconds(ttl);
        } else {
            entry.expiresAt = null;
        }

        entry.persist();

        auditService.logWrite(namespaceId, entry.id, keyPath, userId, true);

        if (isNew) {
            eventService.publishEntryCreated(namespaceId, entry.id, keyPath);
        } else {
            eventService.publishEntryUpdated(namespaceId, entry.id, keyPath);
        }

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(request.getValue());
        return dto;
    }

    public void deleteEntry(UUID namespaceId, String keyPath, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);
        KvEntryEntity entry = findEntry(namespace, keyPath);

        UUID entryId = entry.id;
        entry.delete();

        auditService.logDelete(namespaceId, entryId, keyPath, userId, true);
        eventService.publishEntryDeleted(namespaceId, entryId, keyPath);
    }

    public KvEntryDTO rotateSecret(UUID namespaceId, String keyPath, Object newValue, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);

        if (!Boolean.TRUE.equals(namespace.isSecretNamespace)) {
            throw new IllegalStateException("Rotation only supported for secret namespaces");
        }

        KvEntryEntity entry = findEntry(namespace, keyPath);

        saveVersionHistory(entry, userId, "rotation");

        String valueToStore = serializeValue(newValue, entry.valueType);
        valueToStore = encryptionService.encrypt(valueToStore);

        entry.valueData = valueToStore;
        entry.updatedBy = userId;
        entry.persist();

        auditService.logRotate(namespaceId, entry.id, keyPath, userId, true);
        eventService.publishSecretRotated(namespaceId, entry.id, keyPath, entry.version);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(newValue);
        return dto;
    }

    public List<KvEntryVersionDTO> getVersionHistory(UUID namespaceId, String keyPath) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);
        KvEntryEntity entry = findEntry(namespace, keyPath);

        List<KvEntryVersionEntity> versions = KvEntryVersionEntity.list(
            "entry = ?1 order by version desc", entry);

        List<KvEntryVersionDTO> dtos = new ArrayList<>();
        for (KvEntryVersionEntity version : versions) {
            KvEntryVersionDTO dto = versionMapper.toDTO(version);
            dto.setValue(decryptAndParseValue(version.valueData, entry.valueType,
                Boolean.TRUE.equals(entry.isEncrypted)));
            dtos.add(dto);
        }
        return dtos;
    }

    public KvEntryDTO rollbackToVersion(UUID namespaceId, String keyPath, Long targetVersion, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);
        KvEntryEntity entry = findEntry(namespace, keyPath);

        KvEntryVersionEntity versionEntity = KvEntryVersionEntity.find(
            "entry = ?1 and version = ?2", entry, targetVersion).firstResult();

        if (versionEntity == null) {
            throw new KvEntryNotFoundException("Version " + targetVersion + " not found");
        }

        saveVersionHistory(entry, userId, "rollback");

        entry.valueData = versionEntity.valueData;
        entry.updatedBy = userId;
        entry.persist();

        auditService.logRollback(namespaceId, entry.id, keyPath, userId, true);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(decryptAndParseValue(entry, namespace.isSecretNamespace));
        return dto;
    }

    public BulkOperationResponse bulkGet(UUID namespaceId, BulkGetRequest request, String userId) {
        KvNamespaceEntity namespace = namespaceService.getNamespaceEntityById(namespaceId);

        BulkOperationResponse response = new BulkOperationResponse();
        response.setResults(new HashMap<>());

        for (String key : request.getKeys()) {
            try {
                KvEntryEntity entry = KvEntryEntity.find("namespace = ?1 and keyPath = ?2",
                    namespace, key).firstResult();

                if (entry != null) {
                    KvEntryDTO dto = entryMapper.toDTO(entry);
                    dto.setValue(decryptAndParseValue(entry, namespace.isSecretNamespace));
                    response.getResults().put(key, dto);
                    response.setSuccessCount(response.getSuccessCount() + 1);
                } else {
                    response.getFailedKeys().add(key);
                    response.setFailureCount(response.getFailureCount() + 1);
                }
            } catch (Exception e) {
                response.getFailedKeys().add(key);
                response.setFailureCount(response.getFailureCount() + 1);
            }
        }

        return response;
    }

    public BulkOperationResponse bulkSet(UUID namespaceId, BulkSetRequest request, String userId) {
        BulkOperationResponse response = new BulkOperationResponse();
        response.setResults(new HashMap<>());

        for (BulkSetRequest.BulkSetEntry bulkEntry : request.getEntries()) {
            try {
                SetKvEntryRequest setRequest = new SetKvEntryRequest();
                setRequest.setValue(bulkEntry.getValue());
                if (bulkEntry.getValueType() != null) {
                    setRequest.setValueType(KvValueType.valueOf(bulkEntry.getValueType()));
                }
                setRequest.setTtlSeconds(bulkEntry.getTtlSeconds());

                KvEntryDTO dto = setEntry(namespaceId, bulkEntry.getKey(), setRequest, userId);
                response.getResults().put(bulkEntry.getKey(), dto);
                response.setSuccessCount(response.getSuccessCount() + 1);
            } catch (Exception e) {
                response.getFailedKeys().add(bulkEntry.getKey());
                response.setFailureCount(response.getFailureCount() + 1);
            }
        }

        return response;
    }

    public BulkOperationResponse bulkDelete(UUID namespaceId, BulkDeleteRequest request, String userId) {
        BulkOperationResponse response = new BulkOperationResponse();

        for (String key : request.getKeys()) {
            try {
                deleteEntry(namespaceId, key, userId);
                response.setSuccessCount(response.getSuccessCount() + 1);
            } catch (Exception e) {
                response.getFailedKeys().add(key);
                response.setFailureCount(response.getFailureCount() + 1);
            }
        }

        return response;
    }

    private KvEntryEntity findEntry(KvNamespaceEntity namespace, String keyPath) {
        KvEntryEntity entry = KvEntryEntity.find("namespace = ?1 and keyPath = ?2",
            namespace, keyPath).firstResult();

        if (entry == null) {
            throw new KvEntryNotFoundException("Entry not found: " + keyPath);
        }
        return entry;
    }

    private void saveVersionHistory(KvEntryEntity entry, String userId, String reason) {
        KvEntryVersionEntity versionEntity = new KvEntryVersionEntity();
        versionEntity.entry = entry;
        versionEntity.version = entry.version;
        versionEntity.valueData = entry.valueData;
        versionEntity.changedBy = userId;
        versionEntity.changeReason = reason;
        versionEntity.persist();
    }

    private String serializeValue(Object value, KvValueType type) {
        if (value == null) {
            return null;
        }

        if (type == KvValueType.JSON) {
            try {
                return objectMapper.writeValueAsString(value);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid JSON value", e);
            }
        }

        return String.valueOf(value);
    }

    private Object decryptAndParseValue(KvEntryEntity entry, Boolean isSecretNamespace) {
        return decryptAndParseValue(entry.valueData, entry.valueType,
            Boolean.TRUE.equals(isSecretNamespace) && Boolean.TRUE.equals(entry.isEncrypted));
    }

    private Object decryptAndParseValue(String valueData, KvValueType type, boolean isEncrypted) {
        if (valueData == null) {
            return null;
        }

        String value = valueData;
        if (isEncrypted) {
            value = encryptionService.decrypt(valueData);
        }

        return parseValue(value, type);
    }

    private Object parseValue(String value, KvValueType type) {
        if (value == null) {
            return null;
        }

        switch (type) {
            case JSON:
                try {
                    return objectMapper.readValue(value, Object.class);
                } catch (JsonProcessingException e) {
                    return value;
                }
            case NUMBER:
                try {
                    if (value.contains(".")) {
                        return Double.parseDouble(value);
                    }
                    return Long.parseLong(value);
                } catch (NumberFormatException e) {
                    return value;
                }
            case BOOLEAN:
                return Boolean.parseBoolean(value);
            case BINARY:
            case STRING:
            default:
                return value;
        }
    }
}
