package com.nuraly.kv.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
public class BulkOperationResponse {
    private int successCount;
    private int failureCount;
    private List<String> failedKeys = new ArrayList<>();
    private Map<String, KvEntryDTO> results;
}
