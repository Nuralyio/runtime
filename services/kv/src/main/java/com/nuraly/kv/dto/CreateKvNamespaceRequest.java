package com.nuraly.kv.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateKvNamespaceRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 128, message = "Name must be at most 128 characters")
    private String name;

    private String description;

    private String applicationId;

    @Size(max = 64, message = "Scope must be at most 64 characters")
    private String scope;

    private String scopedResourceId;

    private Boolean isSecretNamespace = false;

    private Long defaultTtlSeconds;
}
