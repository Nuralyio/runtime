package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import com.nuraly.workflows.llm.LlmProvider;
import com.nuraly.workflows.llm.LlmProviderFactory;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * LLM-based policy validation check.
 *
 * Uses an LLM to validate content against custom policies defined in natural language.
 * This allows for nuanced, context-aware validation that keyword matching cannot achieve.
 *
 * Configuration:
 * {
 *   "type": "llm_policy",
 *   "provider": "openai",           // LLM provider to use
 *   "model": "gpt-4o-mini",          // Model (use smaller models for cost efficiency)
 *   "apiKey": "${OPENAI_API_KEY}",
 *   "policies": [
 *     {
 *       "name": "no_competitor_discussion",
 *       "description": "Do not discuss or compare with competitor products",
 *       "examples": ["What is better, us or CompetitorX?", "How does CompetitorY compare?"]
 *     },
 *     {
 *       "name": "professional_tone",
 *       "description": "Maintain professional, respectful tone",
 *       "examples": ["This is stupid", "You're an idiot"]
 *     },
 *     {
 *       "name": "no_financial_advice",
 *       "description": "Do not provide specific investment or financial advice",
 *       "examples": ["Should I buy Bitcoin?", "What stocks should I invest in?"]
 *     }
 *   ],
 *   "customPrompt": null,  // Optional: override the system prompt
 *   "temperature": 0.0,    // Use 0 for deterministic results
 *   "maxTokens": 500
 * }
 *
 * The LLM returns a JSON response with:
 * {
 *   "compliant": true/false,
 *   "violations": [
 *     {"policy": "policy_name", "reason": "explanation", "severity": "high/medium/low"}
 *   ],
 *   "suggestion": "Optional suggested rewrite"
 * }
 */
@ApplicationScoped
public class LlmPolicyCheck {

    private static final Logger LOG = Logger.getLogger(LlmPolicyCheck.class);

    @Inject
    LlmProviderFactory llmProviderFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DEFAULT_SYSTEM_PROMPT = """
        You are a content policy validator. Analyze the given content against the specified policies.

        Respond ONLY with valid JSON in this exact format:
        {
          "compliant": true or false,
          "violations": [
            {
              "policy": "policy_name",
              "reason": "brief explanation of why this violates the policy",
              "severity": "high", "medium", or "low"
            }
          ],
          "suggestion": "optional suggestion for how to make content compliant, or null if compliant"
        }

        Be strict but fair. Only flag clear violations, not edge cases.
        If content is compliant with all policies, return {"compliant": true, "violations": [], "suggestion": null}
        """;

    /**
     * Check content against custom policies using an LLM.
     *
     * @param content Content to check
     * @param config Configuration with policies and LLM settings
     * @return GuardrailResult with policy check results
     */
    public GuardrailResult check(String content, JsonNode config) {
        // Get LLM provider
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        String apiKey = config.has("apiKey") ? config.get("apiKey").asText() : null;

        if (apiKey == null || apiKey.isEmpty()) {
            return GuardrailResult.fail("llm_policy", "API key not configured for LLM policy check");
        }

        LlmProvider provider = llmProviderFactory.getProvider(providerName);
        if (provider == null) {
            return GuardrailResult.fail("llm_policy", "Unknown LLM provider: " + providerName);
        }

        // Parse policies
        List<PolicyDefinition> policies = parsePolicies(config);
        if (policies.isEmpty()) {
            return GuardrailResult.pass("llm_policy");  // No policies defined
        }

        try {
            // Build the prompt
            String systemPrompt = config.has("customPrompt")
                    ? config.get("customPrompt").asText()
                    : DEFAULT_SYSTEM_PROMPT;

            String userPrompt = buildUserPrompt(content, policies);

            // Build LLM request
            LlmRequest.LlmRequestBuilder requestBuilder = LlmRequest.builder()
                    .messages(List.of(
                            LlmMessage.system(systemPrompt),
                            LlmMessage.user(userPrompt)
                    ));

            if (config.has("model")) {
                requestBuilder.model(config.get("model").asText());
            } else {
                requestBuilder.model("gpt-4o-mini");  // Default to smaller, faster model
            }

            if (config.has("temperature")) {
                requestBuilder.temperature(config.get("temperature").floatValue());
            } else {
                requestBuilder.temperature(0.0f);  // Deterministic
            }

            if (config.has("maxTokens")) {
                requestBuilder.maxTokens(config.get("maxTokens").asInt());
            } else {
                requestBuilder.maxTokens(500);
            }

            LlmRequest request = requestBuilder.build();

            // Call LLM
            LlmResponse response = provider.chat(request, apiKey);

            if (response.isError()) {
                return GuardrailResult.fail("llm_policy",
                        "LLM policy check failed: " + response.getError());
            }

            // Parse LLM response
            return parseResponse(response.getContent(), policies);

        } catch (Exception e) {
            LOG.errorf(e, "LLM policy check failed");
            return GuardrailResult.fail("llm_policy",
                    "LLM policy check error: " + e.getMessage());
        }
    }

