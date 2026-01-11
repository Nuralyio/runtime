package com.nuraly.kv.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkDeleteRequest {
    @NotEmpty(message = "Keys list cannot be empty")
    private List<String> keys;
}
