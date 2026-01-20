package com.nuraly.kv.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.ToString;

@Data
@ToString(exclude = {"value"})
public class SetKvEntryRequest {
    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @Size(max = 64, message = "Scope must be at most 64 characters")
    private String scope;

    private String scopedResourceId;

    @NotNull(message = "Value is required")
    private Object value;

    private Boolean isSecret = false;

    private Long ttlSeconds;

    private String metadata;

    private Long expectedVersion;
}
