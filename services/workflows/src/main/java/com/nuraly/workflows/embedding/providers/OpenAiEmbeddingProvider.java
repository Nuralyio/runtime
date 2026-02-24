package com.nuraly.workflows.embedding.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.embedding.EmbeddingProvider;
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
 * OpenAI Embedding Provider.
 *
 * Supports models:
 *   - text-embedding-ada-002 (1536 dimensions, legacy)
 *   - text-embedding-3-small (1536 dimensions, recommended)
 *   - text-embedding-3-large (3072 dimensions, highest quality)
 */
@ApplicationScoped
public class OpenAiEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(OpenAiEmbeddingProvider.class);
    private static final String API_URL = "https://api.openai.com/v1/embeddings";

    private static final Map<String, Integer> MODEL_DIMENSIONS = Map.of(
        "text-embedding-ada-002", 1536,
        "text-embedding-3-small", 1536,
        "text-embedding-3-large", 3072
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "openai";
    }

    @Override
    public boolean supportsModel(String model) {
        return model != null && (MODEL_DIMENSIONS.containsKey(model) || model.startsWith("text-embedding"));
    }

    @Override
    public String getDefaultModel() {
        return "text-embedding-3-small";
    }

    @Override
    public int getEmbeddingDimension(String model) {
        return MODEL_DIMENSIONS.getOrDefault(model, 1536);
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        List<EmbeddingResult> results = embedBatch(List.of(text), model, apiKey, baseUrl);
        return results.isEmpty() ? EmbeddingResult.error("No result returned") : results.get(0);
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        String useModel = model != null ? model : getDefaultModel();
        String url = baseUrl != null ? baseUrl + "/v1/embeddings" : API_URL;

        try {
            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", useModel);

            ArrayNode inputArray = objectMapper.createArrayNode();
            for (String text : texts) {
                inputArray.add(text);
            }
            requestBody.set("input", inputArray);

            // Make HTTP request
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(url);
                httpPost.addHeader("Content-Type", "application/json");
                httpPost.addHeader("Authorization", "Bearer " + apiKey);
                httpPost.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(requestBody),
                    ContentType.APPLICATION_JSON
                ));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody, texts.size());
                } else {
                    String error = extractErrorMessage(responseBody);
                    LOG.errorf("OpenAI embedding error (status %d): %s", statusCode, error);

                    // Return error for all inputs
                    List<EmbeddingResult> errorResults = new ArrayList<>();
                    for (int i = 0; i < texts.size(); i++) {
                        errorResults.add(EmbeddingResult.error(error));
                    }
                    return errorResults;
                }
            }
        } catch (Exception e) {
            LOG.errorf("OpenAI embedding request failed: %s", e.getMessage());

            List<EmbeddingResult> errorResults = new ArrayList<>();
            for (int i = 0; i < texts.size(); i++) {
                errorResults.add(EmbeddingResult.error(e.getMessage()));
            }
            return errorResults;
        }
    }

    private List<EmbeddingResult> parseResponse(String responseBody, int expectedCount) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode dataArray = json.get("data");
            JsonNode usage = json.get("usage");

            int totalTokens = usage != null && usage.has("total_tokens")
                ? usage.get("total_tokens").asInt()
                : 0;
            int tokensPerItem = expectedCount > 0 ? totalTokens / expectedCount : 0;

            List<EmbeddingResult> results = new ArrayList<>();

            for (JsonNode item : dataArray) {
                JsonNode embeddingNode = item.get("embedding");
                float[] embedding = new float[embeddingNode.size()];

                for (int i = 0; i < embeddingNode.size(); i++) {
                    embedding[i] = (float) embeddingNode.get(i).asDouble();
                }

                results.add(EmbeddingResult.success(embedding, tokensPerItem));
            }

            return results;
        } catch (Exception e) {
            LOG.errorf("Failed to parse OpenAI embedding response: %s", e.getMessage());
            List<EmbeddingResult> errorResults = new ArrayList<>();
            for (int i = 0; i < expectedCount; i++) {
                errorResults.add(EmbeddingResult.error("Failed to parse response: " + e.getMessage()));
            }
            return errorResults;
        }
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            if (json.has("error") && json.get("error").has("message")) {
                return json.get("error").get("message").asText();
            }
            return responseBody;
        } catch (Exception e) {
            return responseBody;
        }
    }
}
