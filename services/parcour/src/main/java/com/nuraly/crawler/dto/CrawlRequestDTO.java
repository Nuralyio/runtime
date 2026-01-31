package com.nuraly.crawler.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlRequestDTO {

    private String requestId;

    @NotEmpty(message = "URLs list cannot be empty")
    private List<String> urls;

    @Builder.Default
    private int maxDepth = 1;

    @Builder.Default
    private int maxPages = 10;

    @Builder.Default
    private boolean sameDomainOnly = true;

    @Builder.Default
    private boolean renderJs = false;

    private List<String> includePatterns;

    private List<String> excludePatterns;

    private Map<String, String> extractSelectors;

    private List<String> removeSelectors;

    private String workflowId;

    private String userId;

    private String isolationKey;
}
