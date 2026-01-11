package com.nuraly.workflows.exception;

import java.util.List;

public class InvalidWorkflowException extends Exception {
    private final List<String> validationErrors;

    public InvalidWorkflowException(String message) {
        super(message);
        this.validationErrors = List.of(message);
    }

    public InvalidWorkflowException(List<String> validationErrors) {
        super("Workflow validation failed: " + String.join(", ", validationErrors));
        this.validationErrors = validationErrors;
    }

    public List<String> getValidationErrors() {
        return validationErrors;
    }
}
