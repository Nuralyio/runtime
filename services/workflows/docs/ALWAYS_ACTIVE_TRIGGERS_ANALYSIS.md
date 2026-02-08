# Always-Active Triggers Analysis: From External Triggers to Graph Nodes

## Overview

This document analyzes the current architecture of always-active triggers (Telegram bots, Slack bots, Discord bots, etc.) in the Nuraly workflow engine, identifies design limitations, and proposes a "trigger-as-node" model where persistent connections are first-class nodes on the workflow canvas.

---

## 1. Current Architecture: Triggers Are External to the Graph

### Entity Relationship

```
WorkflowEntity
├── nodes: [START, LLM, TRANSFORM, END]     ← Node graph (visual canvas)
├── edges: [START→LLM, LLM→END]             ← Connections (visual canvas)
└── triggers: [TELEGRAM_BOT, SLACK_SOCKET]   ← NOT on canvas (separate panel)
```

Triggers are stored as `WorkflowTriggerEntity`, linked to a workflow via a ManyToOne foreign key. They are not represented as nodes in the graph.

### Trigger Types

| Type | Protocol | Connection Model |
|------|----------|-----------------|
| `WEBHOOK` | HTTP (stateless) | External caller pushes |
| `SCHEDULE` | Cron (stateless) | Internal timer fires |
| `EVENT` | RabbitMQ (stateless) | Internal event bus |
| `TELEGRAM_BOT` | Long-polling (persistent) | Server maintains connection |
| `SLACK_SOCKET` | WebSocket (persistent) | Server maintains connection |
| `DISCORD_BOT` | WebSocket (persistent) | Server maintains connection |
| `WHATSAPP_WEBHOOK` | HTTP webhook (semi-persistent) | Meta pushes, server verifies |
| `CUSTOM_WEBSOCKET` | WebSocket (persistent) | Server maintains connection |

### Message Flow (Current)

```
┌─────────────────────────────────────────────────────────┐
│  Triggers Panel (separate UI, NOT on canvas)            │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐     │
│  │ Telegram   │  │ Slack Bot   │  │ Webhook      │     │
│  │ Bot        │  │             │  │              │     │
│  └─────┬──────┘  └──────┬──────┘  └──────┬───────┘     │
└────────┼────────────────┼────────────────┼──────────────┘
         │                │                │
         │  trigger.type  │                │
         │  determines    │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│  TriggerMessageRouter                                   │
│  1. Validate trigger enabled & workflow ACTIVE           │
│  2. Create WorkflowExecutionEntity (QUEUED)              │
│  3. Set triggerType = trigger.type.name().toLowerCase()  │
│  4. Publish to RabbitMQ                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  WorkflowEngine                                         │
│  findStartNode(workflow, triggerType):                   │
│    if triggerType contains "chat"  → CHAT_START          │
│    if triggerType contains "http"  → HTTP_START          │
│    else                            → START (generic)     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Node Graph (canvas)                                    │
│  ┌─────────┐     ┌─────┐     ┌─────┐                   │
│  │ START   │────▶│ LLM │────▶│ END │                   │
│  └─────────┘     └─────┘     └─────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Start Node Selection Logic

The `WorkflowEngine.findStartNode()` method uses string matching on `triggerType` to decide which start node to use:

- `triggerType.contains("chat")` → `NodeType.CHAT_START`
- `triggerType.contains("http")` or `triggerType.contains("webhook")` → `NodeType.HTTP_START`
- Everything else → `NodeType.START`
- If no match → fallback to any START-type node

There is **no direct foreign key** between `WorkflowTriggerEntity` and a specific `WorkflowNodeEntity`.

---

## 2. Connection Lifecycle (Current)

### Infrastructure Components

| Component | Role |
|-----------|------|
| `TriggerConnector` (interface) | Connect/disconnect/health per protocol |
| `TelegramConnector` | Long-polling implementation |
| `SlackSocketConnector` | WebSocket implementation |
| `TriggerManagerService` | Orchestrates trigger lifecycle |
| `TriggerOwnershipService` | Distributed single-active locking |
| `TriggerMessageRouter` | Routes messages to workflow executions |
| `ActiveTrigger` | Runtime state of a connected trigger |

### Connection State Machine

```
DISCONNECTED ──activate──► CONNECTING ──success──► CONNECTED
     ▲                          │                      │
     │                       error                  dev_mode
     │                          ▼                      ▼
     └──────────────────── ERROR (retry) ◄──── PAUSED (buffering)
                                                       │
                                               handoff_request
                                                       ▼
                                              HANDOFF_PENDING
