package com.nuraly.functions.exception;

/**
 * Exception thrown when URL import resolution fails.
 *
 * Common causes:
 * - Invalid URL format
 * - Domain not in allowlist
 * - HTTP fetch error (404, timeout, etc.)
 * - Module too large
 * - Blocked package pattern
 */
public class ImportResolutionException extends Exception {

    private final String url;
    private final String suggestion;

    public ImportResolutionException(String message) {
        super(message);
        this.url = null;
        this.suggestion = null;
    }

    public ImportResolutionException(String message, Throwable cause) {
        super(message, cause);
        this.url = null;
        this.suggestion = null;
    }

    public ImportResolutionException(String message, String url) {
        super(message);
        this.url = url;
        this.suggestion = null;
    }

    public ImportResolutionException(String message, String url, String suggestion) {
        super(message);
        this.url = url;
        this.suggestion = suggestion;
    }

    public String getUrl() {
        return url;
    }

    public String getSuggestion() {
        return suggestion;
    }
}
