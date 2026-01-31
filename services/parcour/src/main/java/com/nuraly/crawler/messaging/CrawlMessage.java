package com.nuraly.crawler.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrawlMessage {

    private String requestId;
    private String payload;
    private String workflowId;
    private String userId;
    private String isolationKey;
}
