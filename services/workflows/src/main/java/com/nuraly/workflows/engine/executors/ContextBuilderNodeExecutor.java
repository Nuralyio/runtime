package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * CONTEXT_BUILDER Node Executor - Formats retrieved documents into LLM-ready context.
 *
 * Node Configuration:
 * {
 *   "template": "default" | "numbered" | "markdown" | "xml" | "custom",
 *   "customTemplate": "Document {{index}}: {{content}}\n---\n",  // For custom template
 *   "maxTokens": 4000,                    // Max tokens for context (approximate)
 *   "maxDocuments": 10,                   // Max number of documents to include
 *   "includeSourceInfo": true,            // Include source metadata
 *   "includeSimilarityScore": false,      // Include similarity scores
 *   "separator": "\n\n---\n\n",           // Separator between documents
 *   "header": "Relevant context:\n\n",    // Optional header
 *   "footer": ""                          // Optional footer
 * }
 *
 * Input (from VECTOR_SEARCH):
 *   {
 *     "results": [
 *       { "content": "...", "score": 0.92, "sourceId": "doc.pdf", ... },
 *       ...
 *     ],
 *     "query": "What is the return policy?"
 *   }
 *
 * Output:
 *   {
 *     "context": "Relevant context:\n\n[1] Our return policy allows...\n\n---\n\n[2] ...",
 *     "documentsUsed": 5,
 *     "estimatedTokens": 1250,
 *     "query": "What is the return policy?",
 *     "sources": ["doc1.pdf", "doc2.pdf"]
 *   }
 */
