package com.nuraly.docgen.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class GenerateRequest {

    @NotNull
    private UUID templateId;

    @NotNull
    private Map<String, Object> data;

    private String applicationId;
}
