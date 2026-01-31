package com.nuraly.workflows.messaging;

import java.util.List;
import java.util.Map;

/**
 * Message sent to crawl service via RabbitMQ.
 */
public class CrawlRequestMessage {

    private String requestId;
    private List<String> urls;
    private int maxDepth;
    private int maxPages;
    private boolean sameDomainOnly;
    private boolean renderJs;

    // Optional patterns
    private List<String> includePatterns;
    private List<String> excludePatterns;

    // Optional selectors
    private Map<String, String> extractSelectors;
    private List<String> removeSelectors;

    // Tenant/isolation info
    private String isolationKey;
    private String workflowId;
    private String userId;

    // Reply queue info (set by producer)
    private String replyTo;
    private String correlationId;

    public CrawlRequestMessage() {}

    // Getters and setters
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public List<String> getUrls() {
        return urls;
    }

    public void setUrls(List<String> urls) {
        this.urls = urls;
    }

    public int getMaxDepth() {
        return maxDepth;
    }

    public void setMaxDepth(int maxDepth) {
        this.maxDepth = maxDepth;
    }

    public int getMaxPages() {
        return maxPages;
    }

    public void setMaxPages(int maxPages) {
        this.maxPages = maxPages;
    }

    public boolean isSameDomainOnly() {
        return sameDomainOnly;
    }

    public void setSameDomainOnly(boolean sameDomainOnly) {
        this.sameDomainOnly = sameDomainOnly;
    }

    public boolean isRenderJs() {
        return renderJs;
    }

    public void setRenderJs(boolean renderJs) {
        this.renderJs = renderJs;
    }

    public List<String> getIncludePatterns() {
        return includePatterns;
    }

    public void setIncludePatterns(List<String> includePatterns) {
        this.includePatterns = includePatterns;
    }

    public List<String> getExcludePatterns() {
        return excludePatterns;
    }

    public void setExcludePatterns(List<String> excludePatterns) {
        this.excludePatterns = excludePatterns;
    }

    public Map<String, String> getExtractSelectors() {
        return extractSelectors;
    }

    public void setExtractSelectors(Map<String, String> extractSelectors) {
        this.extractSelectors = extractSelectors;
    }

    public List<String> getRemoveSelectors() {
        return removeSelectors;
    }

    public void setRemoveSelectors(List<String> removeSelectors) {
        this.removeSelectors = removeSelectors;
    }

    public String getIsolationKey() {
        return isolationKey;
    }

    public void setIsolationKey(String isolationKey) {
        this.isolationKey = isolationKey;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    @Override
    public String toString() {
        return "CrawlRequestMessage{" +
                "requestId='" + requestId + '\'' +
                ", urls=" + urls +
                ", maxDepth=" + maxDepth +
                ", maxPages=" + maxPages +
                ", renderJs=" + renderJs +
                ", workflowId='" + workflowId + '\'' +
                '}';
    }
}
