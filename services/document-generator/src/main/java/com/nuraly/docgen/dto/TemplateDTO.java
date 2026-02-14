package com.nuraly.docgen.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class TemplateDTO {

    private UUID id;
    private String name;
    private String description;
    private String applicationId;
    private Instant createdAt;
}