    private String buildUserPrompt(String content, List<PolicyDefinition> policies) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("## Policies to Check:\n\n");

        for (int i = 0; i < policies.size(); i++) {
            PolicyDefinition policy = policies.get(i);
            prompt.append(i + 1).append(". **").append(policy.name).append("**: ");
            prompt.append(policy.description).append("\n");

            if (policy.examples != null && !policy.examples.isEmpty()) {
                prompt.append("   Examples of violations: ");
                prompt.append(String.join(", ", policy.examples.stream()
                        .map(e -> "\"" + e + "\"").toList()));
                prompt.append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("## Content to Analyze:\n\n");
        prompt.append("```\n").append(content).append("\n```\n\n");
        prompt.append("Analyze this content against ALL policies listed above and respond with JSON.");

        return prompt.toString();
    }

    private GuardrailResult parseResponse(String llmResponse, List<PolicyDefinition> policies) {
        try {
            // Extract JSON from response (handle markdown code blocks)
            String jsonStr = llmResponse.trim();
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.substring(7);
            } else if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
            }
            jsonStr = jsonStr.trim();

            JsonNode result = objectMapper.readTree(jsonStr);

            boolean compliant = result.has("compliant") && result.get("compliant").asBoolean();

            if (compliant) {
                return GuardrailResult.pass("llm_policy");
            }

            // Parse violations
            List<Map<String, String>> violations = new ArrayList<>();
            if (result.has("violations") && result.get("violations").isArray()) {
                for (JsonNode violation : result.get("violations")) {
                    Map<String, String> v = new LinkedHashMap<>();
                    v.put("policy", violation.has("policy") ? violation.get("policy").asText() : "unknown");
                    v.put("reason", violation.has("reason") ? violation.get("reason").asText() : "");
                    v.put("severity", violation.has("severity") ? violation.get("severity").asText() : "medium");
                    violations.add(v);
                }
            }

            String suggestion = result.has("suggestion") && !result.get("suggestion").isNull()
                    ? result.get("suggestion").asText()
                    : null;

            // Build result
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("violations", violations);
            if (suggestion != null) {
                details.put("suggestion", suggestion);
            }
            details.put("policiesChecked", policies.stream().map(p -> p.name).toList());

            String message = "Content violates policies: " +
                    violations.stream().map(v -> v.get("policy")).distinct().toList();

            return GuardrailResult.failWithDetails("llm_policy", message, details);

        } catch (Exception e) {
            LOG.warnf("Failed to parse LLM policy response: %s", e.getMessage());
            // If we can't parse, assume non-compliant to be safe
            return GuardrailResult.fail("llm_policy",
                    "Failed to parse policy check response: " + e.getMessage());
        }
    }

    private List<PolicyDefinition> parsePolicies(JsonNode config) {
        List<PolicyDefinition> policies = new ArrayList<>();

        if (!config.has("policies") || !config.get("policies").isArray()) {
            return policies;
        }

        for (JsonNode policyNode : config.get("policies")) {
            PolicyDefinition policy = new PolicyDefinition();
            policy.name = policyNode.has("name") ? policyNode.get("name").asText() : "unnamed";
            policy.description = policyNode.has("description") ? policyNode.get("description").asText() : "";

            if (policyNode.has("examples") && policyNode.get("examples").isArray()) {
                policy.examples = new ArrayList<>();
                for (JsonNode example : policyNode.get("examples")) {
                    policy.examples.add(example.asText());
                }
            }

            policies.add(policy);
        }

        return policies;
    }

    private static class PolicyDefinition {
        String name;
        String description;
        List<String> examples;
    }
}
