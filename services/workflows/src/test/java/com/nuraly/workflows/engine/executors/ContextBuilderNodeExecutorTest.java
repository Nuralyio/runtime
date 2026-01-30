package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ContextBuilderNodeExecutorTest {

    private ContextBuilderNodeExecutor executor;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        executor = new ContextBuilderNodeExecutor();
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.CONTEXT_BUILDER, executor.getType());
    }

    @Test
    void testEmptyResults() throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.set("results", objectMapper.createArrayNode());
        input.put("query", "test query");

        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();
        assertEquals("", output.get("context").asText());
        assertEquals(0, output.get("documentsUsed").asInt());
        assertEquals("test query", output.get("query").asText());
    }

    @Test
    void testDefaultTemplate() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"template\": \"default\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode output = result.getOutput();

        String contextText = output.get("context").asText();
        assertTrue(contextText.contains("[1]"));
        assertTrue(contextText.contains("First document content"));
        assertTrue(contextText.contains("(Source: doc1.pdf)"));
        assertEquals(2, output.get("documentsUsed").asInt());
    }

    @Test
    void testNumberedTemplate() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"template\": \"numbered\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("1. First document"));
        assertTrue(contextText.contains("2. Second document"));
    }

    @Test
    void testMarkdownTemplate() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"template\": \"markdown\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("### Document 1"));
        assertTrue(contextText.contains("### Document 2"));
        assertTrue(contextText.contains("*Source:"));
    }

    @Test
    void testXmlTemplate() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"template\": \"xml\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("<document index=\"1\""));
        assertTrue(contextText.contains("</document>"));
        assertTrue(contextText.contains("source=\"doc1.pdf\""));
    }

    @Test
    void testCustomTemplate() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode(
                "{\"template\": \"custom\", \"customTemplate\": \"DOC-{{index}}: {{content}}\\n\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("DOC-1:"));
        assertTrue(contextText.contains("DOC-2:"));
    }

    @Test
    void testMaxDocumentsLimit() throws Exception {
        ObjectNode input = createManySearchResults(10);
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"maxDocuments\": 3}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals(3, result.getOutput().get("documentsUsed").asInt());
        assertEquals(10, result.getOutput().get("totalResults").asInt());
    }

    @Test
    void testMaxTokensLimit() throws Exception {
        // Create results with long content
        ArrayNode results = objectMapper.createArrayNode();
        for (int i = 0; i < 10; i++) {
            ObjectNode doc = objectMapper.createObjectNode();
            doc.put("content", "A".repeat(1000)); // ~250 tokens each
            doc.put("score", 0.9);
            results.add(doc);
        }

        ObjectNode input = objectMapper.createObjectNode();
        input.set("results", results);

        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"maxTokens\": 500}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        // Should stop before using all 10 documents due to token limit
        assertTrue(result.getOutput().get("documentsUsed").asInt() < 10);
    }

    @Test
    void testIncludeSimilarityScore() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"includeSimilarityScore\": true}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("Score:") || contextText.contains("0.9"));
    }

    @Test
    void testExcludeSourceInfo() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"includeSourceInfo\": false}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertFalse(contextText.contains("Source:"));
        assertFalse(contextText.contains("doc1.pdf"));
    }

    @Test
    void testCustomSeparator() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{\"separator\": \"\\n===\\n\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.contains("==="));
    }

    @Test
    void testHeaderAndFooter() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode(
                "{\"header\": \"BEGIN CONTEXT\\n\", \"footer\": \"\\nEND CONTEXT\"}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        String contextText = result.getOutput().get("context").asText();
        assertTrue(contextText.startsWith("BEGIN CONTEXT"));
        assertTrue(contextText.endsWith("END CONTEXT"));
    }

    @Test
    void testSourcesCollection() throws Exception {
        ObjectNode input = createSearchResults();
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        JsonNode sources = result.getOutput().get("sources");
        assertTrue(sources.isArray());
        assertEquals(2, sources.size());
    }

    @Test
    void testPassThroughIsolationKey() throws Exception {
        ObjectNode input = createSearchResults();
        input.put("isolationKey", "user-123");
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{}");

        NodeExecutionResult result = executor.execute(context, node);

        assertTrue(result.isSuccess());
        assertEquals("user-123", result.getOutput().get("isolationKey").asText());
    }

    @Test
    void testMissingResultsArray() throws Exception {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("query", "test");
        ExecutionContext context = createContext(input);
        WorkflowNodeEntity node = createNode("{}");

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getMessage().contains("results"));
    }

    // Helper methods

    private ObjectNode createSearchResults() {
        ArrayNode results = objectMapper.createArrayNode();

        ObjectNode doc1 = objectMapper.createObjectNode();
        doc1.put("content", "First document content here.");
        doc1.put("score", 0.95);
        doc1.put("sourceId", "doc1.pdf");
        doc1.put("sourceType", "pdf");
        results.add(doc1);

        ObjectNode doc2 = objectMapper.createObjectNode();
        doc2.put("content", "Second document content here.");
        doc2.put("score", 0.88);
        doc2.put("sourceId", "doc2.txt");
        doc2.put("sourceType", "txt");
        results.add(doc2);

        ObjectNode input = objectMapper.createObjectNode();
        input.set("results", results);
        input.put("query", "test query");

        return input;
    }

    private ObjectNode createManySearchResults(int count) {
        ArrayNode results = objectMapper.createArrayNode();

        for (int i = 0; i < count; i++) {
            ObjectNode doc = objectMapper.createObjectNode();
            doc.put("content", "Document " + (i + 1) + " content.");
            doc.put("score", 0.9 - (i * 0.05));
            doc.put("sourceId", "doc" + (i + 1) + ".pdf");
            results.add(doc);
        }

        ObjectNode input = objectMapper.createObjectNode();
        input.set("results", results);

        return input;
    }

    private ExecutionContext createContext(JsonNode input) {
        // Create minimal execution entity for testing
        com.nuraly.workflows.entity.WorkflowExecutionEntity execution =
                new com.nuraly.workflows.entity.WorkflowExecutionEntity();
        try {
            execution.inputData = objectMapper.writeValueAsString(input);
        } catch (Exception e) {
            execution.inputData = "{}";
        }
        return new ExecutionContext(execution);
    }

    private WorkflowNodeEntity createNode(String configuration) {
        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.configuration = configuration;
        return node;
    }
}
