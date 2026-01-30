package com.nuraly.workflows.embedding.providers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Ollama Embedding Provider for local/self-hosted embeddings.
 *
 * Supports any Ollama model with embedding capability:
 *   - nomic-embed-text (768 dimensions)
 *   - mxbai-embed-large (1024 dimensions)
 *   - all-minilm (384 dimensions)
 *   - etc.
 *
 * Requires Ollama server running locally or accessible via network.
 */
@ApplicationScoped
public class OllamaEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(OllamaEmbeddingProvider.class);

    private static final Map<String, Integer> KNOWN_DIMENSIONS = Map.of(
        "nomic-embed-text", 768,
        "mxbai-embed-large", 1024,
        "all-minilm", 384,
        "snowflake-arctic-embed", 1024
    );

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "ollama";
    }

    @Override
    public boolean supportsModel(String model) {
        // Ollama can run any model, so we accept all
        return model != null && !model.isEmpty();
    }

    @Override
    public String getDefaultModel() {
        return "nomic-embed-text";
    }

    @Override
    public int getEmbeddingDimension(String model) {
        // Return known dimension or default to 768
        // The actual dimension will be determined at runtime
        return KNOWN_DIMENSIONS.getOrDefault(model, 768);
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        if (baseUrl == null || baseUrl.isEmpty()) {
            return EmbeddingResult.error("Ollama requires a base URL (e.g., http://localhost:11434)");
        }

        String useModel = model != null ? model : getDefaultModel();
        String url = baseUrl + "/api/embeddings";

        try {
            // Build request body
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", useModel);
            requestBody.put("prompt", text);

            // Make HTTP request
            try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
                HttpPost httpPost = new HttpPost(url);
                httpPost.addHeader("Content-Type", "application/json");
                // Ollama typically doesn't require auth, but support it if provided
                if (apiKey != null && !apiKey.isEmpty()) {
                    httpPost.addHeader("Authorization", "Bearer " + apiKey);
                }
                httpPost.setEntity(new StringEntity(
                    objectMapper.writeValueAsString(requestBody),
                    ContentType.APPLICATION_JSON
                ));

                var response = httpClient.execute(httpPost);
                int statusCode = response.getCode();
                String responseBody = EntityUtils.toString(response.getEntity());

                if (statusCode >= 200 && statusCode < 300) {
                    return parseResponse(responseBody);
                } else {
                    LOG.errorf("Ollama embedding error (status %d): %s", statusCode, responseBody);
                    return EmbeddingResult.error("Ollama error: " + responseBody);
                }
            }
        } catch (Exception e) {
            LOG.errorf("Ollama embedding request failed: %s", e.getMessage());
            return EmbeddingResult.error("Ollama request failed: " + e.getMessage());
        }
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        // Ollama doesn't support batch embedding natively, so we loop
        List<EmbeddingResult> results = new ArrayList<>();
        for (String text : texts) {
            results.add(embed(text, model, apiKey, baseUrl));
        }
        return results;
    }

    private EmbeddingResult parseResponse(String responseBody) {
        try {
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode embeddingNode = json.get("embedding");

            if (embeddingNode == null || !embeddingNode.isArray()) {
                return EmbeddingResult.error("No embedding in response");
            }

            float[] embedding = new float[embeddingNode.size()];
            for (int i = 0; i < embeddingNode.size(); i++) {
                embedding[i] = (float) embeddingNode.get(i).asDouble();
            }

            return EmbeddingResult.success(embedding, 0); // Ollama doesn't return token count
        } catch (Exception e) {
            return EmbeddingResult.error("Failed to parse Ollama response: " + e.getMessage());
        }
    }
}
