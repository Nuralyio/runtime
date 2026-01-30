package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Topic restriction checker.
 * Blocks or warns when content mentions restricted topics.
 *
 * Configuration:
 * {
 *   "blocked": ["competitor_names", "internal_secrets", "politics"],
 *   "keywords": {
 *     "competitor_names": ["competitor1", "competitor2"],
 *     "internal_secrets": ["project_x", "secret_sauce"]
 *   },
 *   "caseSensitive": false
 * }
 */
@ApplicationScoped
public class TopicRestrictor {

    // Pre-defined topic patterns
    private static final Map<String, List<String>> PREDEFINED_TOPICS = Map.of(
            "politics", List.of("democrat", "republican", "election", "biden", "trump", "congress", "senate", "liberal", "conservative"),
            "religion", List.of("christian", "muslim", "jewish", "buddhist", "hindu", "atheist", "church", "mosque", "synagogue"),
            "medical_advice", List.of("diagnose", "prescription", "treatment for", "cure for", "medical advice"),
            "financial_advice", List.of("investment advice", "buy stock", "sell stock", "financial recommendation"),
            "legal_advice", List.of("legal advice", "sue", "lawsuit", "attorney", "lawyer recommendation")
    );

    /**
     * Check content for restricted topics.
     *
     * @param content Content to check
     * @param config Configuration with blocked topics
     * @return GuardrailResult with restriction results
     */
    public GuardrailResult check(String content, JsonNode config) {
        List<String> blockedTopics = parseBlockedTopics(config);
        Map<String, List<String>> customKeywords = parseCustomKeywords(config);
        boolean caseSensitive = config.has("caseSensitive") && config.get("caseSensitive").asBoolean();

        String checkContent = caseSensitive ? content : content.toLowerCase();
        Map<String, List<String>> detectedTopics = new HashMap<>();

        for (String topic : blockedTopics) {
            List<String> keywords = getKeywordsForTopic(topic, customKeywords);
            List<String> matches = new ArrayList<>();

            for (String keyword : keywords) {
                String checkKeyword = caseSensitive ? keyword : keyword.toLowerCase();
                if (checkContent.contains(checkKeyword)) {
                    matches.add(keyword);
                }
            }

            if (!matches.isEmpty()) {
                detectedTopics.put(topic, matches);
            }
        }

        if (detectedTopics.isEmpty()) {
            return GuardrailResult.pass("topics");
        }

        String message = "Content contains restricted topics: " + detectedTopics.keySet();
        Map<String, Object> details = new HashMap<>();
        details.put("detectedTopics", detectedTopics.keySet());
        details.put("matchedKeywords", detectedTopics);

        return GuardrailResult.failWithDetails("topics", message, details);
    }

    private List<String> parseBlockedTopics(JsonNode config) {
        List<String> topics = new ArrayList<>();

        if (config.has("blocked") && config.get("blocked").isArray()) {
            for (JsonNode topic : config.get("blocked")) {
                topics.add(topic.asText());
            }
        }

        return topics;
    }

    private Map<String, List<String>> parseCustomKeywords(JsonNode config) {
        Map<String, List<String>> keywords = new HashMap<>();

        if (config.has("keywords") && config.get("keywords").isObject()) {
            config.get("keywords").fields().forEachRemaining(entry -> {
                List<String> topicKeywords = new ArrayList<>();
                if (entry.getValue().isArray()) {
                    entry.getValue().forEach(kw -> topicKeywords.add(kw.asText()));
                }
                keywords.put(entry.getKey(), topicKeywords);
            });
        }

        return keywords;
    }

    private List<String> getKeywordsForTopic(String topic, Map<String, List<String>> customKeywords) {
        // Check custom keywords first
        if (customKeywords.containsKey(topic)) {
            return customKeywords.get(topic);
        }

        // Fall back to predefined topics
        if (PREDEFINED_TOPICS.containsKey(topic)) {
            return PREDEFINED_TOPICS.get(topic);
        }

        // If neither, use the topic name itself as a keyword
        return List.of(topic);
    }
}
