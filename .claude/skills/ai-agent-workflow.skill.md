# AI Agent Workflow Skill

Create AI Agent workflows using the Nuraly Workflow Engine and Canvas components.

## What this skill does

This skill helps you:
- Design AI Agent workflows with proper node architecture
- Configure AGENT, LLM, TOOL, MEMORY, and PROMPT nodes
- Understand agent loop execution patterns
- Set up RAG (Retrieval-Augmented Generation) pipelines
- Configure guardrails for safe AI execution
- Create multi-turn conversational agents
- Build tool-calling agents with function execution

## When to invoke this skill

Invoke this skill when the user asks about:
- "Create an AI agent workflow"
- "Build a chatbot workflow"
- "Set up an LLM workflow"
- "Create a RAG pipeline"
- "Add tools to my agent"
- "Configure agent memory"
- "Build a conversational agent"
- "Create a workflow with Claude/GPT/Gemini"
- "Set up guardrails for my agent"

## AI Agent Workflow Architecture

### Core Agent Components

An AI Agent workflow typically consists of these interconnected nodes:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PROMPT    │────▶│    AGENT    │◀────│   MEMORY    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │   LLM   │  │  TOOL 1 │  │  TOOL 2 │
        └─────────┘  └─────────┘  └─────────┘
```

### Node Types for AI Agents

| Node Type | Purpose | Required Connections |
|-----------|---------|---------------------|
| AGENT | Orchestrates the agent loop | LLM (required), Tools (optional), Memory (optional), Prompt (optional) |
| LLM | Provides language model capabilities | None (standalone) |
| TOOL | Defines callable functions for the agent | FUNCTION node for execution |
| MEMORY | Stores conversation history | None |
| PROMPT | System prompt template | None |
| CONTEXT_MEMORY | RAG-enhanced memory with semantic search | Vector store |
| GUARDRAIL | Input/output safety validation | None |
| RETRIEVER | RAG context injection | Vector search results |

---

## Instructions for AI

When this skill is invoked:

### 1. Understand the Requirements

Ask clarifying questions if needed:
- What should the agent do? (chat, task automation, RAG)
- Which LLM provider? (OpenAI, Anthropic, Gemini, Ollama)
- Does it need tools? What functions should it call?
- Should it remember conversation history?
- Are there safety requirements (guardrails)?

### 2. Design the Workflow Structure

#### Basic Conversational Agent

For a simple chatbot:

```json
{
  "nodes": [
    {
      "id": "start",
      "type": "CHAT_START",
      "position": { "x": 100, "y": 200 },
      "configuration": {
        "alwaysOpenPreview": true
      }
    },
    {
      "id": "prompt",
      "type": "PROMPT",
      "position": { "x": 300, "y": 100 },
      "configuration": {
        "template": "You are a helpful assistant. Be concise and accurate."
      }
    },
    {
      "id": "memory",
      "type": "MEMORY",
      "position": { "x": 300, "y": 300 },
      "configuration": {
        "maxMessages": 20,
        "strategy": "sliding_window"
      }
    },
    {
      "id": "llm",
      "type": "LLM",
      "position": { "x": 500, "y": 400 },
      "configuration": {
        "provider": "openai",
        "model": "gpt-4o",
        "temperature": 0.7,
        "maxTokens": 2048
      }
    },
    {
      "id": "agent",
      "type": "AGENT",
      "position": { "x": 500, "y": 200 },
      "configuration": {
        "maxIterations": 10,
        "stopOnError": false
      },
      "ports": {
        "inputs": [{ "id": "input", "type": "INPUT" }],
        "configs": [
          { "id": "prompt", "type": "CONFIG", "label": "prompt" },
          { "id": "memory", "type": "CONFIG", "label": "memory" },
          { "id": "llm", "type": "CONFIG", "label": "llm" }
        ],
        "outputs": [{ "id": "output", "type": "OUTPUT" }]
      }
    },
    {
      "id": "output",
      "type": "CHAT_OUTPUT",
      "position": { "x": 700, "y": 200 },
      "configuration": {
        "streaming": true
      }
    }
  ],
  "edges": [
    { "sourceNodeId": "start", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "input" },
    { "sourceNodeId": "prompt", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "prompt" },
    { "sourceNodeId": "memory", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "memory" },
    { "sourceNodeId": "llm", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "llm" },
    { "sourceNodeId": "agent", "sourcePortId": "output", "targetNodeId": "output", "targetPortId": "input" }
  ]
}
```

#### Agent with Tool Calling

For an agent that can call external functions:

```json
{
  "nodes": [
    {
      "id": "agent",
      "type": "AGENT",
      "position": { "x": 400, "y": 200 },
      "configuration": {
        "maxIterations": 15
      },
      "ports": {
        "inputs": [{ "id": "input", "type": "INPUT" }],
        "configs": [
          { "id": "llm", "type": "CONFIG", "label": "llm" },
          { "id": "tool_weather", "type": "CONFIG", "label": "tools" },
          { "id": "tool_search", "type": "CONFIG", "label": "tools" }
        ],
        "outputs": [{ "id": "output", "type": "OUTPUT" }]
      }
    },
    {
      "id": "llm",
      "type": "LLM",
      "position": { "x": 600, "y": 350 },
      "configuration": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-20250514",
        "temperature": 0.3,
        "maxTokens": 4096
      }
    },
    {
      "id": "tool_weather",
      "type": "TOOL",
      "position": { "x": 200, "y": 350 },
      "configuration": {
        "toolName": "get_weather",
        "description": "Get current weather for a location",
        "parameters": [
          { "name": "location", "type": "string", "required": true, "description": "City name" },
          { "name": "units", "type": "string", "required": false, "description": "celsius or fahrenheit" }
        ]
      }
    },
    {
      "id": "function_weather",
      "type": "FUNCTION",
      "position": { "x": 200, "y": 500 },
      "configuration": {
        "functionId": "weather-api-function-uuid"
      }
    },
    {
      "id": "tool_search",
      "type": "TOOL",
      "position": { "x": 400, "y": 350 },
      "configuration": {
        "toolName": "web_search",
        "description": "Search the web for information",
        "parameters": [
          { "name": "query", "type": "string", "required": true, "description": "Search query" }
        ]
      }
    },
    {
      "id": "function_search",
      "type": "FUNCTION",
      "position": { "x": 400, "y": 500 },
      "configuration": {
        "functionId": "search-function-uuid"
      }
    }
  ],
  "edges": [
    { "sourceNodeId": "llm", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "llm" },
    { "sourceNodeId": "tool_weather", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "tool_weather" },
    { "sourceNodeId": "tool_search", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "tool_search" },
    { "sourceNodeId": "tool_weather", "sourcePortId": "function", "targetNodeId": "function_weather", "targetPortId": "input" },
    { "sourceNodeId": "tool_search", "sourcePortId": "function", "targetNodeId": "function_search", "targetPortId": "input" }
  ]
}
```

#### RAG-Enhanced Agent

For an agent with retrieval-augmented generation:

```json
{
  "nodes": [
    {
      "id": "agent",
      "type": "AGENT",
      "position": { "x": 500, "y": 200 },
      "ports": {
        "configs": [
          { "id": "llm", "type": "CONFIG", "label": "llm" },
          { "id": "retriever", "type": "CONFIG", "label": "retriever" },
          { "id": "context_memory", "type": "CONFIG", "label": "context_memory" }
        ]
      }
    },
    {
      "id": "vector_search",
      "type": "VECTOR_SEARCH",
      "position": { "x": 300, "y": 350 },
      "configuration": {
        "topK": 5,
        "minSimilarity": 0.7,
        "collectionName": "knowledge_base"
      }
    },
    {
      "id": "context_builder",
      "type": "CONTEXT_BUILDER",
      "position": { "x": 500, "y": 350 },
      "configuration": {
        "template": "numbered",
        "maxTokens": 4000,
        "includeMetadata": true
      }
    },
    {
      "id": "context_memory",
      "type": "CONTEXT_MEMORY",
      "position": { "x": 700, "y": 350 },
      "configuration": {
        "maxMessages": 10,
        "semanticSearch": true,
        "hybridWeight": 0.7
      }
    }
  ],
  "edges": [
    { "sourceNodeId": "vector_search", "sourcePortId": "output", "targetNodeId": "context_builder", "targetPortId": "input" },
    { "sourceNodeId": "context_builder", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "retriever" },
    { "sourceNodeId": "context_memory", "sourcePortId": "output", "targetNodeId": "agent", "targetPortId": "context_memory" }
  ]
}
```

### 3. Node Configuration Details

#### LLM Node Configuration

```json
{
  "type": "LLM",
  "configuration": {
    "provider": "openai|anthropic|gemini|ollama",
    "model": "gpt-4o|claude-sonnet-4-20250514|gemini-pro|llama2",
    "temperature": 0.7,
    "maxTokens": 2048,
    "topP": 1.0,
    "frequencyPenalty": 0,
    "presencePenalty": 0,
    "stopSequences": [],
    "streaming": true,
    "apiKeyRef": "kv://openai-api-key"
  }
}
```

**Provider-Specific Models:**
- **OpenAI**: gpt-4o, gpt-4-turbo, gpt-4, gpt-3.5-turbo
- **Anthropic**: claude-sonnet-4-20250514, claude-3-opus, claude-3-haiku
- **Gemini**: gemini-pro, gemini-ultra
- **Ollama**: llama2, mistral, codellama, phi

#### AGENT Node Configuration

```json
{
  "type": "AGENT",
  "configuration": {
    "maxIterations": 10,
    "stopOnError": false,
    "outputFormat": "text|json|structured",
    "timeoutMs": 60000
  }
}
```

**Agent Loop Behavior:**
1. Sends prompt + tools to connected LLM
2. LLM returns tool calls or final response
3. Executes requested tools via connected FUNCTION nodes
4. Returns tool results to LLM
5. Repeats until `maxIterations` or final response

#### TOOL Node Configuration

```json
{
  "type": "TOOL",
  "configuration": {
    "toolName": "function_name",
    "description": "Clear description of what this tool does",
    "parameters": [
      {
        "name": "param1",
        "type": "string|number|boolean|array|object",
        "required": true,
        "description": "What this parameter is for",
        "enum": ["option1", "option2"]
      }
    ]
  }
}
```

#### MEMORY Node Configuration

```json
{
  "type": "MEMORY",
  "configuration": {
    "maxMessages": 20,
    "strategy": "sliding_window|summarize|token_limit",
    "tokenLimit": 4000,
    "includeSystemPrompt": true
  }
}
```

#### PROMPT Node Configuration

```json
{
  "type": "PROMPT",
  "configuration": {
    "template": "You are {{role}}. Your task is to {{task}}.\n\nContext: {{context}}",
    "variables": {
      "role": "a helpful AI assistant",
      "task": "answer user questions accurately"
    }
  }
}
```

#### GUARDRAIL Node Configuration

```json
{
  "type": "GUARDRAIL",
  "configuration": {
    "mode": "input|output",
    "checks": [
      {
        "type": "pii",
        "action": "redact|block",
        "categories": ["email", "phone", "ssn", "credit_card"]
      },
      {
        "type": "injection",
        "action": "block",
        "sensitivity": "high|medium|low"
      },
      {
        "type": "content",
        "action": "block",
        "categories": ["violence", "hate", "profanity"]
      },
      {
        "type": "topic",
        "action": "block",
        "blockedTopics": ["politics", "medical_advice"]
      },
      {
        "type": "openai_moderation",
        "action": "block",
        "categories": ["hate", "violence", "self-harm"]
      }
    ],
    "onFail": "block|continue"
  }
}
```

### 4. RAG Pipeline Configuration

#### Document Ingestion Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   DOCUMENT   │───▶│    TEXT      │───▶│  EMBEDDING   │───▶│   VECTOR     │
│   LOADER     │    │   SPLITTER   │    │              │    │   WRITE      │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**DOCUMENT_LOADER:**
```json
{
  "type": "DOCUMENT_LOADER",
  "configuration": {
    "source": "file|url|s3",
    "fileTypes": ["pdf", "docx", "html", "txt"],
    "extractImages": false,
    "preserveFormatting": true
  }
}
```

**TEXT_SPLITTER:**
```json
{
  "type": "TEXT_SPLITTER",
  "configuration": {
    "strategy": "sentence|recursive|token",
    "chunkSize": 500,
    "chunkOverlap": 50,
    "preserveBoundaries": true
  }
}
```

**EMBEDDING:**
```json
{
  "type": "EMBEDDING",
  "configuration": {
    "provider": "openai|ollama|local",
    "model": "text-embedding-3-small|text-embedding-3-large",
    "dimensions": 1536
  }
}
```

**VECTOR_WRITE:**
```json
{
  "type": "VECTOR_WRITE",
  "configuration": {
    "collectionName": "my_knowledge_base",
    "batchSize": 100,
    "metadata": {
      "source_type": "document",
      "indexed_at": "{{timestamp}}"
    }
  }
}
```

#### Query Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   EMBEDDING  │───▶│   VECTOR     │───▶│  RERANKER    │───▶│   CONTEXT    │
│   (query)    │    │   SEARCH     │    │  (optional)  │    │   BUILDER    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**VECTOR_SEARCH:**
```json
{
  "type": "VECTOR_SEARCH",
  "configuration": {
    "collectionName": "my_knowledge_base",
    "topK": 10,
    "minSimilarity": 0.7,
    "metadataFilter": {
      "source_type": "document"
    }
  }
}
```

**RERANKER:**
```json
{
  "type": "RERANKER",
  "configuration": {
    "model": "cross-encoder",
    "topK": 5
  }
}
```

**CONTEXT_BUILDER:**
```json
{
  "type": "CONTEXT_BUILDER",
  "configuration": {
    "template": "default|numbered|markdown|xml|custom",
    "customTemplate": "Document {{index}}: {{content}}\nSource: {{metadata.source}}",
    "maxTokens": 4000,
    "includeMetadata": true,
    "separator": "\n---\n"
  }
}
```

### 5. Canvas Integration

When creating workflows in the canvas:

#### Node Positioning Guidelines
- Start nodes at x: 100-200
- Space nodes horizontally by 200px
- Space nodes vertically by 150px for configs
- Config nodes (LLM, Memory, Prompt) below the AGENT node
- Tool nodes to the left/right of AGENT

#### Port Connections
- **Input ports**: Top of node
- **Output ports**: Bottom of node
- **Config ports**: Bottom of node (for AGENT)
- Connect config nodes to appropriate labeled config ports

#### Visual Best Practices
- Use FRAME nodes to group related nodes
- Add NOTE nodes for documentation
- Name nodes descriptively

### 6. Workflow Validation

Before publishing, verify:
1. AGENT has LLM connected
2. All TOOL nodes have FUNCTION nodes connected
3. No circular dependencies
4. All required ports are connected
5. API keys are configured in KV store

### 7. Common Patterns

#### Customer Support Agent
```
CHAT_START → GUARDRAIL(input) → AGENT → GUARDRAIL(output) → CHAT_OUTPUT
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                  LLM         MEMORY      TOOL(lookup_order)
                                               │
                                          FUNCTION(order_api)
