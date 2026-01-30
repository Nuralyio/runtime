package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.document.TextSplitter;
import com.nuraly.workflows.document.splitters.RecursiveCharacterTextSplitter;
import com.nuraly.workflows.document.splitters.SentenceTextSplitter;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

/**
 * TEXT_SPLITTER Node Executor - Splits text into chunks for embedding.
 *
 * Node Configuration:
 * {
 *   "strategy": "recursive" | "sentence",  // Splitting strategy
 *   "chunkSize": 1000,                      // Target chunk size in characters
 *   "chunkOverlap": 200,                    // Overlap between chunks
 *   "contentField": "content"               // Field containing text to split
 * }
 *
 * Input (from DOCUMENT_LOADER or direct):
 *   {
 *     "content": "Long text to split...",
 *     "sourceId": "document.pdf",
 *     "sourceType": "pdf",
 *     "metadata": { ... }
 *   }
 *
 * Output:
 *   {
 *     "chunks": [
 *       { "content": "First chunk...", "index": 0, "tokenCount": 250 },
 *       { "content": "Second chunk...", "index": 1, "tokenCount": 245 }
 *     ],
 *     "chunkCount": 2,
 *     "totalCharacters": 2000,
 *     "sourceId": "document.pdf",
 *     "sourceType": "pdf",
 *     "metadata": { ... }
 *   }
 */
@ApplicationScoped
public class TextSplitterNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(TextSplitterNodeExecutor.class);
    private static final int DEFAULT_CHUNK_SIZE = 1000;
    private static final int DEFAULT_CHUNK_OVERLAP = 200;

    @Inject
    RecursiveCharacterTextSplitter recursiveSplitter;

    @Inject
    SentenceTextSplitter sentenceSplitter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.TEXT_SPLITTER;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode config = node.configuration != null
                ? objectMapper.readTree(node.configuration)
                : objectMapper.createObjectNode();
        JsonNode input = context.getInput();

        // Get configuration
        String strategy = config.has("strategy") ? config.get("strategy").asText() : "recursive";
        int chunkSize = config.has("chunkSize") ? config.get("chunkSize").asInt() : DEFAULT_CHUNK_SIZE;
        int chunkOverlap = config.has("chunkOverlap") ? config.get("chunkOverlap").asInt() : DEFAULT_CHUNK_OVERLAP;
        String contentField = config.has("contentField") ? config.get("contentField").asText() : "content";

        // Validate overlap
        if (chunkOverlap >= chunkSize) {
            return NodeExecutionResult.failure("chunkOverlap (" + chunkOverlap +
                    ") must be less than chunkSize (" + chunkSize + ")");
        }

        // Get content to split
        if (!input.has(contentField) || !input.get(contentField).isTextual()) {
            return NodeExecutionResult.failure("Content field '" + contentField + "' not found or not a string");
        }
        String content = input.get(contentField).asText();

        if (content.isEmpty()) {
            return NodeExecutionResult.failure("Content is empty, nothing to split");
        }

        // Select splitter
        TextSplitter splitter = switch (strategy.toLowerCase()) {
            case "sentence" -> sentenceSplitter;
            case "recursive" -> recursiveSplitter;
            default -> {
                LOG.warnf("Unknown splitting strategy '%s', using recursive", strategy);
                yield recursiveSplitter;
            }
        };

        // Split the text
        List<TextSplitter.TextChunk> chunks = splitter.split(content, chunkSize, chunkOverlap);

        // Build output
        ObjectNode output = objectMapper.createObjectNode();

        ArrayNode chunksArray = objectMapper.createArrayNode();
        for (TextSplitter.TextChunk chunk : chunks) {
            ObjectNode chunkNode = objectMapper.createObjectNode();
            chunkNode.put("content", chunk.getContent());
            chunkNode.put("index", chunk.getIndex());
            chunkNode.put("startOffset", chunk.getStartOffset());
            chunkNode.put("endOffset", chunk.getEndOffset());
            chunkNode.put("length", chunk.getLength());
            chunkNode.put("tokenCount", TextSplitter.estimateTokenCount(chunk.getContent()));
            chunksArray.add(chunkNode);
        }
        output.set("chunks", chunksArray);

        output.put("chunkCount", chunks.size());
        output.put("totalCharacters", content.length());
        output.put("strategy", strategy);
        output.put("chunkSize", chunkSize);
        output.put("chunkOverlap", chunkOverlap);

        // Pass through source info
        if (input.has("sourceId")) {
            output.put("sourceId", input.get("sourceId").asText());
        }
        if (input.has("sourceType")) {
            output.put("sourceType", input.get("sourceType").asText());
        }

        // Pass through metadata
        if (input.has("metadata")) {
            output.set("metadata", input.get("metadata").deepCopy());
        }

        // Pass through isolation key
        if (input.has("isolationKey")) {
            output.put("isolationKey", input.get("isolationKey").asText());
        } else if (config.has("isolationKey")) {
            output.put("isolationKey", config.get("isolationKey").asText());
        }

        LOG.debugf("Split text into %d chunks (strategy=%s, chunkSize=%d, overlap=%d)",
                   chunks.size(), strategy, chunkSize, chunkOverlap);

        return NodeExecutionResult.success(output);
    }
}
