package com.nuraly.parcour.exception;

public class BrowserException extends CrawlException {

    public BrowserException(String message) {
        super(message);
    }

    public BrowserException(String message, Throwable cause) {
        super(message, cause);
    }
}
