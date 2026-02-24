package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Content moderation for harmful, toxic, or inappropriate content.
 *
 * Categories:
 * - hate: Hate speech, discrimination
 * - violence: Violent content, threats
 * - sexual: Sexual content
 * - self_harm: Self-harm, suicide
 * - harassment: Bullying, harassment
 * - illegal: Illegal activities
 * - profanity: Swear words, vulgar language
 *
 * Note: This is a keyword-based detector. For production use, consider
 * integrating with OpenAI Moderation API or similar service.
 */
@ApplicationScoped
public class ContentModerator {

    // Category patterns (simplified - production should use ML models)
    private static final Map<String, List<Pattern>> CATEGORY_PATTERNS = new HashMap<>();

    static {
        // Violence indicators
        CATEGORY_PATTERNS.put("violence", List.of(
                Pattern.compile("(?i)\\b(?:kill|murder|attack|assault|hurt|harm|stab|shoot|bomb)\\s+(?:you|him|her|them|people|someone)"),
                Pattern.compile("(?i)\\b(?:death|threat|torture)\\b.*\\b(?:to|against)\\b"),
                Pattern.compile("(?i)\\bhow\\s+to\\s+(?:make|build)\\s+(?:a\\s+)?(?:bomb|weapon|gun)\\b")
        ));

        // Hate speech indicators
        CATEGORY_PATTERNS.put("hate", List.of(
                Pattern.compile("(?i)\\b(?:hate|despise|exterminate)\\s+(?:all\\s+)?(?:jews|muslims|christians|blacks|whites|asians|gays|women|men)\\b"),
                Pattern.compile("(?i)\\bracist|\\bsexist|\\bhomophobic|\\btransphobic\\b")
        ));

        // Self-harm indicators
        CATEGORY_PATTERNS.put("self_harm", List.of(
                Pattern.compile("(?i)\\bhow\\s+to\\s+(?:kill|hurt)\\s+(?:myself|yourself)\\b"),
                Pattern.compile("(?i)\\b(?:commit|contemplating)\\s+suicide\\b"),
                Pattern.compile("(?i)\\bwant\\s+to\\s+(?:die|end\\s+(?:my|it\\s+all))\\b")
        ));

        // Illegal activities
        CATEGORY_PATTERNS.put("illegal", List.of(
                Pattern.compile("(?i)\\bhow\\s+to\\s+(?:hack|steal|rob|kidnap|smuggle)\\b"),
                Pattern.compile("(?i)\\b(?:buy|sell|make)\\s+(?:drugs|cocaine|heroin|meth)\\b"),
                Pattern.compile("(?i)\\bchild\\s+(?:porn|abuse|exploitation)\\b")
        ));

        // Harassment
        CATEGORY_PATTERNS.put("harassment", List.of(
                Pattern.compile("(?i)\\byou\\s+(?:are|should)\\s+(?:worthless|stupid|ugly|die)\\b"),
                Pattern.compile("(?i)\\bno\\s+one\\s+(?:loves|cares\\s+about|wants)\\s+you\\b")
        ));
    }

    // Profanity word list (partial - extend as needed)
    private static final Set<String> PROFANITY_WORDS = Set.of(
            "fuck", "shit", "damn", "ass", "bitch", "bastard",
            "crap", "dick", "cock", "pussy", "cunt", "whore"
    );

    /**
     * Check content for moderation issues.
     *
     * @param content Content to check
     * @param config Configuration with categories to check
     * @return GuardrailResult with moderation results
     */
    public GuardrailResult check(String content, JsonNode config) {
        Set<String> categoriesToCheck = parseCategories(config);
        Map<String, Integer> flaggedCategories = new HashMap<>();

        String lowerContent = content.toLowerCase();

        // Check pattern-based categories
        for (String category : categoriesToCheck) {
            if (CATEGORY_PATTERNS.containsKey(category)) {
                int matches = 0;
                for (Pattern pattern : CATEGORY_PATTERNS.get(category)) {
                    if (pattern.matcher(content).find()) {
                        matches++;
                    }
                }
                if (matches > 0) {
                    flaggedCategories.put(category, matches);
                }
            }
        }

        // Check profanity
        if (categoriesToCheck.contains("profanity")) {
            int profanityCount = 0;
            for (String word : PROFANITY_WORDS) {
                if (lowerContent.contains(word)) {
                    profanityCount++;
                }
            }
            if (profanityCount > 0) {
                flaggedCategories.put("profanity", profanityCount);
            }
        }

        if (flaggedCategories.isEmpty()) {
            return GuardrailResult.pass("moderation");
        }

        String message = "Content flagged for: " + flaggedCategories.keySet();
        Map<String, Object> details = new HashMap<>();
        details.put("flaggedCategories", flaggedCategories);
        details.put("totalFlags", flaggedCategories.values().stream().mapToInt(Integer::intValue).sum());

        return GuardrailResult.failWithDetails("moderation", message, details);
    }

    private Set<String> parseCategories(JsonNode config) {
        Set<String> categories = new HashSet<>();

        if (config.has("categories") && config.get("categories").isArray()) {
            for (JsonNode cat : config.get("categories")) {
                categories.add(cat.asText().toLowerCase());
            }
        }

        // Default categories if none specified
        if (categories.isEmpty()) {
            categories.addAll(Set.of("violence", "hate", "self_harm", "illegal", "harassment"));
        }

        return categories;
    }
}
