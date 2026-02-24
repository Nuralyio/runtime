package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.guardrails.GuardrailCheck;
import com.nuraly.workflows.guardrails.GuardrailResult;
import com.nuraly.workflows.guardrails.checks.*;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * Guardrail Node Executor - Validates and filters LLM inputs/outputs for safety.
 *
 * Provides multiple check types:
 *
 * KEYWORD-BASED (fast, no API cost):
 * - pii: Detect and optionally redact personally identifiable information
 * - injection: Detect potential prompt injection attacks
 * - moderation: Filter harmful, toxic, or inappropriate content (keyword-based)
 * - topics: Block specific topics by keyword matching
 * - length: Ensure text length is within bounds
 * - regex: Match/block based on regex patterns
 *
 * LLM-ENHANCED (ML-powered, requires API key):
 * - openai_moderation: OpenAI Moderation API for ML-based content moderation
 * - llm_policy: LLM-based validation against custom natural language policies
 * - semantic_topic: Embedding-based off-topic detection using semantic similarity
 *
 * Node Configuration:
 * {
 *   "mode": "input" | "output",          // When to apply guardrails
 *   "checks": [
 *     {
 *       "type": "pii",
 *       "action": "redact" | "block" | "warn",
 *       "categories": ["email", "phone", "ssn", "credit_card"]
 *     },
 *     {
 *       "type": "injection",
 *       "action": "block",
 *       "sensitivity": "high" | "medium" | "low"
 *     },
 *     {
 *       "type": "moderation",
 *       "action": "block",
 *       "categories": ["hate", "violence", "sexual", "self_harm"]
 *     },
 *     {
 *       "type": "topics",
 *       "action": "block",
 *       "blocked": ["competitor_names", "internal_secrets"]
 *     },
 *     {
 *       "type": "length",
 *       "action": "block",
 *       "minLength": 1,
 *       "maxLength": 10000
 *     },
 *     {
 *       "type": "regex",
 *       "action": "block",
 *       "patterns": ["password\\s*[:=]\\s*\\S+"],
 *       "mode": "block_match"  // or "require_match"
 *     }
 *   ],
 *   "onFail": "block" | "warn" | "passthrough",  // Default action on check failure
 *   "contentField": "content"                     // Field to check in input
 * }
 *
 * Input:
 *   { "content": "User message or LLM response to validate" }
 *
 * Output (on pass):
 *   {
 *     "content": "...",          // Original or redacted content
 *     "passed": true,
 *     "checks": [...]            // Details of each check
 *   }
 *
 * Output (on fail with block):
 *   Returns NodeExecutionResult.failure() to stop workflow
 */
