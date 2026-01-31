package com.nuraly.crawler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlResultDTO {

    @Builder.Default
    private List<CrawledPageDTO> pages = new ArrayList<>();

    @Builder.Default
    private int totalPages = 0;

    @Builder.Default
    private int totalCharacters = 0;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
