package com.nuraly.kv.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class KvNamespaceDTO {
    private UUID id;
    private String name;
    private String description;
    private String applicationId;
    private Boolean isSecretNamespace;
    private Long defaultTtlSeconds;
    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Long entryCount;
}
