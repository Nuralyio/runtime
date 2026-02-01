package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.EmbeddingEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.vector.VectorStoreService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.*;

/**
 * VECTOR_WRITE Node Executor - Writes embeddings to the vector store.
 *
 * Node Configuration:
 * {
 *   "collectionName": "knowledge-base",     // Collection to store in
 *   "upsertMode": "replace" | "append",     // How to handle existing sourceId
 *   "isolationKey": "{{userId}}"            // Optional isolation key
 * }
 *
 * Input (single embedding from EMBEDDING node):
 *   {
 *     "embedding": [0.1, 0.2, ...],
 *     "content": "The text that was embedded",
 *     "sourceId": "document.pdf",
 *     "sourceType": "pdf",
 *     "metadata": { ... }
 *   }
 *
 * Input (multiple embeddings - from TEXT_SPLITTER + EMBEDDING pipeline):
 *   {
 *     "chunks": [
 *       { "content": "chunk1", "embedding": [...], "index": 0 },
 *       { "content": "chunk2", "embedding": [...], "index": 1 }
 *     ],
 *     "embeddings": [[...], [...]],  // Alternative: embeddings array parallel to chunks
 *     "sourceId": "document.pdf",
 *     "sourceType": "pdf"
 *   }
 *
 * Output:
 *   {
 *     "stored": 5,
 *     "collection": "knowledge-base",
 *     "ids": ["uuid1", "uuid2", ...]
 *   }
 */
