package com.nuraly.workflows.messaging;

import java.util.List;
import java.util.Map;

/**
 * Response message from crawl service via RabbitMQ.
 */
public class CrawlResponseMessage {

    private String requestId;
    private boolean success;
    private String errorMessage;
    private List<CrawledPage> pages;
    private int totalPages;
    private int totalCharacters;
    private List<String> errors;

    public CrawlResponseMessage() {}

    // Getters and setters
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public List<CrawledPage> getPages() {
        return pages;
    }

    public void setPages(List<CrawledPage> pages) {
        this.pages = pages;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getTotalCharacters() {
        return totalCharacters;
    }

    public void setTotalCharacters(int totalCharacters) {
        this.totalCharacters = totalCharacters;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    /**
     * Represents a single crawled page.
     */
    public static class CrawledPage {
        private String url;
        private String title;
        private String content;
        private String description;
        private int characterCount;
        private String crawledAt;
        private List<String> links;
        private Map<String, String> extracted;

        public CrawledPage() {}

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public int getCharacterCount() {
            return characterCount;
        }

        public void setCharacterCount(int characterCount) {
            this.characterCount = characterCount;
        }

        public String getCrawledAt() {
            return crawledAt;
        }

        public void setCrawledAt(String crawledAt) {
            this.crawledAt = crawledAt;
        }

        public List<String> getLinks() {
            return links;
        }

        public void setLinks(List<String> links) {
            this.links = links;
        }

        public Map<String, String> getExtracted() {
            return extracted;
        }

        public void setExtracted(Map<String, String> extracted) {
            this.extracted = extracted;
        }
    }

    @Override
    public String toString() {
        return "CrawlResponseMessage{" +
                "requestId='" + requestId + '\'' +
                ", success=" + success +
                ", totalPages=" + totalPages +
                ", totalCharacters=" + totalCharacters +
                ", errors=" + (errors != null ? errors.size() : 0) +
                '}';
    }
}
