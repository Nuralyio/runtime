package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.engine.memory.ContextMemoryStore;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.service.WorkflowEventService;
import com.nuraly.workflows.triggers.connectors.McpConnection;
import com.nuraly.workflows.triggers.connectors.McpConnector;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Agent Node Executor - Executes AI agent logic using connected config nodes.
 *
 * <h2>Workflow Setup</h2>
 * <pre>
 *   TELEGRAM_BOT / START / CHAT_START
 *           │
 *           ▼ (in)
 *       ┌─────────┐
 *       │  AGENT   │◄── LLM node (llm config port, required, type AGENT_LLM)
 *       │          │◄── Prompt node (prompt config port, optional)
 *       │          │◄── Memory node (memory config port, optional)
 *       │          │◄── Tool nodes (tools config port, optional, multiple)
 *       └────┬─────┘
 *            │ (out)
 *            ▼
 *   TELEGRAM_SEND / END / CHAT_OUTPUT
 * </pre>
 *
 * <h2>Port Types</h2>
 * <b>Input ports</b> (left side - data flow):
 * <ul>
 *   <li>{@code in} - User prompt/message from trigger or previous node</li>
 *   <li>{@code retriever} - RAG context (optional, from Context Builder / Vector Search)</li>
 * </ul>
 * <b>Config ports</b> (bottom - configuration nodes, not part of data flow):
 * <ul>
 *   <li>{@code llm} - Connected LLM node (required, type AGENT_LLM) - provides provider, model, API key</li>
 *   <li>{@code prompt} - Connected Prompt node (optional) - system prompt template.
 *       If no user message arrives on the 'in' port, the prompt template is used as the user message.</li>
 *   <li>{@code memory} - Connected Memory node (optional) - conversation history</li>
 *   <li>{@code tools} - Connected Tool nodes (optional, multiple) - function calling tools</li>
 * </ul>
 *
 * <h2>User Message Resolution</h2>
 * The agent extracts the user message in this order:
 * <ol>
 *   <li>Context input fields: {@code prompt}, {@code message}, {@code query}, {@code text}, {@code input}</li>
 *   <li>Output from the node connected to the 'in' port (same fields)</li>
 *   <li>Nested Telegram structure: {@code message.text}</li>
 *   <li>Query from connected retriever node</li>
 *   <li>Fallback: connected Prompt node template (used as user message when no input on 'in' port)</li>
 * </ol>
 *
 * <h2>LLM Node (AGENT_LLM)</h2>
 * The LLM config node (type {@code AGENT_LLM}) must have:
 * <ul>
 *   <li>{@code provider} - LLM provider (openai, anthropic, ollama, etc.)</li>
 *   <li>{@code apiKeyPath} - KV store path for the API key (e.g. "openai/prod")</li>
 *   <li>{@code model} - Model name (e.g. "gpt-4")</li>
 * </ul>
 * The KV store resolves the API key using the workflow's applicationId,
 * falling back to {@code _standalone} for workflows without an application.
 *
 * <h2>Node Configuration</h2>
 * <pre>
 * {
 *   "agentId": "my-agent",
 *   "maxIterations": 10
 * }
 * </pre>
 */
