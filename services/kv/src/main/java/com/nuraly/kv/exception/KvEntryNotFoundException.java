package com.nuraly.kv.exception;

public class KvEntryNotFoundException extends RuntimeException {

    public KvEntryNotFoundException(String message) {
        super(message);
    }

    public KvEntryNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