@ApplicationScoped
public class VectorWriteNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(VectorWriteNodeExecutor.class);

    @Inject
    VectorStoreService vectorStoreService;

    @Inject
    com.nuraly.workflows.monitoring.RagMetricsService ragMetrics;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.VECTOR_WRITE;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("VECTOR_WRITE node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Get collection name (required)
        if (!config.has("collectionName") || config.get("collectionName").asText().isEmpty()) {
            return NodeExecutionResult.failure("collectionName is required in VECTOR_WRITE configuration");
        }
        String collectionName = config.get("collectionName").asText();

        // Get upsert mode
        String upsertMode = config.has("upsertMode") ? config.get("upsertMode").asText() : "replace";

        // Get workflow ID
        UUID workflowId = null;
        if (context.getExecution() != null && context.getExecution().workflow != null) {
            workflowId = context.getExecution().workflow.id;
        }
        if (workflowId == null) {
            return NodeExecutionResult.failure("Could not determine workflow ID for vector storage");
        }

        // Get isolation key
        String isolationKey = null;
        if (input.has("isolationKey")) {
            isolationKey = input.get("isolationKey").asText();
        } else if (config.has("isolationKey")) {
            isolationKey = config.get("isolationKey").asText();
        }

        // Get source info
        String sourceId = input.has("sourceId") ? input.get("sourceId").asText() : null;
        String sourceType = input.has("sourceType") ? input.get("sourceType").asText() : null;

        // Get metadata
        String metadataJson = "{}";
        if (input.has("metadata")) {
            metadataJson = objectMapper.writeValueAsString(input.get("metadata"));
        }

        // Build list of embeddings to store
        List<EmbeddingEntity> embeddings = new ArrayList<>();

        if (input.has("chunks") && input.get("chunks").isArray()) {
            // Multiple chunks with embeddings
            JsonNode chunks = input.get("chunks");
            JsonNode embeddingsArray = input.has("embeddings") ? input.get("embeddings") : null;

            for (int i = 0; i < chunks.size(); i++) {
                JsonNode chunk = chunks.get(i);

                // Get embedding for this chunk
                float[] embedding = null;
                if (chunk.has("embedding") && chunk.get("embedding").isArray()) {
                    embedding = jsonArrayToFloatArray(chunk.get("embedding"));
                } else if (embeddingsArray != null && embeddingsArray.isArray() && i < embeddingsArray.size()) {
                    embedding = jsonArrayToFloatArray(embeddingsArray.get(i));
                }

                if (embedding == null) {
                    LOG.warnf("Chunk %d has no embedding, skipping", i);
                    continue;
                }

                String content = chunk.has("content") ? chunk.get("content").asText() : "";
                int chunkIndex = chunk.has("index") ? chunk.get("index").asInt() : i;
                int tokenCount = chunk.has("tokenCount") ? chunk.get("tokenCount").asInt() : 0;

                EmbeddingEntity entity = new EmbeddingEntity();
                entity.workflowId = workflowId;
                entity.isolationKey = isolationKey;
                entity.collectionName = collectionName;
                entity.content = content;
                entity.embedding = embedding;
                entity.metadata = metadataJson;
                entity.sourceId = sourceId;
                entity.sourceType = sourceType;
                entity.chunkIndex = chunkIndex;
                entity.tokenCount = tokenCount;

                embeddings.add(entity);
            }
        } else if (input.has("embedding") && input.get("embedding").isArray()) {
            // Single embedding
            float[] embedding = jsonArrayToFloatArray(input.get("embedding"));
            String content = input.has("content") ? input.get("content").asText() :
                           input.has("text") ? input.get("text").asText() : "";

            int tokenCount = input.has("tokenCount") ? input.get("tokenCount").asInt() : 0;

            EmbeddingEntity entity = new EmbeddingEntity();
            entity.workflowId = workflowId;
            entity.isolationKey = isolationKey;
            entity.collectionName = collectionName;
            entity.content = content;
            entity.embedding = embedding;
            entity.metadata = metadataJson;
            entity.sourceId = sourceId;
            entity.sourceType = sourceType;
            entity.chunkIndex = 0;
            entity.tokenCount = tokenCount;

            embeddings.add(entity);
        } else {
            return NodeExecutionResult.failure(
                    "No embeddings found in input. Expected 'embedding' array or 'chunks' with embeddings");
        }

        if (embeddings.isEmpty()) {
            return NodeExecutionResult.failure("No valid embeddings to store");
        }

        // Handle upsert - delete existing if replace mode and sourceId provided
        if ("replace".equals(upsertMode) && sourceId != null && !sourceId.isEmpty()) {
            int deleted = vectorStoreService.deleteBySource(workflowId, isolationKey, collectionName, sourceId);
            if (deleted > 0) {
                LOG.debugf("Deleted %d existing embeddings for source '%s' before insert", deleted, sourceId);
            }
        }

        // Store embeddings with metrics
        long storeStart = System.currentTimeMillis();
        List<UUID> storedIds;

        try {
            storedIds = vectorStoreService.storeBatch(embeddings);
            long storeDuration = System.currentTimeMillis() - storeStart;
            ragMetrics.recordVectorsStored(collectionName, storedIds.size(), storeDuration, true);
        } catch (Exception e) {
            long storeDuration = System.currentTimeMillis() - storeStart;
            ragMetrics.recordVectorsStored(collectionName, 0, storeDuration, false);
            throw e;
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("stored", storedIds.size());
        output.put("collection", collectionName);

        ArrayNode idsArray = objectMapper.createArrayNode();
        for (UUID id : storedIds) {
            idsArray.add(id.toString());
        }
        output.set("ids", idsArray);

        if (sourceId != null) {
            output.put("sourceId", sourceId);
        }
        if (isolationKey != null) {
            output.put("isolationKey", isolationKey);
        }

        LOG.infof("Stored %d embeddings in collection '%s' for source '%s'",
                  storedIds.size(), collectionName, sourceId);

        return NodeExecutionResult.success(output);
    }

    private float[] jsonArrayToFloatArray(JsonNode arrayNode) {
        if (arrayNode == null || !arrayNode.isArray()) {
            return null;
        }
        float[] result = new float[arrayNode.size()];
        for (int i = 0; i < arrayNode.size(); i++) {
            result[i] = (float) arrayNode.get(i).asDouble();
        }
        return result;
    }
}
