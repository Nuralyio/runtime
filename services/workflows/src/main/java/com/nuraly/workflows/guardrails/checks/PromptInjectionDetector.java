package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Detects potential prompt injection attacks.
 *
 * Detection patterns include:
 * - System prompt override attempts ("ignore previous instructions")
 * - Role manipulation ("you are now", "act as")
 * - Delimiter injection (```system, [INST], etc.)
 * - Jailbreak attempts
 * - Context manipulation
 *
 * Sensitivity levels:
 * - high: Strictest, may have false positives
 * - medium: Balanced (default)
 * - low: Only obvious attacks
 */
@ApplicationScoped
public class PromptInjectionDetector {

    // High sensitivity patterns (more likely false positives)
    private static final List<Pattern> HIGH_PATTERNS = List.of(
            Pattern.compile("(?i)you\\s+are\\s+now\\s+(?:a|an)?"),
            Pattern.compile("(?i)act\\s+as\\s+(?:if\\s+)?(?:you\\s+(?:are|were))?"),
            Pattern.compile("(?i)pretend\\s+(?:to\\s+be|you\\s+are)"),
            Pattern.compile("(?i)roleplay\\s+as"),
            Pattern.compile("(?i)from\\s+now\\s+on"),
            Pattern.compile("(?i)new\\s+(?:instructions|rules|persona)")
    );

    // Medium sensitivity patterns (balanced)
    private static final List<Pattern> MEDIUM_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+(?:all\\s+)?(?:previous|prior|above)\\s+(?:instructions|prompts|rules|text)"),
            Pattern.compile("(?i)disregard\\s+(?:all\\s+)?(?:previous|prior|above)"),
            Pattern.compile("(?i)forget\\s+(?:everything|all|what)\\s+(?:you|i)"),
            Pattern.compile("(?i)override\\s+(?:your|the)?\\s*(?:system|instructions|rules)"),
            Pattern.compile("(?i)bypass\\s+(?:your|the)?\\s*(?:restrictions|filters|safety)"),
            Pattern.compile("(?i)\\[/?\\s*(?:INST|SYS|SYSTEM)\\s*\\]"),
            Pattern.compile("(?i)```\\s*(?:system|assistant|user)"),
            Pattern.compile("(?i)<\\|?(?:system|im_start|endoftext)\\|?>"),
            Pattern.compile("(?i)\\{\\{\\s*(?:system|assistant)"),
            Pattern.compile("(?i)do\\s+(?:not|anything)\\s+(?:i|the\\s+user)\\s+(?:say|ask|tell)")
    );

    // Low sensitivity patterns (obvious attacks only)
    private static final List<Pattern> LOW_PATTERNS = List.of(
            Pattern.compile("(?i)ignore\\s+all\\s+previous\\s+instructions"),
            Pattern.compile("(?i)you\\s+must\\s+ignore\\s+your\\s+(?:training|rules|instructions)"),
            Pattern.compile("(?i)\\[SYSTEM\\s*OVERRIDE\\]"),
            Pattern.compile("(?i)jailbreak"),
            Pattern.compile("(?i)DAN\\s*(?:mode|prompt)?")
    );

    // Keywords that increase suspicion
    private static final Set<String> SUSPICIOUS_KEYWORDS = Set.of(
            "ignore", "override", "bypass", "jailbreak", "dan mode",
            "system prompt", "previous instructions", "new persona",
            "pretend", "roleplay", "act as", "you are now"
    );

    /**
     * Check content for prompt injection attempts.
     *
     * @param content Content to check
     * @param config Configuration with sensitivity level
     * @return GuardrailResult with detection results
     */
    public GuardrailResult check(String content, JsonNode config) {
        String sensitivity = config.has("sensitivity")
                ? config.get("sensitivity").asText()
                : "medium";

        List<Pattern> patternsToCheck = getPatternsForSensitivity(sensitivity);
        List<String> detectedPatterns = new ArrayList<>();

        String lowerContent = content.toLowerCase();

        // Check patterns
        for (Pattern pattern : patternsToCheck) {
            if (pattern.matcher(content).find()) {
                detectedPatterns.add(pattern.pattern());
            }
        }

        // Calculate suspicion score based on keyword density
        int keywordHits = 0;
        for (String keyword : SUSPICIOUS_KEYWORDS) {
            if (lowerContent.contains(keyword)) {
                keywordHits++;
            }
        }

        // Determine if this is likely an injection attempt
        boolean isInjection = false;
        String reason = null;

        if (!detectedPatterns.isEmpty()) {
            isInjection = true;
            reason = "Detected injection pattern";
        } else if (keywordHits >= 3 && "high".equals(sensitivity)) {
            isInjection = true;
            reason = "High concentration of suspicious keywords";
        }

        if (!isInjection) {
            return GuardrailResult.pass("injection");
        }

        Map<String, Object> details = new HashMap<>();
        details.put("patternsMatched", detectedPatterns.size());
        details.put("keywordHits", keywordHits);
        details.put("sensitivity", sensitivity);

        return GuardrailResult.failWithDetails("injection",
                reason + " (" + detectedPatterns.size() + " patterns, " + keywordHits + " keywords)",
                details);
    }

    private List<Pattern> getPatternsForSensitivity(String sensitivity) {
        List<Pattern> patterns = new ArrayList<>(LOW_PATTERNS);

        if ("medium".equalsIgnoreCase(sensitivity) || "high".equalsIgnoreCase(sensitivity)) {
            patterns.addAll(MEDIUM_PATTERNS);
        }

        if ("high".equalsIgnoreCase(sensitivity)) {
            patterns.addAll(HIGH_PATTERNS);
        }

        return patterns;
    }
}