```

### Distributed Ownership

Telegram and Slack only allow **one active connection per bot token**. The `TriggerOwnershipService` ensures single-active across the cluster:

```
TriggerOwnershipEntity:
  resource_key: "telegram:<bot_token_hash>"
  active_trigger_id: UUID
  owner_instance_id: "instance-1"
  lease_expires_at: now + 30s
  last_heartbeat_at: now
  connection_state: CONNECTED
```

- Heartbeat every 10s renews the lease
- If instance crashes, lease expires after 30s
- Another instance detects orphan and claims ownership
- Messages buffered during transitions (zero loss)

### Dev/Prod Mode Switching

```
Production State:
  PROD Trigger ──(CONNECTED)──► Telegram Bot ──► Messages flow to PROD workflow

Enable Dev Mode (1h max):
  1. Pause PROD trigger → state = PAUSED
  2. Start DEV trigger → state = CONNECTED
  3. PROD messages → buffered to RabbitMQ queue
  4. New messages → DEV workflow

Release Dev Mode:
  1. Stop DEV trigger → state = DISCONNECTED
  2. Resume PROD trigger → state = CONNECTED
  3. Replay buffered messages to PROD workflow
```

---

## 3. Problems With the Current Design

### 3.1 No Visual Connection

Triggers are hidden in a side panel. The user cannot see on the canvas what feeds into the workflow or whether the connection is alive.

### 3.2 Implicit Routing Is Fragile

The `findStartNode()` logic uses string matching to decide routing. A `TELEGRAM_BOT` trigger routes to the generic `START` node, not `CHAT_START`, even though Telegram is conversational.

### 3.3 One Path Per Trigger Type

If a workflow has both a Telegram bot and a Slack bot, they both route to the same `START` node. There's no way to give each bot a different processing path within the same workflow.

### 3.4 Workflow Has No Awareness of the Connection

The workflow graph has no concept that a persistent connection exists. It just receives a message and runs. Connection lifecycle (connect/disconnect/reconnect/health) is entirely managed outside the graph.

### 3.5 No In-Graph Response Context

There's no natural way for the workflow to reply back through the same channel/thread that triggered it. Slack/Telegram send nodes exist but are disconnected from the trigger — the user must manually configure channel IDs or extract them from the input.

### 3.6 Configuration Split

Bot configuration lives in two places: the trigger entity (credentials, connection settings) and node configuration (what to do with the message). This creates a fragmented user experience.

---

## 4. Proposed: Trigger-as-Node Model

### Visual Representation

```
┌──────────────────────────────────────────────────────────────┐
│  Node Graph (canvas)                                         │
│                                                              │
│  ┌──────────────┐     ┌─────┐     ┌──────────────────┐      │
│  │ TELEGRAM_BOT │────▶│ LLM │────▶│ TELEGRAM_REPLY   │      │
│  │ (always on)  │     └─────┘     │ (same chat)      │      │
│  │ 🟢 connected │                 └──────────────────┘      │
│  └──────────────┘                                            │
│                                                              │
│  ┌──────────────┐     ┌───────────┐   ┌─────────────┐       │
│  │ SLACK_BOT    │────▶│ TRANSFORM │──▶│ SLACK_REPLY  │       │
│  │ (always on)  │     └───────────┘   │ (same thread)│       │
│  │ 🟢 connected │                     └─────────────┘       │
│  └──────────────┘                                            │
│                                                              │
│  ┌──────────────┐     ┌─────────┐                            │
│  │ WEBHOOK      │────▶│ HTTP_END│                            │
│  │ (passive)    │     └─────────┘                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
```

### Comparison

| Aspect | Current (External Trigger) | Proposed (Trigger-as-Node) |
|--------|---------------------------|---------------------------|
| **Visibility** | Hidden in side panel | Visible on canvas with connection status |
| **Routing** | Implicit type matching | Explicit edge from trigger node to next node |
| **Multiple bots** | Share one START node | Each has its own path in the graph |
| **Reply context** | Manual config of channel/thread | Automatic — reply node inherits trigger context |
| **Connection state** | Managed externally | Shown on the node (green/red indicator) |
| **Configuration** | Split between trigger panel and node config | Unified in node properties |
| **Per-bot processing** | Not possible in one workflow | Each trigger node has independent downstream path |

---

## 5. Key Challenge: Dual Lifecycle

The fundamental difficulty is that always-active triggers have a **different lifecycle** from regular nodes:

| | Regular Node | Always-Active Trigger Node |
|---|---|---|
| **When it runs** | During workflow execution (ms) | Permanently, independent of execution |
| **How many instances** | One per execution | One per workflow (single-active across cluster) |
| **Ownership** | None — any worker runs it | Distributed lease — one instance owns it |
| **State** | Stateless between executions | Connection, heartbeat, message counters |
| **Crash handling** | Checkpoint + retry | Lease expiration + failover + message buffering |

### Two Modes for the Engine

The workflow engine would need to handle:

1. **Persistent mode (design-time)** — The trigger node is "always running", maintaining its connection, even when no execution is active. This mode is managed by `TriggerManagerService`.

2. **Execution mode (runtime)** — When a message arrives, a new execution starts from that trigger node and flows through the graph. The trigger node acts as a start node.

### Node Classification

```
NodeLifecycle:
  EPHEMERAL   — Runs only during execution (LLM, TRANSFORM, HTTP, etc.)
  PERSISTENT  — Runs continuously, spawns executions (TELEGRAM_BOT, SLACK_BOT, etc.)
  PASSIVE     — Listens but doesn't maintain connection (WEBHOOK, SCHEDULE)
