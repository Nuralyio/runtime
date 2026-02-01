package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import com.nuraly.workflows.embedding.EmbeddingProviderFactory;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * Semantic similarity check for off-topic detection.
 *
 * Uses embeddings to determine if content is on-topic or off-topic
 * based on semantic similarity to allowed/blocked topic descriptions.
 *
 * Configuration:
 * {
 *   "type": "semantic_topic",
 *   "provider": "openai",
 *   "model": "text-embedding-3-small",
 *   "apiKey": "${OPENAI_API_KEY}",
 *   "mode": "allowlist" | "blocklist",
 *   "topics": [
 *     {
 *       "name": "customer_support",
 *       "description": "Questions about products, orders, shipping, returns, refunds, account issues",
 *       "examples": ["Where is my order?", "How do I return an item?", "Reset my password"]
 *     },
 *     {
 *       "name": "product_info",
 *       "description": "Information about product features, specifications, pricing, availability"
 *     }
 *   ],
 *   "threshold": 0.75,        // Similarity threshold (0-1)
 *   "minDifference": 0.1      // Minimum difference between on-topic and off-topic scores
 * }
 *
 * Modes:
 * - allowlist: Content must be similar to at least one allowed topic
 * - blocklist: Content must NOT be similar to any blocked topic
 */
@ApplicationScoped
public class SemanticTopicCheck {

    private static final Logger LOG = Logger.getLogger(SemanticTopicCheck.class);
    private static final double DEFAULT_THRESHOLD = 0.75;
    private static final double DEFAULT_MIN_DIFFERENCE = 0.1;

    @Inject
    EmbeddingProviderFactory embeddingProviderFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache for topic embeddings (topic description -> embedding)
    private final Map<String, float[]> embeddingCache = new HashMap<>();

    /**
     * Check if content is on-topic using semantic similarity.
     *
     * @param content Content to check
     * @param config Configuration with topics and settings
     * @return GuardrailResult indicating if content is on/off topic
     */
    public GuardrailResult check(String content, JsonNode config) {
        String providerName = config.has("provider") ? config.get("provider").asText() : "openai";
        String apiKey = config.has("apiKey") ? config.get("apiKey").asText() : null;

        if (apiKey == null || apiKey.isEmpty()) {
            return GuardrailResult.fail("semantic_topic",
                    "API key not configured for semantic topic check");
        }

        EmbeddingProvider provider = embeddingProviderFactory.getProvider(providerName);
        if (provider == null) {
            return GuardrailResult.fail("semantic_topic",
                    "Unknown embedding provider: " + providerName);
        }

        String model = config.has("model") ? config.get("model").asText() : provider.getDefaultModel();
        String mode = config.has("mode") ? config.get("mode").asText() : "allowlist";
        double threshold = config.has("threshold") ? config.get("threshold").asDouble() : DEFAULT_THRESHOLD;
        double minDifference = config.has("minDifference") ? config.get("minDifference").asDouble() : DEFAULT_MIN_DIFFERENCE;

        // Parse topics
        List<TopicDefinition> topics = parseTopics(config);
        if (topics.isEmpty()) {
            return GuardrailResult.pass("semantic_topic");  // No topics defined
        }

        try {
            // Get content embedding
            float[] contentEmbedding = getEmbedding(content, provider, model, apiKey, null);
            if (contentEmbedding == null) {
                return GuardrailResult.fail("semantic_topic", "Failed to generate content embedding");
            }

            // Calculate similarity with each topic
            List<TopicScore> scores = new ArrayList<>();
            for (TopicDefinition topic : topics) {
                float[] topicEmbedding = getTopicEmbedding(topic, provider, model, apiKey);
                if (topicEmbedding == null) continue;

                double similarity = cosineSimilarity(contentEmbedding, topicEmbedding);
                scores.add(new TopicScore(topic.name, similarity));
            }

            // Sort by similarity descending
            scores.sort((a, b) -> Double.compare(b.similarity, a.similarity));

            if ("allowlist".equalsIgnoreCase(mode)) {
                return checkAllowlist(scores, threshold, minDifference);
            } else {
                return checkBlocklist(scores, threshold);
            }

        } catch (Exception e) {
            LOG.errorf(e, "Semantic topic check failed");
            return GuardrailResult.fail("semantic_topic",
                    "Semantic check error: " + e.getMessage());
        }
    }

