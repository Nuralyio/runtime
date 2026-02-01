package com.nuraly.workflows.guardrails;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;

/**
 * Represents a guardrail check configuration.
 */
@Data
public class GuardrailCheck {
    private String type;
    private String action;
    private JsonNode config;
}