@ApplicationScoped
public class ContextBuilderNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(ContextBuilderNodeExecutor.class);
    private static final int DEFAULT_MAX_TOKENS = 4000;
    private static final int DEFAULT_MAX_DOCUMENTS = 10;
    private static final double CHARS_PER_TOKEN = 4.0;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.CONTEXT_BUILDER;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        JsonNode config = node.configuration != null
                ? objectMapper.readTree(node.configuration)
                : objectMapper.createObjectNode();
        JsonNode input = context.getInput();

        // Get results from input
        if (!input.has("results") || !input.get("results").isArray()) {
            return NodeExecutionResult.failure(
                    "Input must contain 'results' array (from VECTOR_SEARCH node)");
        }
        JsonNode results = input.get("results");

        if (results.isEmpty()) {
            // No results - return empty context
            ObjectNode output = objectMapper.createObjectNode();
            output.put("context", "");
            output.put("documentsUsed", 0);
            output.put("estimatedTokens", 0);
            if (input.has("query")) {
                output.put("query", input.get("query").asText());
            }
            output.set("sources", objectMapper.createArrayNode());
            return NodeExecutionResult.success(output);
        }

        // Get configuration
        String template = config.has("template") ? config.get("template").asText() : "default";
        String customTemplate = config.has("customTemplate") ? config.get("customTemplate").asText() : null;
        int maxTokens = config.has("maxTokens") ? config.get("maxTokens").asInt() : DEFAULT_MAX_TOKENS;
        int maxDocuments = config.has("maxDocuments") ? config.get("maxDocuments").asInt() : DEFAULT_MAX_DOCUMENTS;
        boolean includeSourceInfo = !config.has("includeSourceInfo") || config.get("includeSourceInfo").asBoolean();
        boolean includeScore = config.has("includeSimilarityScore") && config.get("includeSimilarityScore").asBoolean();
        String separator = config.has("separator") ? config.get("separator").asText() : "\n\n---\n\n";
        String header = config.has("header") ? config.get("header").asText() : "";
        String footer = config.has("footer") ? config.get("footer").asText() : "";

        // Build context
        StringBuilder contextBuilder = new StringBuilder();
        List<String> sources = new ArrayList<>();
        int documentsUsed = 0;
        int estimatedTokens = 0;
        int maxChars = (int) (maxTokens * CHARS_PER_TOKEN);

        // Add header
        if (!header.isEmpty()) {
            contextBuilder.append(header);
            estimatedTokens += estimateTokens(header);
        }

        for (int i = 0; i < results.size() && documentsUsed < maxDocuments; i++) {
            JsonNode result = results.get(i);

            if (!result.has("content")) {
                continue;
            }

            String content = result.get("content").asText();
            String sourceId = result.has("sourceId") ? result.get("sourceId").asText() : null;
            double score = result.has("score") ? result.get("score").asDouble() : 0;

            // Format document based on template
            String formattedDoc = formatDocument(
                    template, customTemplate, content, i + 1,
                    sourceId, score, includeSourceInfo, includeScore
            );

            // Check token limit
            int docTokens = estimateTokens(formattedDoc);
            if (estimatedTokens + docTokens > maxTokens && documentsUsed > 0) {
                // Would exceed limit, stop adding documents
                break;
            }

            // Add separator if not first document
            if (documentsUsed > 0) {
                contextBuilder.append(separator);
            }

            contextBuilder.append(formattedDoc);
            estimatedTokens += docTokens;
            documentsUsed++;

            if (sourceId != null && !sources.contains(sourceId)) {
                sources.add(sourceId);
            }
        }

        // Add footer
        if (!footer.isEmpty()) {
            contextBuilder.append(footer);
            estimatedTokens += estimateTokens(footer);
        }

        // Build output
        ObjectNode output = objectMapper.createObjectNode();
        output.put("context", contextBuilder.toString());
        output.put("documentsUsed", documentsUsed);
        output.put("estimatedTokens", estimatedTokens);
        output.put("totalResults", results.size());

        if (input.has("query")) {
            output.put("query", input.get("query").asText());
        }

        ArrayNode sourcesArray = objectMapper.createArrayNode();
        sources.forEach(sourcesArray::add);
        output.set("sources", sourcesArray);

        // Pass through isolation key
        if (input.has("isolationKey")) {
            output.put("isolationKey", input.get("isolationKey").asText());
        }

        LOG.debugf("Built context with %d documents (~%d tokens) from %d results",
                   documentsUsed, estimatedTokens, results.size());

        return NodeExecutionResult.success(output);
    }

    /**
     * Format a document according to the selected template.
     */
    private String formatDocument(String template, String customTemplate,
                                   String content, int index,
                                   String sourceId, double score,
                                   boolean includeSourceInfo, boolean includeScore) {

        return switch (template.toLowerCase()) {
            case "numbered" -> formatNumbered(content, index, sourceId, score, includeSourceInfo, includeScore);
            case "markdown" -> formatMarkdown(content, index, sourceId, score, includeSourceInfo, includeScore);
            case "xml" -> formatXml(content, index, sourceId, score, includeSourceInfo, includeScore);
            case "custom" -> formatCustom(customTemplate, content, index, sourceId, score);
            default -> formatDefault(content, index, sourceId, score, includeSourceInfo, includeScore);
        };
    }

    private String formatDefault(String content, int index, String sourceId, double score,
                                  boolean includeSourceInfo, boolean includeScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(index).append("] ");
        sb.append(content.trim());

        if (includeSourceInfo && sourceId != null) {
            sb.append("\n(Source: ").append(sourceId).append(")");
        }
        if (includeScore) {
            sb.append(" [Score: ").append(String.format("%.2f", score)).append("]");
        }

        return sb.toString();
    }

    private String formatNumbered(String content, int index, String sourceId, double score,
                                   boolean includeSourceInfo, boolean includeScore) {
        StringBuilder sb = new StringBuilder();
        sb.append(index).append(". ").append(content.trim());

        List<String> annotations = new ArrayList<>();
        if (includeSourceInfo && sourceId != null) {
            annotations.add("Source: " + sourceId);
        }
        if (includeScore) {
            annotations.add("Score: " + String.format("%.2f", score));
        }

        if (!annotations.isEmpty()) {
            sb.append("\n   [").append(String.join(", ", annotations)).append("]");
        }

        return sb.toString();
    }

    private String formatMarkdown(String content, int index, String sourceId, double score,
                                   boolean includeSourceInfo, boolean includeScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Document ").append(index).append("\n\n");
        sb.append(content.trim()).append("\n");

        if (includeSourceInfo && sourceId != null) {
            sb.append("\n*Source: ").append(sourceId).append("*");
        }
        if (includeScore) {
            sb.append(" *(Relevance: ").append(String.format("%.0f%%", score * 100)).append(")*");
        }

        return sb.toString();
    }

    private String formatXml(String content, int index, String sourceId, double score,
                              boolean includeSourceInfo, boolean includeScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("<document index=\"").append(index).append("\"");

        if (includeSourceInfo && sourceId != null) {
            sb.append(" source=\"").append(escapeXml(sourceId)).append("\"");
        }
        if (includeScore) {
            sb.append(" score=\"").append(String.format("%.2f", score)).append("\"");
        }

        sb.append(">\n");
        sb.append(escapeXml(content.trim()));
        sb.append("\n</document>");

        return sb.toString();
    }

    private String formatCustom(String template, String content, int index, String sourceId, double score) {
        if (template == null || template.isEmpty()) {
            return content;
        }

        return template
                .replace("{{index}}", String.valueOf(index))
                .replace("{{content}}", content.trim())
                .replace("{{sourceId}}", sourceId != null ? sourceId : "")
                .replace("{{score}}", String.format("%.2f", score))
                .replace("{{scorePercent}}", String.format("%.0f", score * 100));
    }

    private String escapeXml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private int estimateTokens(String text) {
        if (text == null || text.isEmpty()) return 0;
        return (int) Math.ceil(text.length() / CHARS_PER_TOKEN);
    }
}