    private GuardrailResult checkAllowlist(List<TopicScore> scores, double threshold, double minDifference) {
        if (scores.isEmpty()) {
            return GuardrailResult.fail("semantic_topic", "No topic scores available");
        }

        TopicScore bestMatch = scores.get(0);

        // Check if best match meets threshold
        if (bestMatch.similarity >= threshold) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("matchedTopic", bestMatch.topicName);
            details.put("similarity", Math.round(bestMatch.similarity * 100) / 100.0);
            details.put("threshold", threshold);
            details.put("allScores", formatScores(scores));

            return GuardrailResult.builder()
                    .type("semantic_topic")
                    .passed(true)
                    .message("Content matches topic: " + bestMatch.topicName)
                    .details(details)
                    .build();
        }

        // Off-topic
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("bestMatch", bestMatch.topicName);
        details.put("bestSimilarity", Math.round(bestMatch.similarity * 100) / 100.0);
        details.put("threshold", threshold);
        details.put("allScores", formatScores(scores));

        return GuardrailResult.failWithDetails("semantic_topic",
                "Content is off-topic. Best match: " + bestMatch.topicName +
                        " (similarity: " + String.format("%.2f", bestMatch.similarity) +
                        ", threshold: " + threshold + ")",
                details);
    }

    private GuardrailResult checkBlocklist(List<TopicScore> scores, double threshold) {
        // Find any blocked topic that matches
        List<TopicScore> violations = scores.stream()
                .filter(s -> s.similarity >= threshold)
                .toList();

        if (violations.isEmpty()) {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("allScores", formatScores(scores));
            details.put("threshold", threshold);

            return GuardrailResult.builder()
                    .type("semantic_topic")
                    .passed(true)
                    .message("Content does not match any blocked topics")
                    .details(details)
                    .build();
        }

        // Content matches blocked topic
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("matchedBlockedTopics", violations.stream()
                .map(v -> Map.of("topic", v.topicName, "similarity", v.similarity))
                .toList());
        details.put("threshold", threshold);

        return GuardrailResult.failWithDetails("semantic_topic",
                "Content matches blocked topic(s): " +
                        violations.stream().map(v -> v.topicName).toList(),
                details);
    }

    private float[] getTopicEmbedding(TopicDefinition topic, EmbeddingProvider provider,
                                       String model, String apiKey) throws Exception {
        // Build topic text for embedding
        StringBuilder topicText = new StringBuilder();
        topicText.append(topic.name).append(": ");
        topicText.append(topic.description);

        if (topic.examples != null && !topic.examples.isEmpty()) {
            topicText.append(" Examples: ");
            topicText.append(String.join(". ", topic.examples));
        }

        String cacheKey = topicText.toString();

        // Check cache
        if (embeddingCache.containsKey(cacheKey)) {
            return embeddingCache.get(cacheKey);
        }

        // Generate embedding
        float[] embedding = getEmbedding(topicText.toString(), provider, model, apiKey, null);
        if (embedding != null) {
            embeddingCache.put(cacheKey, embedding);
        }

        return embedding;
    }

    private float[] getEmbedding(String text, EmbeddingProvider provider, String model,
                                  String apiKey, String baseUrl) throws Exception {
        EmbeddingProvider.EmbeddingResult result = provider.embed(text, model, apiKey, baseUrl);

        if (!result.isSuccess()) {
            LOG.warnf("Failed to generate embedding: %s", result.getError());
            return null;
        }

        return result.getEmbedding();
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("Vectors must have same dimension");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0 || normB == 0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private List<Map<String, Object>> formatScores(List<TopicScore> scores) {
        return scores.stream()
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("topic", s.topicName);
                    m.put("similarity", Math.round(s.similarity * 100) / 100.0);
                    return m;
                })
                .toList();
    }

    private List<TopicDefinition> parseTopics(JsonNode config) {
        List<TopicDefinition> topics = new ArrayList<>();

        if (!config.has("topics") || !config.get("topics").isArray()) {
            return topics;
        }

        for (JsonNode topicNode : config.get("topics")) {
            TopicDefinition topic = new TopicDefinition();
            topic.name = topicNode.has("name") ? topicNode.get("name").asText() : "unnamed";
            topic.description = topicNode.has("description") ? topicNode.get("description").asText() : "";

            if (topicNode.has("examples") && topicNode.get("examples").isArray()) {
                topic.examples = new ArrayList<>();
                for (JsonNode example : topicNode.get("examples")) {
                    topic.examples.add(example.asText());
                }
            }

            topics.add(topic);
        }

        return topics;
    }

    private static class TopicDefinition {
        String name;
        String description;
        List<String> examples;
    }

    private static class TopicScore {
        String topicName;
        double similarity;

        TopicScore(String topicName, double similarity) {
            this.topicName = topicName;
            this.similarity = similarity;
        }
    }

    /**
     * Clear the embedding cache (useful for testing or when topics change).
     */
    public void clearCache() {
        embeddingCache.clear();
    }
}