@ApplicationScoped
public class AgentNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(AgentNodeExecutor.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SCHEMA = "schema";
    private static final String STRICT = "strict";
    private static final String TOOLS = "tools";
    private static final String SYSTEM_PROMPT = "systemPrompt";
    private static final String PROVIDER = "provider";
    private static final String MODEL = "model";
    private static final String QUERY = "query";
    private static final String MESSAGE = "message";
    private static final String CONTENT = "content";
    private static final String MAX_TOKENS = "maxTokens";
    private static final String PROMPT = "prompt";
    private static final String RESULTS = "results";

    // Accepted port names for memory/context connection
    private static final List<String> MEMORY_PORTS = Arrays.asList(
        "memory", "context", "context_memory"
    );

    @Inject
    LlmNodeExecutor llmExecutor;

    @Inject
    ToolNodeExecutor toolExecutor;

    @Inject
    WorkflowEventService eventService;

    @Inject
    ContextMemoryStore contextMemoryStore;

    @Inject
    McpConnector mcpConnector;

    @Override
    public NodeType getType() {
        return NodeType.AGENT;
    }

    // --- Inner static helper classes for multi-value returns ---

    /**
     * Holds RAG context data resolved from a retriever node.
     */
    private static class RagResult {
        final String context;
        final String retrieverQuery;

        RagResult(String context, String retrieverQuery) {
            this.context = context;
            this.retrieverQuery = retrieverQuery;
        }
    }

    /**
     * Holds the resolved user message and (possibly updated) system prompt.
     */
    private static class UserMessageResult {
        final String userMessage;
        final String systemPrompt;

        UserMessageResult(String userMessage, String systemPrompt) {
            this.userMessage = userMessage;
            this.systemPrompt = systemPrompt;
        }
    }

    /**
     * Holds memory loading results: conversation ID and history.
     */
    private static class MemoryResult {
        final String conversationId;
        final List<LlmMessage> conversationHistory;

        MemoryResult(String conversationId, List<LlmMessage> conversationHistory) {
            this.conversationId = conversationId;
            this.conversationHistory = conversationHistory;
        }
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        LOG.infof("Executing agent node: %s", node.name);

        // Find the connected LLM node
        WorkflowNodeEntity llmNode = findConnectedNode(node, "llm");
        if (llmNode == null) {
            return NodeExecutionResult.failure("Agent requires a connected LLM node. Connect an LLM node to the 'llm' input port.");
        }
        if (llmNode.type != NodeType.LLM && llmNode.type != NodeType.AGENT_LLM) {
            return NodeExecutionResult.failure("The node connected to 'llm' port must be an LLM node, got: " + llmNode.type);
        }

        // Find connected config nodes
        WorkflowNodeEntity promptNode = findConnectedNode(node, PROMPT);
        WorkflowNodeEntity memoryNode = findConnectedMemoryNode(node);
        WorkflowNodeEntity structuredOutputNode = findConnectedNode(node, "structured_output");
        List<WorkflowNodeEntity> toolNodes = findConnectedNodes(node, TOOLS);
        LOG.infof("Agent '%s': found %d tool nodes, edges count: %d",
            node.name, toolNodes.size(),
            node.workflow != null && node.workflow.edges != null ? node.workflow.edges.size() : -1);

        // Parse configurations
        JsonNode agentConfig = parseConfiguration(node.configuration);
        JsonNode llmConfig = parseConfiguration(llmNode.configuration);

        // Build merged LLM config
        ObjectNode mergedConfig = buildMergedLlmConfig(llmConfig, agentConfig);

        // Resolve system prompt
        String systemPrompt = resolveSystemPrompt(promptNode, llmConfig);

        // Resolve RAG context
        RagResult ragResult = resolveRagContext(node, context);

        // Resolve user message (may clear systemPrompt if used as fallback)
        UserMessageResult userMsgResult = resolveUserMessage(context, node, ragResult.retrieverQuery, systemPrompt);
        String userMessage = userMsgResult.userMessage;
        systemPrompt = userMsgResult.systemPrompt;

        // Ensure the input has the query so LLM executor can find it
        ensureInputHasQuery(context, userMessage);

        // Inject RAG context into system prompt
        systemPrompt = injectRagContext(systemPrompt, ragResult.context);

        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            mergedConfig.put(SYSTEM_PROMPT, systemPrompt);
        }

        // Build tools array from connected Tool nodes
        ArrayNode toolsArray = buildToolsArray(llmConfig, toolNodes, context, node);
        if (toolsArray.size() > 0) {
            mergedConfig.set(TOOLS, toolsArray);
            LOG.debugf("Agent has %d tools available", toolsArray.size());
        }

        // Load memory / conversation history
        MemoryResult memoryResult = loadMemoryHistory(memoryNode, context);
        if (memoryResult != null && !memoryResult.conversationHistory.isEmpty()) {
            mergedConfig.set("conversationHistory", buildHistoryArray(memoryResult.conversationHistory));
        }

        // Build structured output config
        JsonNode responseFormat = buildStructuredOutputConfig(structuredOutputNode);
        if (responseFormat != null) {
            mergedConfig.set("responseFormat", responseFormat);
        }

        // Execute LLM
        NodeExecutionResult llmResult = executeLlmCall(context, node, llmNode, llmConfig, mergedConfig);
        if (!llmResult.isSuccess()) {
            return llmResult;
        }

        // Save conversation messages to memory
        String conversationId = memoryResult != null ? memoryResult.conversationId : null;
        saveConversationMessages(memoryNode, conversationId, userMessage, llmResult);

        // Build and return agent output
        return buildAgentOutput(llmResult, agentConfig, llmNode, memoryNode);
    }

    // --- Private helper methods ---

    /**
     * Parse a JSON configuration string, returning an empty ObjectNode if null.
     */
    private JsonNode parseConfiguration(String configuration) throws com.fasterxml.jackson.core.JsonProcessingException {
        return configuration != null
            ? objectMapper.readTree(configuration)
            : objectMapper.createObjectNode();
    }

    /**
     * Build the merged LLM configuration by copying LLM config fields and agent settings.
     */
    private ObjectNode buildMergedLlmConfig(JsonNode llmConfig, JsonNode agentConfig) {
        ObjectNode mergedConfig = objectMapper.createObjectNode();

        // Copy LLM config (provider, apiKeyPath, apiUrlPath, model, temperature, maxTokens)
        copyStringField(mergedConfig, llmConfig, PROVIDER);
        copyStringField(mergedConfig, llmConfig, "apiKeyPath");
        copyStringField(mergedConfig, llmConfig, "apiUrlPath");
        copyStringField(mergedConfig, llmConfig, MODEL);
        if (llmConfig.has("temperature")) mergedConfig.put("temperature", llmConfig.get("temperature").asDouble());
        if (llmConfig.has(MAX_TOKENS)) mergedConfig.put(MAX_TOKENS, llmConfig.get(MAX_TOKENS).asInt());

        // Set max iterations from agent config
        if (agentConfig.has("maxIterations")) {
            mergedConfig.put("maxToolIterations", agentConfig.get("maxIterations").asInt());
        }

        return mergedConfig;
    }

    /**
     * Copy a string field from source to target if it exists.
     */
    private void copyStringField(ObjectNode target, JsonNode source, String fieldName) {
        if (source.has(fieldName)) {
            target.put(fieldName, source.get(fieldName).asText());
        }
    }

    /**
     * Resolve system prompt from Prompt node configuration, with fallback to LLM config.
     */
    private String resolveSystemPrompt(WorkflowNodeEntity promptNode, JsonNode llmConfig) throws com.fasterxml.jackson.core.JsonProcessingException {
        String systemPrompt = null;

        if (promptNode != null) {
            JsonNode promptConfig = parseConfiguration(promptNode.configuration);

            if (promptConfig.has("template")) {
                systemPrompt = promptConfig.get("template").asText();
            } else if (promptConfig.has(PROMPT)) {
                systemPrompt = promptConfig.get(PROMPT).asText();
            } else if (promptConfig.has(SYSTEM_PROMPT)) {
                systemPrompt = promptConfig.get(SYSTEM_PROMPT).asText();
            }
            LOG.debugf("Using system prompt from connected Prompt node: %s", promptNode.name);
        }

        // Fallback to LLM config system prompt
        if ((systemPrompt == null || systemPrompt.isEmpty()) && llmConfig.has(SYSTEM_PROMPT)) {
            systemPrompt = llmConfig.get(SYSTEM_PROMPT).asText();
        }

        return systemPrompt;
    }

    /**
     * Resolve RAG context and retriever query from the retriever node and input fallback.
     */
    private RagResult resolveRagContext(WorkflowNodeEntity node, ExecutionContext context) {
        String ragContext = null;
        String retrieverQuery = null;

        WorkflowNodeEntity retrieverNode = findConnectedNode(node, "retriever");
        if (retrieverNode != null) {
            JsonNode retrieverOutput = context.getNodeOutput(retrieverNode.id);
            if (retrieverOutput != null) {
                ragContext = extractRagContext(retrieverOutput);
                LOG.debugf("Got RAG context from retriever node '%s': %d chars",
                           retrieverNode.name, ragContext != null ? ragContext.length() : 0);

                retrieverQuery = extractRetrieverQuery(retrieverOutput);
            }
        }

        // Fallback: check input for context (if Context Builder connected to 'in' port)
        if (ragContext == null || ragContext.isEmpty()) {
            ragContext = extractRagContext(context.getInput());
        }

        return new RagResult(ragContext, retrieverQuery);
    }

    /**
     * Extract the original query from retriever output.
     */
    private String extractRetrieverQuery(JsonNode retrieverOutput) {
        if (retrieverOutput.has(QUERY)) {
            return retrieverOutput.get(QUERY).asText();
        }
        if (retrieverOutput.has(MESSAGE)) {
            return retrieverOutput.get(MESSAGE).asText();
        }
        return null;
    }

    /**
     * Resolve user message from multiple sources with fallback chain.
     * May consume systemPrompt as user message if no other source is found.
     */
    private UserMessageResult resolveUserMessage(
            ExecutionContext context, WorkflowNodeEntity node,
            String retrieverQuery, String systemPrompt) {

        // Try context input first
        String userMessage = extractUserPrompt(context);

        // If not found, check the "in" port source node output
        if (userMessage == null || userMessage.isEmpty()) {
            userMessage = extractUserMessageFromInPort(node, context);
        }

        // Fallback: use query from retriever
        if ((userMessage == null || userMessage.isEmpty()) && retrieverQuery != null) {
            userMessage = retrieverQuery;
            LOG.debugf("Using query from retriever as user message: %s", userMessage);
        }

        // Fallback: use connected Prompt node template as user message
        if ((userMessage == null || userMessage.isEmpty()) && systemPrompt != null && !systemPrompt.isEmpty()) {
            userMessage = systemPrompt;
            systemPrompt = null; // Avoid duplicating as both system and user message
            LOG.debugf("Using Prompt node template as user message (no input on 'in' port)");
        }

        return new UserMessageResult(userMessage, systemPrompt);
    }

    /**
     * Try to extract user message from the node connected to the 'in' port.
     */
    private String extractUserMessageFromInPort(WorkflowNodeEntity node, ExecutionContext context) {
        WorkflowNodeEntity inPortNode = findConnectedNode(node, "in");
        if (inPortNode == null) {
            return null;
        }
        JsonNode inPortOutput = context.getNodeOutput(inPortNode.id);
        if (inPortOutput == null) {
            return null;
        }
        String userMessage = extractUserPromptFromJson(inPortOutput);
        if (userMessage != null && !userMessage.isEmpty()) {
            LOG.debugf("Found user message from 'in' port source node: %s", inPortNode.name);
        }
        return userMessage;
    }

    /**
     * Ensure the execution context input contains the query for the LLM executor.
     */
    private void ensureInputHasQuery(ExecutionContext context, String userMessage) {
        if (userMessage == null || userMessage.isEmpty()) {
            return;
        }
        JsonNode currentInput = context.getInput();
        if (currentInput == null || currentInput.isNull() || currentInput.isEmpty()) {
            ObjectNode newInput = objectMapper.createObjectNode();
            newInput.put(QUERY, userMessage);
            context.setInput(newInput);
        } else if (currentInput.isObject()) {
            ((ObjectNode) currentInput).put(QUERY, userMessage);
        }
    }

    /**
     * Inject RAG context into the system prompt.
     */
    private String injectRagContext(String systemPrompt, String ragContext) {
        if (ragContext == null || ragContext.isEmpty()) {
            return systemPrompt;
        }

        String result;
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            result = systemPrompt + "\n\n## Retrieved Context\n\n" + ragContext +
                     "\n\n## Instructions\n\nUse the above context to answer the user's question. " +
                     "If the context doesn't contain relevant information, say so.";
        } else {
            result = "You are a helpful assistant. Use the following context to answer the user's question.\n\n" +
                     "## Retrieved Context\n\n" + ragContext +
                     "\n\n## Instructions\n\nAnswer based on the above context. " +
                     "If the context doesn't contain relevant information, say so.";
        }
        LOG.debugf("Injected RAG context into system prompt (%d chars)", ragContext.length());
        return result;
    }

    /**
     * Build the tools array from LLM config tools and connected Tool nodes.
     */
    private ArrayNode buildToolsArray(
            JsonNode llmConfig, List<WorkflowNodeEntity> toolNodes,
            ExecutionContext context, WorkflowNodeEntity node) {

        ArrayNode toolsArray = objectMapper.createArrayNode();

        // Copy tools from LLM config if present
        if (llmConfig.has(TOOLS) && llmConfig.get(TOOLS).isArray()) {
            for (JsonNode tool : llmConfig.get(TOOLS)) {
                toolsArray.add(tool);
            }
        }

        // Add tools from connected Tool/MCP nodes
        for (WorkflowNodeEntity toolNode : toolNodes) {
            addToolFromNode(toolsArray, toolNode, context, node);
        }

        return toolsArray;
    }

    /**
     * Process a single tool node and add its definition to the tools array.
     */
    private void addToolFromNode(
            ArrayNode toolsArray, WorkflowNodeEntity toolNode,
            ExecutionContext context, WorkflowNodeEntity node) {

        if (toolNode.type == NodeType.MCP) {
            addMcpToolsFromNode(toolsArray, toolNode);
            return;
        }

        if (toolNode.type != NodeType.TOOL) {
            LOG.warnf("Node connected to 'tools' port is not a Tool/MCP node: %s (%s)", toolNode.name, toolNode.type);
            return;
        }

        try {
            emitToolCallStarted(context, node, toolNode);

            NodeExecutionResult toolResult = toolExecutor.execute(context, toolNode);
            boolean success = toolResult.isSuccess() && toolResult.getOutput() != null;

            emitToolCallCompleted(context, node, toolNode, success);

            if (success) {
                toolsArray.add(toolResult.getOutput());
                LOG.debugf("Added tool from connected node: %s", toolNode.name);
            } else {
                LOG.warnf("Failed to get tool definition from node: %s", toolNode.name);
            }
        } catch (Exception e) {
            LOG.errorf("Error processing Tool node %s: %s", toolNode.name, e.getMessage());
        }
    }

    /**
     * Discover and add tools from an MCP node's persistent connection.
     */
    private void addMcpToolsFromNode(ArrayNode toolsArray, WorkflowNodeEntity mcpNode) {
        try {
            McpConnection conn = mcpConnector.getConnectionForNode(mcpNode);
            if (conn == null || !conn.isConnected() || conn.getTools() == null) {
                LOG.warnf("MCP node %s has no active connection", mcpNode.name);
                return;
            }
            for (var mcpTool : conn.getTools().tools()) {
                ObjectNode toolDef = objectMapper.createObjectNode();
                toolDef.put("type", "function");
                ObjectNode function = objectMapper.createObjectNode();
                function.put("name", mcpTool.name());
                function.put("description", mcpTool.description() != null ? mcpTool.description() : "");
                if (mcpTool.inputSchema() != null) {
                    function.set("parameters", objectMapper.valueToTree(mcpTool.inputSchema()));
                }
                toolDef.set("function", function);
                toolDef.put("nodeId", mcpNode.id.toString());
                toolDef.put("_mcpTool", true);
                toolsArray.add(toolDef);
            }
            LOG.debugf("Added %d MCP tools from node: %s", conn.getTools().tools().size(), mcpNode.name);
        } catch (Exception e) {
            LOG.errorf("Error discovering MCP tools from node %s: %s", mcpNode.name, e.getMessage());
        }
    }

    /**
     * Emit a tool call started event if an execution context is available.
     */
    private void emitToolCallStarted(ExecutionContext context, WorkflowNodeEntity node, WorkflowNodeEntity toolNode) {
        if (context.getExecution() != null) {
            eventService.logToolCallStarted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                toolNode.name,
                toolNode.id.toString()
            );
        }
    }

    /**
     * Emit a tool call completed event if an execution context is available.
     */
    private void emitToolCallCompleted(
            ExecutionContext context, WorkflowNodeEntity node,
            WorkflowNodeEntity toolNode, boolean success) {
        if (context.getExecution() != null) {
            eventService.logToolCallCompleted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                toolNode.name,
                toolNode.id.toString(),
                success
            );
        }
    }

    /**
     * Load conversation history from the memory node.
     * Returns null if no memory node is connected or it is not a MEMORY type.
     */
    private MemoryResult loadMemoryHistory(WorkflowNodeEntity memoryNode, ExecutionContext context) {
        if (memoryNode == null || memoryNode.type != NodeType.MEMORY) {
            return null;
        }

        LOG.debugf("Found connected memory node: %s", memoryNode.name);

        MemoryNodeConfig memConfig = parseMemoryNodeConfig(memoryNode);

        String conversationId = context.resolveExpression(memConfig.conversationIdExpression);
        if (conversationId == null || conversationId.isEmpty() || conversationId.equals(memConfig.conversationIdExpression)) {
            conversationId = resolveConversationId(context);
        }

        List<LlmMessage> conversationHistory = loadMessages(conversationId, memConfig);

        return new MemoryResult(conversationId, conversationHistory);
    }

    private MemoryNodeConfig parseMemoryNodeConfig(WorkflowNodeEntity memoryNode) {
        MemoryNodeConfig config = new MemoryNodeConfig();
        if (memoryNode.configuration == null) {
            return config;
        }
        try {
            JsonNode nodeConfig = objectMapper.readTree(memoryNode.configuration);
            config.cutoffMode = nodeConfig.has("cutoffMode") ? nodeConfig.get("cutoffMode").asText() : MESSAGE;
            config.maxMessages = nodeConfig.has("maxMessages") ? nodeConfig.get("maxMessages").asInt() : 50;
            config.maxTokens = nodeConfig.has(MAX_TOKENS) ? nodeConfig.get(MAX_TOKENS).asInt() : 4000;
            config.conversationIdExpression = nodeConfig.has("conversationIdExpression")
                ? nodeConfig.get("conversationIdExpression").asText()
                : "${input.threadId}";
        } catch (Exception e) {
            LOG.warnf("Failed to parse memory node config: %s", e.getMessage());
        }
        return config;
    }

    private List<LlmMessage> loadMessages(String conversationId, MemoryNodeConfig memConfig) {
        if (conversationId == null || conversationId.isEmpty()) {
            return new ArrayList<>();
        }
        List<LlmMessage> history;
        if ("token".equalsIgnoreCase(memConfig.cutoffMode)) {
            history = contextMemoryStore.getMessagesByTokens(conversationId, memConfig.maxTokens);
        } else {
            history = contextMemoryStore.getMessagesByCount(conversationId, memConfig.maxMessages);
        }
        LOG.debugf("Loaded %d messages from conversation history for: %s", history.size(), conversationId);
        return history;
    }

    private static class MemoryNodeConfig {
        String cutoffMode = MESSAGE;
        int maxMessages = 50;
        int maxTokens = 4000;
        String conversationIdExpression = "${input.threadId}";
    }

    /**
     * Build a JSON array from conversation history messages.
     */
    private ArrayNode buildHistoryArray(List<LlmMessage> conversationHistory) {
        ArrayNode historyArray = objectMapper.createArrayNode();
        for (LlmMessage msg : conversationHistory) {
            ObjectNode msgNode = objectMapper.createObjectNode();
            msgNode.put("role", msg.getRole().toString().toLowerCase());
            if (msg.getContent() != null) {
                msgNode.put(CONTENT, msg.getContent());
            }
            if (msg.getToolCallId() != null) {
                msgNode.put("toolCallId", msg.getToolCallId());
            }
            if (msg.getName() != null) {
                msgNode.put("name", msg.getName());
            }
            historyArray.add(msgNode);
        }
        return historyArray;
    }

    /**
     * Build structured output response_format from connected Structured Output node.
     * Returns null if no structured output node or no valid schema.
     */
    private JsonNode buildStructuredOutputConfig(WorkflowNodeEntity structuredOutputNode) throws com.fasterxml.jackson.core.JsonProcessingException {
        if (structuredOutputNode == null) {
            return null;
        }

        LOG.debugf("Found connected Structured Output node: %s", structuredOutputNode.name);
        JsonNode soConfig = parseConfiguration(structuredOutputNode.configuration);

        if (!soConfig.has(SCHEMA) || !soConfig.get(SCHEMA).isObject()) {
            return null;
        }

        String schemaName = soConfig.has("schemaName")
            ? soConfig.get("schemaName").asText()
            : "structured_output";
        boolean strict = !soConfig.has(STRICT) || soConfig.get(STRICT).asBoolean(true);

        ObjectNode responseFormat = objectMapper.createObjectNode();
        responseFormat.put("type", "json_schema");

        ObjectNode jsonSchema = objectMapper.createObjectNode();
        jsonSchema.put("name", schemaName);
        jsonSchema.put(STRICT, strict);
        jsonSchema.set(SCHEMA, soConfig.get(SCHEMA));
        responseFormat.set("json_schema", jsonSchema);

        LOG.debugf("Structured output enabled with schema: %s", schemaName);
        return responseFormat;
    }

    /**
     * Execute the LLM call with event logging.
     */
    private NodeExecutionResult executeLlmCall(
            ExecutionContext context, WorkflowNodeEntity node,
            WorkflowNodeEntity llmNode, JsonNode llmConfig,
            ObjectNode mergedConfig) throws Exception {

        // Create a temporary node with merged configuration for LLM execution
        WorkflowNodeEntity tempLlmNode = new WorkflowNodeEntity();
        tempLlmNode.id = llmNode.id;
        tempLlmNode.name = node.name + " (LLM)";
        tempLlmNode.type = NodeType.LLM;
        tempLlmNode.workflow = node.workflow;
        tempLlmNode.configuration = objectMapper.writeValueAsString(mergedConfig);

        LOG.debugf("Agent using LLM config: %s", tempLlmNode.configuration);

        String provider = llmConfig.has(PROVIDER) ? llmConfig.get(PROVIDER).asText() : "unknown";
        String model = llmConfig.has(MODEL) ? llmConfig.get(MODEL).asText() : "unknown";

        // Emit LLM call started event (detailed logging happens inside LlmNodeExecutor)
        if (context.getExecution() != null) {
            eventService.logLlmCallStarted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                provider,
                model,
                null, null, 0
            );
        }

        long startTime = System.currentTimeMillis();

        NodeExecutionResult llmResult = llmExecutor.execute(context, tempLlmNode);

        long durationMs = System.currentTimeMillis() - startTime;

        // Emit LLM call completed event (detailed logging happens inside LlmNodeExecutor)
        if (context.getExecution() != null) {
            eventService.logLlmCallCompleted(
                context.getExecution(),
                node.id.toString(),
                node.name,
                provider,
                model,
                1,
                durationMs,
                null, null, null,
                null,
                llmResult.isSuccess() ? null : llmResult.getErrorMessage()
            );
        }

        return llmResult;
    }

    /**
     * Save user and assistant messages to the memory store.
     */
    private void saveConversationMessages(
            WorkflowNodeEntity memoryNode, String conversationId,
            String userMessage, NodeExecutionResult llmResult) {

        if (memoryNode == null || conversationId == null || conversationId.isEmpty()) {
            return;
        }

        if (userMessage != null && !userMessage.isEmpty()) {
            contextMemoryStore.addMessage(conversationId, LlmMessage.user(userMessage));
        }

        if (llmResult.getOutput() != null) {
            String assistantResponse = extractAssistantResponse(llmResult.getOutput());
            if (assistantResponse != null && !assistantResponse.isEmpty()) {
                contextMemoryStore.addMessage(conversationId, LlmMessage.assistant(assistantResponse));
            }
        }

        LOG.debugf("Saved messages to conversation: %s (total: %d)",
                conversationId, contextMemoryStore.getMessageCount(conversationId));
    }

    /**
     * Extract the assistant response text from LLM output.
     */
    private String extractAssistantResponse(JsonNode outputNode) {
        if (outputNode.has(CONTENT)) {
            return outputNode.get(CONTENT).asText();
        }
        if (outputNode.has("response")) {
            return outputNode.get("response").asText();
        }
        return null;
    }

    /**
     * Build the final agent output from LLM result and metadata.
     */
    private NodeExecutionResult buildAgentOutput(
            NodeExecutionResult llmResult, JsonNode agentConfig,
            WorkflowNodeEntity llmNode, WorkflowNodeEntity memoryNode) {

        ObjectNode output = objectMapper.createObjectNode();
        if (llmResult.getOutput() != null) {
            llmResult.getOutput().fields().forEachRemaining(field -> {
                output.set(field.getKey(), field.getValue());
            });
        }

        output.put("agentId", agentConfig.has("agentId") ? agentConfig.get("agentId").asText() : "");
        output.put("llmNodeId", llmNode.id.toString());
        if (memoryNode != null) {
            output.put("memoryNodeId", memoryNode.id.toString());
        }

        return NodeExecutionResult.success(output);
    }

    // --- Existing helper methods (unchanged) ---

    /**
     * Find a node connected to a specific input port.
     */
    private WorkflowNodeEntity findConnectedNode(WorkflowNodeEntity node, String portId) {
        if (node.workflow == null || node.workflow.edges == null) {
            return null;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node's specific port
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                portId.equals(edge.targetPortId)) {
                return edge.sourceNode;
            }
        }

        return null;
    }

    /**
     * Find all nodes connected to a specific input port (for ports that accept multiple connections).
     */
    private List<WorkflowNodeEntity> findConnectedNodes(WorkflowNodeEntity node, String portId) {
        List<WorkflowNodeEntity> connectedNodes = new ArrayList<>();

        if (node.workflow == null || node.workflow.edges == null) {
            return connectedNodes;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node's specific port
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                portId.equals(edge.targetPortId) &&
                edge.sourceNode != null) {
                connectedNodes.add(edge.sourceNode);
            }
        }

        return connectedNodes;
    }

    /**
     * Find a memory node connected to this agent node.
     * Checks multiple port names: 'memory', 'context', 'context_memory'
     */
    private WorkflowNodeEntity findConnectedMemoryNode(WorkflowNodeEntity node) {
        if (node.workflow == null || node.workflow.edges == null) {
            return null;
        }

        for (WorkflowEdgeEntity edge : node.workflow.edges) {
            // Check if this edge connects TO our node
            if (edge.targetNode != null &&
                edge.targetNode.id.equals(node.id) &&
                edge.sourceNode != null &&
                edge.sourceNode.type == NodeType.MEMORY) {

                String portId = edge.targetPortId;
                // Accept if port is in accepted list or starts with memory/context
                if (portId == null || MEMORY_PORTS.contains(portId) ||
                    portId.startsWith("memory") || portId.startsWith("context")) {
                    LOG.debugf("Found memory node connected via port: %s", portId);
                    return edge.sourceNode;
                }
            }
        }

        return null;
    }

    /**
     * Resolve conversation ID from common input fields.
     */
    private String resolveConversationId(ExecutionContext context) {
        JsonNode input = context.getInput();
        if (input == null) {
            return null;
        }

        // Try common field names
        String[] fields = {"threadId", "conversationId", "sessionId", "chatId", "thread_id", "conversation_id"};

        for (String field : fields) {
            if (input.has(field) && !input.get(field).isNull()) {
                return input.get(field).asText();
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : fields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    return body.get(field).asText();
                }
            }
        }

        // Try variables
        for (String field : fields) {
            JsonNode varValue = context.getVariable(field);
            if (varValue != null && !varValue.isNull()) {
                return varValue.asText();
            }
        }

        return null;
    }

    /**
     * Extract user prompt from context input.
     */
    private String extractUserPrompt(ExecutionContext context) {
        return extractUserPromptFromJson(context.getInput());
    }

    /**
     * Extract user prompt from a JSON node.
     */
    private String extractUserPromptFromJson(JsonNode input) {
        if (input == null) {
            return null;
        }

        // Try common field names
        String[] fields = {PROMPT, MESSAGE, QUERY, "text", "input"};

        for (String field : fields) {
            if (input.has(field) && !input.get(field).isNull()) {
                JsonNode val = input.get(field);
                // Handle nested objects (e.g. Telegram's message.text)
                if (val.isObject() && val.has("text")) {
                    String text = val.get("text").asText();
                    if (text != null && !text.isEmpty()) return text;
                } else if (val.isTextual()) {
                    String text = val.asText();
                    if (text != null && !text.isEmpty()) return text;
                }
            }
        }

        // Try nested body
        if (input.has("body") && input.get("body").isObject()) {
            JsonNode body = input.get("body");
            for (String field : fields) {
                if (body.has(field) && !body.get(field).isNull()) {
                    JsonNode val = body.get(field);
                    if (val.isObject() && val.has("text")) {
                        String text = val.get("text").asText();
                        if (text != null && !text.isEmpty()) return text;
                    } else if (val.isTextual()) {
                        String text = val.asText();
                        if (text != null && !text.isEmpty()) return text;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Extract RAG context from input (from Context Builder node).
     * Looks for 'context' field which contains formatted retrieved documents.
     */
    private String extractRagContext(JsonNode input) {
        if (input == null) {
            return null;
        }

        // Primary: 'context' field from Context Builder
        String directContext = extractDirectContext(input);
        if (directContext != null) {
            return directContext;
        }

        // Alternative: Build context from 'results' array (direct from Vector Search)
        return buildContextFromResults(input);
    }

    private String extractDirectContext(JsonNode input) {
        if (input.has("context") && input.get("context").isTextual()) {
            String context = input.get("context").asText();
            if (!context.isEmpty()) {
                return context;
            }
        }
        return null;
    }

    private String buildContextFromResults(JsonNode input) {
        if (!input.has(RESULTS) || !input.get(RESULTS).isArray()) {
            return null;
        }

        JsonNode results = input.get(RESULTS);
        if (results.isEmpty()) {
            return null;
        }

        StringBuilder contextBuilder = new StringBuilder();
        for (int i = 0; i < results.size(); i++) {
            JsonNode result = results.get(i);
            if (result.has(CONTENT)) {
                appendResultEntry(contextBuilder, result, i);
            }
        }

        String context = contextBuilder.toString();
        return context.isEmpty() ? null : context;
    }

    private void appendResultEntry(StringBuilder builder, JsonNode result, int index) {
        if (index > 0) {
            builder.append("\n\n---\n\n");
        }
        builder.append("[").append(index + 1).append("] ");
        builder.append(result.get(CONTENT).asText());
        if (result.has("sourceId")) {
            builder.append("\n(Source: ").append(result.get("sourceId").asText()).append(")");
        }
    }
}
