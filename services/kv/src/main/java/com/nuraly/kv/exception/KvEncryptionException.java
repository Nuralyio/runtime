package com.nuraly.kv.exception;

public class KvEncryptionException extends RuntimeException {

    public KvEncryptionException(String message) {
        super(message);
    }

    public KvEncryptionException(String message, Throwable cause) {
        super(message, cause);
    }
}
