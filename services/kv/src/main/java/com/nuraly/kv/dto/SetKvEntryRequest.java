package com.nuraly.kv.dto;

import com.nuraly.kv.entity.enums.KvValueType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = {"value"})
public class SetKvEntryRequest {
    @NotNull(message = "Value is required")
    private Object value;

    private KvValueType valueType = KvValueType.STRING;

    private Long ttlSeconds;

    private String metadata;

    private Long expectedVersion;
}
