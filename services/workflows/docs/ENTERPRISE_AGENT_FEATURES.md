# Enterprise Agent Features - Implementation Report

## Overview

This document covers the enterprise-grade AI agent features implemented for the Nuraly Workflow Engine.

---

## Features Implemented

### 1. LLM Retry/Failover with Circuit Breaker

**Files:**
- `src/main/java/com/nuraly/workflows/llm/LlmResilienceService.java`

**Capabilities:**
- Exponential backoff retry (configurable attempts, delays)
- Circuit breaker per provider (prevents cascading failures)
- Provider failover chain (e.g., OpenAI → Anthropic → Ollama)
- Retryable error detection (rate limits, timeouts)

**Configuration:**
```json
{
  "retry": {
    "enabled": true,
    "maxAttempts": 3,
    "initialBackoffMs": 1000,
    "maxBackoffMs": 30000
  },
  "fallback": {
    "enabled": true,
    "providers": ["anthropic", "ollama"]
  },
  "timeout": 60000
}
```

---

### 2. LLM Streaming

**Files:**
- `src/main/java/com/nuraly/workflows/llm/StreamingLlmProvider.java`
- `src/main/java/com/nuraly/workflows/llm/LlmStreamingService.java`
- `src/main/java/com/nuraly/workflows/llm/providers/OpenAiProvider.java`

**Capabilities:**
- Token-by-token streaming from LLM providers
- SSE (Server-Sent Events) support
- Virtual threads for non-blocking I/O
- Stream cancellation support

---

### 3. Streaming Chat Output

**Files:**
- `src/main/java/com/nuraly/workflows/engine/executors/LlmNodeExecutor.java`
- `src/main/java/com/nuraly/workflows/service/WorkflowEventService.java`

**Events:**
| Event | Description |
|-------|-------------|
| `CHAT_STREAM_START` | Streaming session begins |
| `CHAT_STREAM_TOKEN` | Each token from LLM |
| `CHAT_STREAM_END` | Streaming completes |
| `CHAT_STREAM_ERROR` | Error occurred |

**Configuration:**
```json
{
  "type": "LLM",
  "provider": "openai",
  "streaming": true,
  "streamToChat": true
}
```

---

### 4. Guardrails Node

**Files:**
- `src/main/java/com/nuraly/workflows/engine/executors/GuardrailNodeExecutor.java`
- `src/main/java/com/nuraly/workflows/guardrails/GuardrailCheck.java`
- `src/main/java/com/nuraly/workflows/guardrails/GuardrailResult.java`

#### Keyword-Based Checks (Fast, No API Cost)

| Type | File | Description |
|------|------|-------------|
| `pii` | `PiiDetector.java` | Email, phone, SSN, credit card, IP |
| `injection` | `PromptInjectionDetector.java` | Prompt injection attacks |
| `moderation` | `ContentModerator.java` | Violence, hate, profanity |
| `topics` | `TopicRestrictor.java` | Politics, religion, medical advice |
| `length` | Built-in | Min/max character limits |
| `regex` | Built-in | Pattern matching |

#### LLM-Enhanced Checks (ML-Powered)

| Type | File | Description |
|------|------|-------------|
| `openai_moderation` | `OpenAiModerationCheck.java` | OpenAI Moderation API |
| `llm_policy` | `LlmPolicyCheck.java` | Custom natural language policies |
| `semantic_topic` | `SemanticTopicCheck.java` | Embedding-based off-topic detection |

**Configuration Example:**
```json
{
  "type": "GUARDRAIL",
  "mode": "input",
  "checks": [
    {"type": "pii", "action": "redact", "categories": ["email", "phone"]},
    {"type": "injection", "action": "block", "sensitivity": "high"},
    {"type": "openai_moderation", "apiKey": "sk-...", "categories": ["hate", "violence"]},
    {"type": "llm_policy", "apiKey": "sk-...", "policies": [
      {"name": "no_competitors", "description": "Do not discuss competitor products"}
    ]},
    {"type": "semantic_topic", "apiKey": "sk-...", "mode": "allowlist", "threshold": 0.75, "topics": [
      {"name": "support", "description": "Customer support questions"}
    ]}
  ],
  "onFail": "block"
}
```

---

## Tests

### Test Files

| File | Coverage |
|------|----------|
| `LlmResilienceServiceTest.java` | Retry logic, failover, circuit breaker |
| `GuardrailChecksTest.java` | PII, injection, moderation, topics |

### Run Tests

```bash
mvn test -Dtest=LlmResilienceServiceTest
mvn test -Dtest=GuardrailChecksTest
```

---

## Git Commits

```
b25a946 feat: Add streaming chat output for token-by-token LLM responses
fdb5215 feat: Add LLM-enhanced guardrail checks for ML-powered content validation
6025fcb feat: Add Guardrails Node for input/output validation and safety
eb0f1d9 feat: Add LLM streaming support with SSE
fd31097 test: Add unit tests for LlmResilienceService
3df3599 feat: Add LLM retry/failover with circuit breaker support
c1b5960 feat: Enhance ContextMemoryNodeExecutor with RAG-powered conversation memory
b3d1b80 feat: Add ConversationMemoryService for RAG-enhanced chat history
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Chat UI)                        │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ RabbitMQ Events
                              │ (CHAT_STREAM_TOKEN, etc.)
┌─────────────────────────────────────────────────────────────────┐
│                     WorkflowEventService                         │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       LlmNodeExecutor                            │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐   │
│  │  Streaming  │  │ LlmResilience    │  │ Tool Calling      │   │
│  │  Mode       │  │ Service          │  │ Loop              │   │
│  └─────────────┘  └──────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    GuardrailNodeExecutor                         │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │ Keyword Checks          │  │ LLM-Enhanced Checks          │  │
│  │ - PII                   │  │ - OpenAI Moderation          │  │
│  │ - Injection             │  │ - LLM Policy                 │  │
│  │ - Moderation            │  │ - Semantic Topic             │  │
│  │ - Topics                │  │                              │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      LLM Providers                               │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌────────┐           │
│  │ OpenAI   │  │ Anthropic │  │ Gemini │  │ Ollama │           │
│  └──────────┘  └───────────┘  └────────┘  └────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Integration

### Streaming Chat Handler

```javascript
const eventSource = new EventSource('/api/events');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'CHAT_STREAM_START':
      createMessagePlaceholder(data.data.streamId);
      break;

    case 'CHAT_STREAM_TOKEN':
      appendToken(data.data.streamId, data.data.token);
      break;

    case 'CHAT_STREAM_END':
      finalizeMessage(data.data.streamId, data.data.content, data.data.usage);
      break;

    case 'CHAT_STREAM_ERROR':
      showError(data.data.streamId, data.data.error);
      break;
  }
};
```

---

## Node Types Added

```java
CONTEXT_MEMORY  // RAG-enhanced conversation memory (buffer, semantic, hybrid)
GUARDRAIL       // Input/output validation and safety checks
```