```

#### Research Agent with Web Search
```
HTTP_START → AGENT → HTTP_END
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
   LLM    TOOL(search)  TOOL(fetch_url)
              │              │
         WEB_SEARCH      WEB_CRAWL
```

#### Document Q&A Agent
```
CHAT_START → VECTOR_SEARCH → CONTEXT_BUILDER → AGENT → CHAT_OUTPUT
                                                 │
                                    ┌────────────┼────────────┐
                                    ▼            ▼            ▼
                                   LLM        MEMORY      PROMPT
```

---

## Code Locations

### Workflow Engine
- **Engine**: `services/workflows/src/main/java/com/nuraly/workflows/engine/WorkflowEngine.java`
- **Node Executors**: `services/workflows/src/main/java/com/nuraly/workflows/engine/executors/`
  - `AgentNodeExecutor.java` - Agent orchestration
  - `LlmNodeExecutor.java` - LLM calls with tool calling
  - `ToolNodeExecutor.java` - Tool definition for agents
  - `MemoryNodeExecutor.java` - Conversation memory
  - `GuardrailNodeExecutor.java` - Safety validation

### Canvas Components
- **Canvas**: `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component.ts`
- **Node Types**: `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types.ts`

### API Endpoints
- **Execute**: `POST /api/v1/workflows/{id}/execute`
- **Chat Trigger**: `POST /api/v1/workflows/{id}/trigger/chat`
- **Executions**: `GET /api/v1/workflows/{id}/executions`

---

## Tips

- Start simple: CHAT_START → LLM → CHAT_OUTPUT for testing
- Add memory before adding tools
- Use streaming for better UX in chat applications
- Set reasonable `maxIterations` (10-15) to prevent infinite loops
- Add guardrails for production deployments
- Test with different prompts before publishing
- Use environment-specific API key references (kv://key-name)