```

---

## 6. Implementation Considerations

### 6.1 New Node Types

Add to `NodeType` enum:
```
TELEGRAM_BOT_TRIGGER    — Telegram bot listener (persistent)
SLACK_BOT_TRIGGER       — Slack bot listener (persistent)
DISCORD_BOT_TRIGGER     — Discord bot listener (persistent)
WHATSAPP_TRIGGER        — WhatsApp webhook listener (passive)
WEBHOOK_TRIGGER         — HTTP webhook listener (passive)
SCHEDULE_TRIGGER        — Cron schedule trigger (passive)
```

These replace both the current `START`/`HTTP_START`/`CHAT_START` nodes and the `WorkflowTriggerEntity`.

### 6.2 Node Configuration

Each trigger node stores connection config directly:
```json
{
  "credentialKey": "telegram-bot-prod",
  "pollingTimeout": 30,
  "allowedUpdateTypes": ["message", "callback_query"],
  "replyContext": true
}
```

### 6.3 Reply Context Propagation

When a trigger node starts an execution, it injects reply context into variables:
```json
{
  "_replyContext": {
    "platform": "telegram",
    "chatId": 123456,
    "threadId": null,
    "messageId": 789,
    "userId": 456
  }
}
```

A corresponding reply node (TELEGRAM_REPLY, SLACK_REPLY) reads `_replyContext` to send the response back to the same conversation.

### 6.4 Connection Status on Canvas

The frontend shows real-time connection status on trigger nodes:
- Green dot: CONNECTED
- Yellow dot: CONNECTING / RECONNECTING
- Red dot: ERROR / DISCONNECTED
- Gray dot: PAUSED (dev mode handoff)

### 6.5 Migration Path

1. Keep `WorkflowTriggerEntity` as the persistence layer (rename to `TriggerConnectionEntity`)
2. Create trigger node types that reference the connection entity
3. The node graph becomes the source of truth for routing
4. The connection entity manages the persistent connection lifecycle
5. Gradually deprecate the triggers panel in favor of canvas-only management

### 6.6 Existing Infrastructure Reuse

The following components remain unchanged:
- `TriggerConnector` interface and implementations (Telegram, Slack)
- `TriggerOwnershipService` (distributed locking)
- `TriggerMessageRouter` (message → execution)
- `ExecutionCheckpointService` (crash recovery)
- Dev/prod mode switching
- Message buffering

The change is primarily in **how the engine discovers and routes** — from implicit type matching to explicit graph edges.

---

## 7. Key Files Reference

| Component | File Path |
|-----------|-----------|
| Node types enum | `services/workflows/src/main/java/.../entity/enums/NodeType.java` |
| Trigger types enum | `services/workflows/src/main/java/.../entity/enums/TriggerType.java` |
| Trigger entity | `services/workflows/src/main/java/.../entity/WorkflowTriggerEntity.java` |
| Workflow engine | `services/workflows/src/main/java/.../engine/WorkflowEngine.java` |
| Start node selection | `WorkflowEngine.findStartNode()` (line ~553) |
| Trigger connector interface | `services/workflows/src/main/java/.../triggers/TriggerConnector.java` |
| Telegram connector | `services/workflows/src/main/java/.../triggers/TelegramConnector.java` |
| Slack connector | `services/workflows/src/main/java/.../triggers/SlackSocketConnector.java` |
| Message router | `services/workflows/src/main/java/.../triggers/TriggerMessageRouter.java` |
| Ownership service | `services/workflows/src/main/java/.../service/TriggerOwnershipService.java` |
| Manager service | `services/workflows/src/main/java/.../service/TriggerManagerService.java` |
| Trigger REST API | `services/workflows/src/main/java/.../api/rest/WorkflowTriggerResource.java` |
| Frontend workflow utils | `services/studio/src/utils/workflow-utils.ts` |
| Long-running triggers doc | `services/workflows/docs/LONG_RUNNING_TRIGGERS.md` |
