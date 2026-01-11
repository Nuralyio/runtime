package com.nuraly.kv.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkGetRequest {
    @NotEmpty(message = "Keys list cannot be empty")
    private List<String> keys;
}