@ApplicationScoped
public class GuardrailNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(GuardrailNodeExecutor.class);

    @Inject
    MeterRegistry meterRegistry;

    // Keyword-based checks (fast, no API cost)
    @Inject
    PiiDetector piiDetector;

    @Inject
    PromptInjectionDetector injectionDetector;

    @Inject
    ContentModerator contentModerator;

    @Inject
    TopicRestrictor topicRestrictor;

    // LLM-enhanced checks (ML-powered, requires API key)
    @Inject
    OpenAiModerationCheck openAiModerationCheck;

    @Inject
    LlmPolicyCheck llmPolicyCheck;

    @Inject
    SemanticTopicCheck semanticTopicCheck;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.GUARDRAIL;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.debugf("Guardrail node executed: %s", node.name);

        JsonNode config = node.configuration != null
                ? objectMapper.readTree(node.configuration)
                : objectMapper.createObjectNode();
        JsonNode input = context.getInput();

        // Get mode (input/output)
        String mode = config.has("mode") ? config.get("mode").asText() : "input";

        // Get content to validate
        String contentField = config.has("contentField") ? config.get("contentField").asText() : "content";
        String content = extractContent(input, contentField);

        if (content == null || content.isEmpty()) {
            // Pass through if no content to validate
            ObjectNode output = objectMapper.createObjectNode();
            output.put("passed", true);
            output.put("skipped", true);
            output.put("reason", "No content to validate");
            return NodeExecutionResult.success(output);
        }

        // Get default action on failure
        String defaultOnFail = config.has("onFail") ? config.get("onFail").asText() : "block";

        // Get checks to perform
        List<GuardrailCheck> checks = parseChecks(config);
        if (checks.isEmpty()) {
            // No checks configured, pass through
            ObjectNode output = objectMapper.createObjectNode();
            output.put("passed", true);
            output.put("content", content);
            output.put("skipped", true);
            output.put("reason", "No checks configured");
            return NodeExecutionResult.success(output);
        }

        // Execute all checks
        List<GuardrailResult> results = new ArrayList<>();
        String processedContent = content;
        boolean allPassed = true;
        boolean shouldBlock = false;
        List<String> warnings = new ArrayList<>();
        List<String> blockReasons = new ArrayList<>();

        for (GuardrailCheck check : checks) {
            long startTime = System.currentTimeMillis();
            GuardrailResult result = executeCheck(check, processedContent);
            long duration = System.currentTimeMillis() - startTime;

            // Record metrics
            meterRegistry.counter("guardrail.checks",
                    "type", check.getType(),
                    "passed", String.valueOf(result.isPassed()))
                    .increment();

            results.add(result);

            if (!result.isPassed()) {
                allPassed = false;

                String action = check.getAction() != null ? check.getAction() : defaultOnFail;

                switch (action.toLowerCase()) {
                    case "block" -> {
                        shouldBlock = true;
                        blockReasons.add(check.getType() + ": " + result.getMessage());
                    }
                    case "warn" -> {
                        warnings.add(check.getType() + ": " + result.getMessage());
                    }
                    case "redact" -> {
                        if (result.getRedactedContent() != null) {
                            processedContent = result.getRedactedContent();
                        }
                    }
                    // passthrough: do nothing
                }
            }

            LOG.debugf("Guardrail check %s: passed=%s, duration=%dms",
                    check.getType(), result.isPassed(), duration);
        }

        // Handle blocking
        if (shouldBlock) {
            String message = "Content blocked by guardrails: " + String.join("; ", blockReasons);
            LOG.warnf("Guardrail blocked content in node %s: %s", node.name, message);

            meterRegistry.counter("guardrail.blocked", "mode", mode).increment();

            return NodeExecutionResult.failure(message);
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("passed", allPassed);
        output.put("content", processedContent);
        output.put("mode", mode);

        // Add warnings if any
        if (!warnings.isEmpty()) {
            ArrayNode warningsArray = objectMapper.createArrayNode();
            warnings.forEach(warningsArray::add);
            output.set("warnings", warningsArray);
        }

        // Add check details
        ArrayNode checksArray = objectMapper.createArrayNode();
        for (GuardrailResult result : results) {
            ObjectNode checkResult = objectMapper.createObjectNode();
            checkResult.put("type", result.getType());
            checkResult.put("passed", result.isPassed());
            if (result.getMessage() != null) {
                checkResult.put("message", result.getMessage());
            }
            if (result.getDetails() != null) {
                checkResult.set("details", objectMapper.valueToTree(result.getDetails()));
            }
            checksArray.add(checkResult);
        }
        output.set("checks", checksArray);

        // Pass through original input fields
        passThrough(input, output, contentField);

        LOG.debugf("Guardrail completed: passed=%s, warnings=%d, checks=%d",
                allPassed, warnings.size(), results.size());

        return NodeExecutionResult.success(output);
    }

    private String extractContent(JsonNode input, String contentField) {
        // Try specified field
        if (input.has(contentField)) {
            return input.get(contentField).asText();
        }

        // Try common field names
        String[] commonFields = {"content", "text", "message", "prompt", "response", "output"};
        for (String field : commonFields) {
            if (input.has(field) && input.get(field).isTextual()) {
                return input.get(field).asText();
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            return extractContent(input.get("body"), contentField);
        }

        return null;
    }

    private List<GuardrailCheck> parseChecks(JsonNode config) {
        List<GuardrailCheck> checks = new ArrayList<>();

        if (!config.has("checks") || !config.get("checks").isArray()) {
            return checks;
        }

        for (JsonNode checkConfig : config.get("checks")) {
            String type = checkConfig.has("type") ? checkConfig.get("type").asText() : null;
            if (type == null) continue;

            GuardrailCheck check = new GuardrailCheck();
            check.setType(type);
            check.setAction(checkConfig.has("action") ? checkConfig.get("action").asText() : "block");
            check.setConfig(checkConfig);

            checks.add(check);
        }

        return checks;
    }

    private GuardrailResult executeCheck(GuardrailCheck check, String content) {
        return switch (check.getType().toLowerCase()) {
            // Keyword-based checks (fast, no API cost)
            case "pii" -> piiDetector.check(content, check.getConfig());
            case "injection", "prompt_injection" -> injectionDetector.check(content, check.getConfig());
            case "moderation", "content_moderation" -> contentModerator.check(content, check.getConfig());
            case "topics", "topic_restriction" -> topicRestrictor.check(content, check.getConfig());
            case "length" -> checkLength(content, check.getConfig());
            case "regex", "pattern" -> checkRegex(content, check.getConfig());

            // LLM-enhanced checks (ML-powered, requires API key)
            case "openai_moderation" -> openAiModerationCheck.check(content, check.getConfig());
            case "llm_policy" -> llmPolicyCheck.check(content, check.getConfig());
            case "semantic_topic" -> semanticTopicCheck.check(content, check.getConfig());

            default -> {
                LOG.warnf("Unknown guardrail check type: %s", check.getType());
                yield GuardrailResult.pass(check.getType());
            }
        };
    }

    private GuardrailResult checkLength(String content, JsonNode config) {
        int minLength = config.has("minLength") ? config.get("minLength").asInt() : 0;
        int maxLength = config.has("maxLength") ? config.get("maxLength").asInt() : Integer.MAX_VALUE;

        int length = content.length();

        if (length < minLength) {
            return GuardrailResult.fail("length",
                    "Content too short: " + length + " chars (min: " + minLength + ")");
        }

        if (length > maxLength) {
            return GuardrailResult.fail("length",
                    "Content too long: " + length + " chars (max: " + maxLength + ")");
        }

        return GuardrailResult.pass("length");
    }

    private GuardrailResult checkRegex(String content, JsonNode config) {
        if (!config.has("patterns") || !config.get("patterns").isArray()) {
            return GuardrailResult.pass("regex");
        }

        String mode = config.has("mode") ? config.get("mode").asText() : "block_match";

        for (JsonNode patternNode : config.get("patterns")) {
            String pattern = patternNode.asText();
            try {
                java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern,
                        java.util.regex.Pattern.CASE_INSENSITIVE);
                java.util.regex.Matcher matcher = regex.matcher(content);

                if ("block_match".equals(mode) && matcher.find()) {
                    return GuardrailResult.fail("regex",
                            "Content matches blocked pattern: " + pattern);
                }

                if ("require_match".equals(mode) && !matcher.find()) {
                    return GuardrailResult.fail("regex",
                            "Content does not match required pattern: " + pattern);
                }
            } catch (Exception e) {
                LOG.warnf("Invalid regex pattern: %s - %s", pattern, e.getMessage());
            }
        }

        return GuardrailResult.pass("regex");
    }

    private void passThrough(JsonNode input, ObjectNode output, String contentField) {
        // Pass through other fields from input
        input.fieldNames().forEachRemaining(field -> {
            if (!field.equals(contentField) && !output.has(field)) {
                output.set(field, input.get(field).deepCopy());
            }
        });
    }
}
