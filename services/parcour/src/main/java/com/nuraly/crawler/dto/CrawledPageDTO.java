package com.nuraly.crawler.dto;

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
public class CrawledPageDTO {

    private String url;

    private String title;

    @Builder.Default
    private String content = "";

    private String description;

    @Builder.Default
    private int characterCount = 0;

    private String crawledAt;

    @Builder.Default
    private List<String> links = List.of();

    private Map<String, String> extracted;
}
