package com.nuraly.kv.exception;

public class KvNamespaceNotFoundException extends RuntimeException {

    public KvNamespaceNotFoundException(String message) {
        super(message);
    }

    public KvNamespaceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
