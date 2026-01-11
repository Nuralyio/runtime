package com.nuraly.kv.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateKvNamespaceRequest {
    @Size(max = 128, message = "Name must be at most 128 characters")
    private String name;

    private String description;

    private Long defaultTtlSeconds;
}
