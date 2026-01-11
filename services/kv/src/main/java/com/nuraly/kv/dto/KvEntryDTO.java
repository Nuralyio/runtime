package com.nuraly.kv.dto;

import com.nuraly.kv.entity.enums.KvValueType;
import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.util.UUID;

@Data
@ToString(exclude = {"value"})
public class KvEntryDTO {
    private UUID id;
    private UUID namespaceId;
    private String keyPath;
    private Object value;
    private KvValueType valueType;
    private Boolean isEncrypted;
    private Long version;
    private Instant expiresAt;
    private String metadata;
    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
