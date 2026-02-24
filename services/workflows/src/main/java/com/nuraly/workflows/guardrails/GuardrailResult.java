package com.nuraly.workflows.guardrails;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Result of a guardrail check.
 */
@Data
@Builder
public class GuardrailResult {
    private String type;
    private boolean passed;
    private String message;
    private String redactedContent;
    private Map<String, Object> details;

    public static GuardrailResult pass(String type) {
        return GuardrailResult.builder()
                .type(type)
                .passed(true)
                .build();
    }

    public static GuardrailResult fail(String type, String message) {
        return GuardrailResult.builder()
                .type(type)
                .passed(false)
                .message(message)
                .build();
    }

    public static GuardrailResult failWithDetails(String type, String message, Map<String, Object> details) {
        return GuardrailResult.builder()
                .type(type)
                .passed(false)
                .message(message)
                .details(details)
                .build();
    }

    public static GuardrailResult redact(String type, String message, String redactedContent) {
        return GuardrailResult.builder()
                .type(type)
                .passed(false)
                .message(message)
                .redactedContent(redactedContent)
                .build();
    }
}
