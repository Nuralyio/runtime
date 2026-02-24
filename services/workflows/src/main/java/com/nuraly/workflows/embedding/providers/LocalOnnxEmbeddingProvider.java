package com.nuraly.workflows.embedding.providers;

import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.onnxruntime.*;
import com.nuraly.workflows.embedding.EmbeddingProvider;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.LongBuffer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.*;

/**
 * Local ONNX Embedding Provider - No API key required!
 *
 * Runs sentence-transformer models locally using ONNX Runtime.
 * Perfect for:
 *   - Development and testing (no API costs)
 *   - Air-gapped environments (no internet after first download)
 *   - Privacy-sensitive data (no external calls)
 *   - Low latency requirements (~10ms vs ~200ms for cloud)
 *
 * Default model: all-MiniLM-L6-v2 (384 dimensions, 23MB)
 *
 * Models are auto-downloaded from HuggingFace on first use.
 */
@ApplicationScoped
public class LocalOnnxEmbeddingProvider implements EmbeddingProvider {

    private static final Logger LOG = Logger.getLogger(LocalOnnxEmbeddingProvider.class);

    // Model configurations
    private static final Map<String, ModelConfig> MODELS = new HashMap<>();
    static {
        MODELS.put("all-MiniLM-L6-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/main/tokenizer.json"));
        MODELS.put("all-MiniLM-L12-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/tokenizer.json"));
        MODELS.put("paraphrase-MiniLM-L6-v2", new ModelConfig(384,
            "https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2/resolve/main/onnx/model.onnx",
            "https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2/resolve/main/tokenizer.json"));
    }

    private static final String DEFAULT_MODEL = "all-MiniLM-L6-v2";
    private static final Path CACHE_DIR = Path.of(System.getProperty("user.home"), ".cache", "nuraly", "models");

    private OrtEnvironment environment;
    private final Map<String, LoadedModel> loadedModels = new HashMap<>();

    @PostConstruct
    void init() {
        try {
            environment = OrtEnvironment.getEnvironment();
            LOG.info("ONNX Runtime initialized for local embeddings");
        } catch (Exception e) {
            LOG.error("Failed to initialize ONNX Runtime", e);
        }
    }

    @PreDestroy
    void cleanup() {
        for (LoadedModel model : loadedModels.values()) {
            try {
                if (model.session != null) {
                    model.session.close();
                }
                if (model.tokenizer != null) {
                    model.tokenizer.close();
                }
            } catch (Exception e) {
                LOG.warn("Error closing model", e);
            }
        }
        loadedModels.clear();
    }

    @Override
    public String getName() {
        return "local";
    }

    @Override
    public boolean supportsModel(String model) {
        return MODELS.containsKey(model);
    }

    @Override
    public String getDefaultModel() {
        return DEFAULT_MODEL;
    }

    @Override
    public int getEmbeddingDimension(String model) {
        ModelConfig config = MODELS.get(model);
        return config != null ? config.dimensions : 384;
    }

    @Override
    public EmbeddingResult embed(String text, String model, String apiKey, String baseUrl) {
        // apiKey and baseUrl are ignored for local models
        String useModel = model != null && MODELS.containsKey(model) ? model : DEFAULT_MODEL;

        try {
            LoadedModel loaded = getOrLoadModel(useModel);
            float[] embedding = computeEmbedding(loaded, text);
            return EmbeddingResult.success(embedding, estimateTokenCount(text));
        } catch (Exception e) {
            LOG.errorf("Local embedding failed: %s", e.getMessage());
            return EmbeddingResult.error("Local embedding failed: " + e.getMessage());
        }
    }

    @Override
    public List<EmbeddingResult> embedBatch(List<String> texts, String model, String apiKey, String baseUrl) {
        String useModel = model != null && MODELS.containsKey(model) ? model : DEFAULT_MODEL;
        List<EmbeddingResult> results = new ArrayList<>();

        try {
            LoadedModel loaded = getOrLoadModel(useModel);

            for (String text : texts) {
                try {
                    float[] embedding = computeEmbedding(loaded, text);
                    results.add(EmbeddingResult.success(embedding, estimateTokenCount(text)));
                } catch (Exception e) {
                    results.add(EmbeddingResult.error(e.getMessage()));
                }
            }
        } catch (Exception e) {
            // Model loading failed - return errors for all
            for (int i = 0; i < texts.size(); i++) {
                results.add(EmbeddingResult.error("Model loading failed: " + e.getMessage()));
            }
        }

        return results;
    }

    /**
     * Get or load a model (lazy loading with caching).
     */
    private synchronized LoadedModel getOrLoadModel(String modelName) throws Exception {
        if (loadedModels.containsKey(modelName)) {
            return loadedModels.get(modelName);
        }

        LOG.infof("Loading local model: %s", modelName);
        ModelConfig config = MODELS.get(modelName);
        if (config == null) {
            throw new IllegalArgumentException("Unknown model: " + modelName);
        }

        // Ensure cache directory exists
        Files.createDirectories(CACHE_DIR);

        // Download model if not cached
        Path modelPath = CACHE_DIR.resolve(modelName + ".onnx");
        Path tokenizerPath = CACHE_DIR.resolve(modelName + "_tokenizer.json");

        if (!Files.exists(modelPath)) {
            LOG.infof("Downloading model %s...", modelName);
            downloadFile(config.modelUrl, modelPath);
        }

        if (!Files.exists(tokenizerPath)) {
            LOG.infof("Downloading tokenizer for %s...", modelName);
            downloadFile(config.tokenizerUrl, tokenizerPath);
        }

        // Load model and tokenizer
        OrtSession.SessionOptions options = new OrtSession.SessionOptions();
        options.setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT);

        OrtSession session = environment.createSession(modelPath.toString(), options);
        HuggingFaceTokenizer tokenizer = HuggingFaceTokenizer.newInstance(tokenizerPath);

        LoadedModel loaded = new LoadedModel(session, tokenizer, config.dimensions);
        loadedModels.put(modelName, loaded);

        LOG.infof("Model %s loaded successfully (%d dimensions)", modelName, config.dimensions);
        return loaded;
    }

    /**
     * Compute embedding for a single text.
     */
    private float[] computeEmbedding(LoadedModel model, String text) throws OrtException {
        // Tokenize
        var encoding = model.tokenizer.encode(text);
        long[] inputIds = encoding.getIds();
        long[] attentionMask = encoding.getAttentionMask();

        // Prepare inputs
        long[] shape = {1, inputIds.length};

        try (OnnxTensor inputIdsTensor = OnnxTensor.createTensor(environment,
                LongBuffer.wrap(inputIds), shape);
             OnnxTensor attentionMaskTensor = OnnxTensor.createTensor(environment,
                LongBuffer.wrap(attentionMask), shape)) {

            Map<String, OnnxTensor> inputs = new HashMap<>();
            inputs.put("input_ids", inputIdsTensor);
            inputs.put("attention_mask", attentionMaskTensor);

            // Some models also need token_type_ids
            long[] tokenTypeIds = new long[inputIds.length];
            Arrays.fill(tokenTypeIds, 0);
            try (OnnxTensor tokenTypeTensor = OnnxTensor.createTensor(environment,
                    LongBuffer.wrap(tokenTypeIds), shape)) {
                inputs.put("token_type_ids", tokenTypeTensor);

                // Run inference
                try (OrtSession.Result result = model.session.run(inputs)) {
                    // Get the output (last_hidden_state)
                    // Shape: [batch_size, sequence_length, hidden_size]
                    float[][][] output = (float[][][]) result.get(0).getValue();

                    // Mean pooling over sequence length
                    float[] embedding = meanPooling(output[0], attentionMask);

                    // L2 normalize
                    normalize(embedding);

                    return embedding;
                }
            }
        }
    }

    /**
     * Mean pooling: average token embeddings weighted by attention mask.
     */
    private float[] meanPooling(float[][] tokenEmbeddings, long[] attentionMask) {
        int seqLen = tokenEmbeddings.length;
        int embDim = tokenEmbeddings[0].length;
        float[] result = new float[embDim];
        float maskSum = 0;

        for (int i = 0; i < seqLen; i++) {
            if (attentionMask[i] == 1) {
                maskSum += 1;
                for (int j = 0; j < embDim; j++) {
                    result[j] += tokenEmbeddings[i][j];
                }
            }
        }

        if (maskSum > 0) {
            for (int j = 0; j < embDim; j++) {
                result[j] /= maskSum;
            }
        }

        return result;
    }

    /**
     * L2 normalize embedding vector.
     */
    private void normalize(float[] embedding) {
        float norm = 0;
        for (float v : embedding) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);

        if (norm > 0) {
            for (int i = 0; i < embedding.length; i++) {
                embedding[i] /= norm;
            }
        }
    }

    /**
     * Download file from URL to path.
     */
    private void downloadFile(String urlStr, Path target) throws IOException {
        URL url = new URL(urlStr);
        try (InputStream in = url.openStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    /**
     * Estimate token count (rough approximation).
     */
    private int estimateTokenCount(String text) {
        // Rough estimate: ~4 characters per token
        return text.length() / 4;
    }

    // ========================================================================
    // Inner Classes
    // ========================================================================

    private static class ModelConfig {
        final int dimensions;
        final String modelUrl;
        final String tokenizerUrl;

        ModelConfig(int dimensions, String modelUrl, String tokenizerUrl) {
            this.dimensions = dimensions;
            this.modelUrl = modelUrl;
            this.tokenizerUrl = tokenizerUrl;
        }
    }

    private static class LoadedModel {
        final OrtSession session;
        final HuggingFaceTokenizer tokenizer;
        final int dimensions;

        LoadedModel(OrtSession session, HuggingFaceTokenizer tokenizer, int dimensions) {
            this.session = session;
            this.tokenizer = tokenizer;
            this.dimensions = dimensions;
        }
    }
}
