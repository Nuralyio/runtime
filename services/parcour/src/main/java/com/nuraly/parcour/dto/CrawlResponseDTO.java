package com.nuraly.parcour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlResponseDTO {

    private String requestId;

    @Builder.Default
    private String serviceType = "crawl";

    @Builder.Default
    private boolean success = true;

    private String payload;

    private String errorMessage;

    private String processedAt;
}
