package com.nuraly.crawler.exception;

public class UrlValidationException extends CrawlException {

    private final String url;

    public UrlValidationException(String url, String message) {
        super(message);
        this.url = url;
    }

    public String getUrl() {
        return url;
    }
}
