package com.nuraly.workflows.guardrails.checks;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.guardrails.GuardrailResult;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * OpenAI Moderation API integration for ML-based content moderation.
 *
 * Uses OpenAI's moderation endpoint which checks for:
 * - hate: Hateful content
 * - hate/threatening: Hateful content with threats
 * - harassment: Harassment content
 * - harassment/threatening: Harassment with threats
 * - self-harm: Self-harm content
 * - self-harm/intent: Intent to self-harm
 * - self-harm/instructions: Instructions for self-harm
 * - sexual: Sexual content
 * - sexual/minors: Sexual content involving minors
 * - violence: Violent content
 * - violence/graphic: Graphic violence
 *
 * Configuration:
 * {
 *   "type": "openai_moderation",
 *   "apiKey": "${OPENAI_API_KEY}",  // Required
 *   "model": "text-moderation-latest",  // or "text-moderation-stable"
 *   "categories": ["hate", "violence", "sexual"],  // Optional filter
 *   "thresholds": {  // Optional custom thresholds (0-1)
 *     "hate": 0.5,
 *     "violence": 0.7
 *   }
 * }
 */
@ApplicationScoped
public class OpenAiModerationCheck {

    private static final Logger LOG = Logger.getLogger(OpenAiModerationCheck.class);
    private static final String MODERATION_URL = "https://api.openai.com/v1/moderations";
    private static final String DEFAULT_MODEL = "text-moderation-latest";

    // Default thresholds (OpenAI returns scores 0-1)
    private static final Map<String, Double> DEFAULT_THRESHOLDS = Map.ofEntries(
            Map.entry("hate", 0.5),
            Map.entry("hate/threatening", 0.5),
            Map.entry("harassment", 0.5),
            Map.entry("harassment/threatening", 0.5),
            Map.entry("self-harm", 0.5),
            Map.entry("self-harm/intent", 0.5),
            Map.entry("self-harm/instructions", 0.5),
            Map.entry("sexual", 0.5),
            Map.entry("sexual/minors", 0.1),  // Lower threshold for minors
            Map.entry("violence", 0.5),
            Map.entry("violence/graphic", 0.5)
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Check content using OpenAI Moderation API.
     *
     * @param content Content to check
     * @param config Configuration with API key and options
     * @return GuardrailResult with moderation results
     */
    public GuardrailResult check(String content, JsonNode config) {
        String apiKey = config.has("apiKey") ? config.get("apiKey").asText() : null;
        if (apiKey == null || apiKey.isEmpty()) {
            return GuardrailResult.fail("openai_moderation",
                    "OpenAI API key not configured");
        }

        try {
            // Build request
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("input", content);

            String model = config.has("model") ? config.get("model").asText() : DEFAULT_MODEL;
            requestBody.put("model", model);

            // Call OpenAI Moderation API
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(MODERATION_URL);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.addHeader("Authorization", "Bearer " + apiKey);
                httpPost.setEntity(new StringEntity(
                        objectMapper.writeValueAsString(requestBody),
                        ContentType.APPLICATION_JSON));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode < 200 || statusCode >= 300) {
                    LOG.warnf("OpenAI Moderation API error: %d - %s", statusCode, responseBody);
                    return GuardrailResult.fail("openai_moderation",
                            "Moderation API error: " + statusCode);
                }

                return parseResponse(responseBody, config);
            }
        } catch (Exception e) {
            LOG.errorf(e, "OpenAI Moderation API call failed");
            return GuardrailResult.fail("openai_moderation",
                    "Moderation API call failed: " + e.getMessage());
        }
    }

    private GuardrailResult parseResponse(String responseBody, JsonNode config) throws Exception {
        JsonNode response = objectMapper.readTree(responseBody);

        if (!response.has("results") || !response.get("results").isArray() ||
            response.get("results").isEmpty()) {
            return GuardrailResult.fail("openai_moderation", "Invalid API response");
        }

        JsonNode result = response.get("results").get(0);
        boolean flagged = result.get("flagged").asBoolean();
        JsonNode categories = result.get("categories");
        JsonNode categoryScores = result.get("category_scores");

        // Get configured categories to check (or check all)
        Set<String> categoriesToCheck = parseCategories(config);
        Map<String, Double> thresholds = parseThresholds(config);

        // Analyze results
        Map<String, Double> flaggedCategories = new LinkedHashMap<>();

        Iterator<String> categoryNames = categories.fieldNames();
        while (categoryNames.hasNext()) {
            String category = categoryNames.next();

            // Skip if not in configured categories
            if (!categoriesToCheck.isEmpty() && !categoriesToCheck.contains(category)) {
                continue;
            }

            double score = categoryScores.get(category).asDouble();
            double threshold = thresholds.getOrDefault(category,
                    DEFAULT_THRESHOLDS.getOrDefault(category, 0.5));

            if (score >= threshold) {
                flaggedCategories.put(category, score);
            }
        }

        if (flaggedCategories.isEmpty()) {
            return GuardrailResult.pass("openai_moderation");
        }

        // Build detailed result
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("flaggedCategories", flaggedCategories);
        details.put("openAiFlagged", flagged);
        details.put("model", config.has("model") ? config.get("model").asText() : DEFAULT_MODEL);

        String message = "Content flagged by OpenAI Moderation: " + flaggedCategories.keySet();

        return GuardrailResult.failWithDetails("openai_moderation", message, details);
    }

    private Set<String> parseCategories(JsonNode config) {
        Set<String> categories = new HashSet<>();
        if (config.has("categories") && config.get("categories").isArray()) {
            for (JsonNode cat : config.get("categories")) {
                categories.add(cat.asText());
            }
        }
        return categories;
    }

    private Map<String, Double> parseThresholds(JsonNode config) {
        Map<String, Double> thresholds = new HashMap<>(DEFAULT_THRESHOLDS);
        if (config.has("thresholds") && config.get("thresholds").isObject()) {
            config.get("thresholds").fields().forEachRemaining(entry -> {
                thresholds.put(entry.getKey(), entry.getValue().asDouble());
            });
        }
        return thresholds;
    }
}
