package com.nuraly.kv.exception;

public class KvVersionConflictException extends RuntimeException {

    public KvVersionConflictException(String message) {
        super(message);
    }

    public KvVersionConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
