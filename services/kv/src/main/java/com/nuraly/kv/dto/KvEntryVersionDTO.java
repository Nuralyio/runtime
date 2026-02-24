package com.nuraly.kv.dto;

import lombok.Data;
import lombok.ToString;

import java.time.Instant;
import java.util.UUID;

@Data
@ToString(exclude = {"value"})
public class KvEntryVersionDTO {
    private UUID id;
    private UUID entryId;
    private Long version;
    private Object value;
    private String changedBy;
    private String changeReason;
    private Instant createdAt;
}
