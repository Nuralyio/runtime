package com.nuraly.docgen.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public class GenerateRequest {

    @NotNull
    public UUID templateId;

    @NotNull
    public Map<String, Object> data;

    public String applicationId;
}
