package com.nuraly.functions.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FunctionDTO {
    private Long id;
    private String label;
    private String description;
    private String template;
    private String runtime;
    private String handler;
    private String applicationId;
    private String createdBy;
}
