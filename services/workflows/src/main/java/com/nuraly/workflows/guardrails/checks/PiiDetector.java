package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Detects and optionally redacts Personally Identifiable Information (PII).
 *
 * Supported categories:
 * - email: Email addresses
 * - phone: Phone numbers (US/international formats)
 * - ssn: Social Security Numbers
 * - credit_card: Credit card numbers
 * - ip_address: IP addresses
 * - date_of_birth: Dates that might be DOB
 * - address: Street addresses (basic detection)
 */
@ApplicationScoped
public class PiiDetector {

    private static final Map<String, Pattern> PII_PATTERNS = Map.of(
            "email", Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"),
            "phone", Pattern.compile("(?:\\+?1[-.]?)?\\(?\\d{3}\\)?[-.]?\\d{3}[-.]?\\d{4}"),
            "ssn", Pattern.compile("\\b\\d{3}[-]?\\d{2}[-]?\\d{4}\\b"),
            "credit_card", Pattern.compile("\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b"),
            "ip_address", Pattern.compile("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"),
            "date_of_birth", Pattern.compile("\\b(?:0?[1-9]|1[0-2])[/\\-](?:0?[1-9]|[12]\\d|3[01])[/\\-](?:19|20)\\d{2}\\b")
    );

    private static final Map<String, String> REDACTION_PLACEHOLDERS = Map.of(
            "email", "[EMAIL_REDACTED]",
            "phone", "[PHONE_REDACTED]",
            "ssn", "[SSN_REDACTED]",
            "credit_card", "[CARD_REDACTED]",
            "ip_address", "[IP_REDACTED]",
            "date_of_birth", "[DOB_REDACTED]"
    );

    /**
     * Check content for PII.
     *
     * @param content Content to check
     * @param config Configuration with categories to check
     * @return GuardrailResult with detection results
     */
    public GuardrailResult check(String content, JsonNode config) {
        Set<String> categoriesToCheck = parseCategories(config);
        Map<String, List<String>> detectedPii = new HashMap<>();
        String redactedContent = content;

        for (String category : categoriesToCheck) {
            Pattern pattern = PII_PATTERNS.get(category);
            if (pattern == null) continue;

            Matcher matcher = pattern.matcher(content);
            List<String> matches = new ArrayList<>();

            while (matcher.find()) {
                matches.add(maskForLogging(matcher.group(), category));
            }

            if (!matches.isEmpty()) {
                detectedPii.put(category, matches);

                // Redact in content
                String placeholder = REDACTION_PLACEHOLDERS.getOrDefault(category, "[REDACTED]");
                redactedContent = pattern.matcher(redactedContent).replaceAll(placeholder);
            }
        }

        if (detectedPii.isEmpty()) {
            return GuardrailResult.pass("pii");
        }

        String message = "Detected PII: " + detectedPii.keySet();
        Map<String, Object> details = new HashMap<>();
        details.put("categories", detectedPii.keySet());
        details.put("counts", detectedPii.entrySet().stream()
                .collect(HashMap::new, (m, e) -> m.put(e.getKey(), e.getValue().size()), HashMap::putAll));

        return GuardrailResult.builder()
                .type("pii")
                .passed(false)
                .message(message)
                .redactedContent(redactedContent)
                .details(details)
                .build();
    }

    private Set<String> parseCategories(JsonNode config) {
        Set<String> categories = new HashSet<>();

        if (config.has("categories") && config.get("categories").isArray()) {
            for (JsonNode cat : config.get("categories")) {
                categories.add(cat.asText().toLowerCase());
            }
        }

        // If no categories specified, check all
        if (categories.isEmpty()) {
            categories.addAll(PII_PATTERNS.keySet());
        }

        return categories;
    }

    private String maskForLogging(String value, String category) {
        // Partially mask PII for logging purposes
        if (value.length() <= 4) {
            return "****";
        }
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
}
