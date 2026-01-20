package com.nuraly.kv.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.ToString;

import java.util.List;

@Data
public class BulkSetRequest {
    @NotEmpty(message = "Entries list cannot be empty")
    private List<BulkSetEntry> entries;

    @Data
    @ToString(exclude = {"value"})
    public static class BulkSetEntry {
        private String key;
        private Object value;
        private Boolean isSecret;
        private Long ttlSeconds;
    }
}
