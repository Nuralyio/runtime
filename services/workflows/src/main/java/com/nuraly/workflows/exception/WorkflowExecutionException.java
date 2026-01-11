package com.nuraly.workflows.exception;

public class WorkflowExecutionException extends Exception {
    public WorkflowExecutionException(String message) {
        super(message);
    }

    public WorkflowExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
