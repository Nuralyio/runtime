package com.nuraly.kv.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.kv.dto.*;
import com.nuraly.kv.dto.mapper.KvEntryDTOMapper;
import com.nuraly.kv.dto.mapper.KvEntryVersionDTOMapper;
import com.nuraly.kv.entity.KvEntryEntity;
import com.nuraly.kv.entity.KvEntryVersionEntity;
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

    public List<KvEntryDTO> listEntries(String applicationId, String scope, String scopedResourceId, String prefix) {
        StringBuilder query = new StringBuilder();
        Map<String, Object> params = new HashMap<>();

        query.append("applicationId = :applicationId");
        params.put("applicationId", applicationId);

        if (scope != null && !scope.isEmpty()) {
            query.append(" AND scope = :scope");
            params.put("scope", scope);
        }

        if (scopedResourceId != null && !scopedResourceId.isEmpty()) {
            query.append(" AND scopedResourceId = :scopedResourceId");
            params.put("scopedResourceId", scopedResourceId);
        }

        if (prefix != null && !prefix.isEmpty()) {
            query.append(" AND keyPath LIKE :prefix");
            params.put("prefix", prefix + "%");
        }

        List<KvEntryEntity> entries = KvEntryEntity.list(query.toString(), params);

        List<KvEntryDTO> dtos = new ArrayList<>();
        for (KvEntryEntity entry : entries) {
            KvEntryDTO dto = entryMapper.toDTO(entry);
            dto.setValue(decryptAndParseValue(entry));
            dtos.add(dto);
        }
        return dtos;
    }

    public KvEntryDTO getEntry(String applicationId, String keyPath, String userId) {
        KvEntryEntity entry = findEntry(applicationId, keyPath);

        auditService.logRead(null, entry.id, keyPath, userId, true);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(decryptAndParseValue(entry));
        return dto;
    }

    public KvEntryDTO setEntry(String keyPath, SetKvEntryRequest request, String userId) {
        String applicationId = request.getApplicationId();

        KvEntryEntity entry = KvEntryEntity.find("applicationId = ?1 AND keyPath = ?2",
            applicationId, keyPath).firstResult();

        boolean isNew = entry == null;

        if (isNew) {
            entry = new KvEntryEntity();
            entry.applicationId = applicationId;
            entry.scope = request.getScope();
            entry.scopedResourceId = request.getScopedResourceId();
            entry.keyPath = keyPath;
            entry.createdBy = userId;
            entry.isSecret = Boolean.TRUE.equals(request.getIsSecret());
        } else {
            if (request.getExpectedVersion() != null &&
                !request.getExpectedVersion().equals(entry.version)) {
                throw new KvVersionConflictException(
                    "Version conflict: expected " + request.getExpectedVersion() +
                    " but found " + entry.version);
            }

            if (Boolean.TRUE.equals(entry.isSecret)) {
                saveVersionHistory(entry, userId, "update");
            }
        }

        KvValueType detectedType = detectValueType(request.getValue());
        String valueToStore = serializeValue(request.getValue(), detectedType);

        if (Boolean.TRUE.equals(entry.isSecret)) {
            valueToStore = encryptionService.encrypt(valueToStore);
            entry.isEncrypted = true;
        }

        entry.valueData = valueToStore;
        entry.valueType = detectedType;
        entry.metadata = request.getMetadata();
        entry.updatedBy = userId;

        Long ttl = request.getTtlSeconds();
        if (ttl != null && ttl > 0) {
            entry.expiresAt = Instant.now().plusSeconds(ttl);
        } else {
            entry.expiresAt = null;
        }

        entry.persist();

        auditService.logWrite(null, entry.id, keyPath, userId, true);

        if (isNew) {
            eventService.publishEntryCreated(null, entry.id, keyPath);
        } else {
            eventService.publishEntryUpdated(null, entry.id, keyPath);
        }

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(request.getValue());
        return dto;
    }

    public void deleteEntry(String applicationId, String keyPath, String userId) {
        KvEntryEntity entry = findEntry(applicationId, keyPath);

        UUID entryId = entry.id;
        entry.delete();

        auditService.logDelete(null, entryId, keyPath, userId, true);
        eventService.publishEntryDeleted(null, entryId, keyPath);
    }

    public KvEntryDTO rotateSecret(String applicationId, String keyPath, Object newValue, String userId) {
        KvEntryEntity entry = findEntry(applicationId, keyPath);

        if (!Boolean.TRUE.equals(entry.isSecret)) {
            throw new IllegalStateException("Rotation only supported for secret entries");
        }

        saveVersionHistory(entry, userId, "rotation");

        KvValueType detectedType = detectValueType(newValue);
        String valueToStore = serializeValue(newValue, detectedType);
        valueToStore = encryptionService.encrypt(valueToStore);

        entry.valueData = valueToStore;
        entry.valueType = detectedType;
        entry.updatedBy = userId;
        entry.persist();

        auditService.logRotate(null, entry.id, keyPath, userId, true);
        eventService.publishSecretRotated(null, entry.id, keyPath, entry.version);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(newValue);
        return dto;
    }

    public List<KvEntryVersionDTO> getVersionHistory(String applicationId, String keyPath) {
        KvEntryEntity entry = findEntry(applicationId, keyPath);

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

    public KvEntryDTO rollbackToVersion(String applicationId, String keyPath, Long targetVersion, String userId) {
        KvEntryEntity entry = findEntry(applicationId, keyPath);

        KvEntryVersionEntity versionEntity = KvEntryVersionEntity.find(
            "entry = ?1 and version = ?2", entry, targetVersion).firstResult();

        if (versionEntity == null) {
            throw new KvEntryNotFoundException("Version " + targetVersion + " not found");
        }

        saveVersionHistory(entry, userId, "rollback");

        entry.valueData = versionEntity.valueData;
        entry.updatedBy = userId;
        entry.persist();

        auditService.logRollback(null, entry.id, keyPath, userId, true);

        KvEntryDTO dto = entryMapper.toDTO(entry);
        dto.setValue(decryptAndParseValue(entry));
        return dto;
    }

    public BulkOperationResponse bulkGet(String applicationId, BulkGetRequest request, String userId) {
        BulkOperationResponse response = new BulkOperationResponse();
        response.setResults(new HashMap<>());

        for (String key : request.getKeys()) {
            try {
                KvEntryEntity entry = KvEntryEntity.find("applicationId = ?1 AND keyPath = ?2",
                    applicationId, key).firstResult();

                if (entry != null) {
                    KvEntryDTO dto = entryMapper.toDTO(entry);
                    dto.setValue(decryptAndParseValue(entry));
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

    public BulkOperationResponse bulkSet(String applicationId, String scope, String scopedResourceId,
                                         BulkSetRequest request, String userId) {
        BulkOperationResponse response = new BulkOperationResponse();
        response.setResults(new HashMap<>());

        for (BulkSetRequest.BulkSetEntry bulkEntry : request.getEntries()) {
            try {
                SetKvEntryRequest setRequest = new SetKvEntryRequest();
                setRequest.setApplicationId(applicationId);
                setRequest.setScope(scope);
                setRequest.setScopedResourceId(scopedResourceId);
                setRequest.setValue(bulkEntry.getValue());
                setRequest.setIsSecret(bulkEntry.getIsSecret());
                setRequest.setTtlSeconds(bulkEntry.getTtlSeconds());

                KvEntryDTO dto = setEntry(bulkEntry.getKey(), setRequest, userId);
                response.getResults().put(bulkEntry.getKey(), dto);
                response.setSuccessCount(response.getSuccessCount() + 1);
            } catch (Exception e) {
                response.getFailedKeys().add(bulkEntry.getKey());
                response.setFailureCount(response.getFailureCount() + 1);
            }
        }

        return response;
    }

    public BulkOperationResponse bulkDelete(String applicationId, BulkDeleteRequest request, String userId) {
        BulkOperationResponse response = new BulkOperationResponse();

        for (String key : request.getKeys()) {
            try {
                deleteEntry(applicationId, key, userId);
                response.setSuccessCount(response.getSuccessCount() + 1);
            } catch (Exception e) {
                response.getFailedKeys().add(key);
                response.setFailureCount(response.getFailureCount() + 1);
            }
        }

        return response;
    }

    private KvEntryEntity findEntry(String applicationId, String keyPath) {
        KvEntryEntity entry = KvEntryEntity.find("applicationId = ?1 AND keyPath = ?2",
            applicationId, keyPath).firstResult();

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

    private KvValueType detectValueType(Object value) {
        if (value == null) {
            return KvValueType.STRING;
        }

        if (value instanceof Boolean) {
            return KvValueType.BOOLEAN;
        }

        if (value instanceof Number) {
            return KvValueType.NUMBER;
        }

        if (value instanceof Map || value instanceof List) {
            return KvValueType.JSON;
        }

        if (value instanceof String) {
            String str = (String) value;
            if (str.startsWith("{") || str.startsWith("[")) {
                try {
                    objectMapper.readTree(str);
                    return KvValueType.JSON;
                } catch (Exception ignored) {
                }
            }
        }

        return KvValueType.STRING;
    }

    private String serializeValue(Object value, KvValueType type) {
        if (value == null) {
            return null;
        }

        if (type == KvValueType.JSON) {
            try {
                if (value instanceof String) {
                    return (String) value;
                }
                return objectMapper.writeValueAsString(value);
            } catch (JsonProcessingException e) {
                throw new IllegalArgumentException("Invalid JSON value", e);
            }
        }

        return String.valueOf(value);
    }

    private Object decryptAndParseValue(KvEntryEntity entry) {
        return decryptAndParseValue(entry.valueData, entry.valueType,
            Boolean.TRUE.equals(entry.isSecret) && Boolean.TRUE.equals(entry.isEncrypted));
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
