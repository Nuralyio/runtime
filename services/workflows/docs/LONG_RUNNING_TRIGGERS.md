# Long-Running Trigger Nodes Architecture

## Overview

This document describes the architecture for implementing long-running, always-active trigger nodes (e.g., Telegram bot polling, Slack Socket Mode) with support for single-active-connection constraints and dev/prod switching.

## Problem Statement

### Challenges

1. **Single Active Connection Constraint**: Some providers (Telegram, Slack) allow only ONE active webhook/connection per bot token
2. **Cluster Awareness**: In multi-instance deployments, only one instance should own the connection
3. **Dev/Prod Switching**: Testing dev workflows must pause production triggers
4. **Graceful Handoff**: Ownership transfers must not lose messages

### Solution

A **Persistent Trigger Framework** that manages:
- Distributed ownership via database locks with lease expiration
- Automatic failover when instances crash
- Message buffering during handoffs
- Dev mode with automatic timeout and production resume

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TriggerManagerService                            │
│   - Orchestrates lifecycle    - Manages ownership    - Dev/Prod switch  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│TelegramConnector│     │SlackSocketConnector │     │DiscordConnector │
│  - Long polling │     │  - WebSocket        │     │  - Gateway WS   │
└────────┬────────┘     └──────────┬──────────┘     └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │     TriggerMessageRouter      │
                    │  → RabbitMQ → WorkflowEngine │
                    └──────────────────────────────┘
```

### State Machine

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
                                                       │
                                               handoff_complete
                                                       ▼
                                               DISCONNECTED
```

---

## Database Schema

### New Tables

#### `trigger_ownership`

Tracks which instance owns which exclusive trigger resource:

```sql
CREATE TABLE trigger_ownership (
    id UUID PRIMARY KEY,
    resource_key VARCHAR(255) UNIQUE NOT NULL,  -- "telegram:bot_hash" or "slack:app_hash"
    active_trigger_id UUID REFERENCES workflow_triggers(id),
    owner_instance_id VARCHAR(255),
    lease_expires_at TIMESTAMP NOT NULL,
    last_heartbeat_at TIMESTAMP,
    connection_state VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED',
    state_reason VARCHAR(500),
    priority_trigger_id UUID,  -- For dev mode override
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_trigger_ownership_resource ON trigger_ownership(resource_key);
CREATE INDEX idx_trigger_ownership_instance ON trigger_ownership(owner_instance_id);
CREATE INDEX idx_trigger_ownership_expires ON trigger_ownership(lease_expires_at);
```

### Modified Tables

#### `workflow_triggers` (additions)

```sql
ALTER TABLE workflow_triggers ADD COLUMN credential_key VARCHAR(255);
ALTER TABLE workflow_triggers ADD COLUMN environment VARCHAR(50) DEFAULT 'production';
ALTER TABLE workflow_triggers ADD COLUMN is_primary BOOLEAN DEFAULT false;
ALTER TABLE workflow_triggers ADD COLUMN desired_state VARCHAR(50) DEFAULT 'ACTIVE';
ALTER TABLE workflow_triggers ADD COLUMN buffer_queue VARCHAR(255);
```

---

## New Enums

### `ConnectionState`

```java
public enum ConnectionState {
    DISCONNECTED,      // Not connected
    CONNECTING,        // Attempting to connect
    CONNECTED,         // Active and receiving messages
    PAUSED,            // Intentionally paused (dev mode, manual)
    HANDOFF_PENDING,   // Transferring to another trigger
    ERROR              // Connection error, will retry
}
```

### `TriggerDesiredState`

```java
public enum TriggerDesiredState {
    ACTIVE,    // Trigger should be running
    PAUSED,    // Trigger should be paused (keeps credential reservation)
    DISABLED   // Trigger fully disabled
}
```

### `TriggerType` (additions)

```java
// New persistent trigger types
TELEGRAM_BOT,     // Telegram long-polling or webhook
SLACK_SOCKET,     // Slack Socket Mode (WebSocket)
DISCORD_BOT,      // Discord Gateway (WebSocket)
WHATSAPP_WEBHOOK, // WhatsApp Business API
CUSTOM_WEBSOCKET  // Generic WebSocket listener
```

---

## Core Interfaces

### `TriggerConnector`

```java
public interface TriggerConnector {
    Set<TriggerType> getSupportedTypes();
    String getResourceKey(WorkflowTriggerEntity trigger);
    CompletableFuture<Void> connect(WorkflowTriggerEntity trigger, TriggerMessageHandler handler);
    CompletableFuture<Void> disconnect(WorkflowTriggerEntity trigger, WorkflowTriggerEntity handoffTarget);
    boolean isConnected(WorkflowTriggerEntity trigger);
    HealthStatus checkHealth(WorkflowTriggerEntity trigger);
    ValidationResult validateConfiguration(JsonNode configuration);
}
```

### `TriggerMessageHandler`

```java
@FunctionalInterface
public interface TriggerMessageHandler {
    CompletableFuture<Void> handleMessage(
        WorkflowTriggerEntity trigger,
        JsonNode message,
        Map<String, Object> metadata
    );
}
```

---

## Dev/Prod Switching Flow

### The Problem

Telegram (and similar providers) only allow ONE active connection per bot token. If production workflow is using the bot, you cannot test a dev workflow without disconnecting production.

### The Solution

```
┌────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Production is running                                          │
│  ┌──────────────┐                                                       │
│  │ PROD Trigger │ ──── Connected to Telegram Bot ────► Messages flow    │
│  │ (CONNECTED)  │                                                       │
│  └──────────────┘                                                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                         POST /triggers/{devId}/dev-mode
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Dev mode requested                                             │
│  ┌──────────────┐    ┌───────────┐    ┌──────────────┐                 │
│  │ PROD Trigger │ ►► │  HANDOFF  │ ►► │ DEV Trigger  │                 │
│  │  (PAUSED)    │    │ messages  │    │ (CONNECTED)  │                 │
│  └──────────────┘    │ buffered  │    └──────────────┘                 │
│                      └───────────┘                                      │
│  Production messages → Buffer Queue (RabbitMQ)                          │
│  New messages → Dev workflow                                            │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                         DELETE /triggers/{devId}/dev-mode
                         (or auto-expire after timeout)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Dev mode released                                              │
│  ┌──────────────┐                                                       │
│  │ PROD Trigger │ ──── Reconnected to Telegram ────► Messages flow      │
│  │ (CONNECTED)  │                                                       │
│  └──────────────┘                                                       │
│  Buffered messages → Replayed to production workflow                    │
└────────────────────────────────────────────────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/triggers/{id}/activate` | Start persistent connection |
| POST | `/triggers/{id}/deactivate` | Stop connection gracefully |
| POST | `/triggers/{id}/dev-mode?duration=3600000` | Enable dev mode (pause prod, start dev) |
| DELETE | `/triggers/{id}/dev-mode` | Release dev mode (resume prod) |
| GET | `/triggers/{id}/status` | Get connection state & health |
| GET | `/trigger-resources` | List all resources & ownership |
| DELETE | `/trigger-resources/{key}` | Force release ownership (admin) |

---

## Cluster Failover

### Lease-Based Ownership

Each instance must send heartbeats to renew its lease. If heartbeats stop (instance crash), another instance can claim the orphaned resource.

```
Instance A (owns telegram:bot_123)          Instance B
     │                                          │
     │  heartbeat every 10s                     │
     │  lease = 30s                             │
     ▼                                          │
   CRASH!                                       │
     │                                          │
     │  ... 30 seconds pass ...                 │
     │                                          ▼
     │                              Scheduled job: claimOrphanedResources()
     │                                          │
     │                              Find expired lease for telegram:bot_123
     │                                          │
     │                              Claim ownership + activate trigger
     │                                          │
     └──────────── telegram:bot_123 now on Instance B ◄─────────────────┘
```

### Ownership Acquisition Query

```sql
-- Non-blocking distributed lock using SKIP LOCKED
SELECT * FROM trigger_ownership
WHERE resource_key = :resourceKey
  AND (lease_expires_at < NOW() OR owner_instance_id IS NULL)
FOR UPDATE SKIP LOCKED;
```

---

## Configuration

### Application Properties

```properties
# Instance identification
workflows.instance.id=${HOSTNAME:${POD_NAME:localhost}}

# Trigger ownership settings
workflows.trigger.lease.duration-ms=30000
workflows.trigger.heartbeat.interval-ms=10000
workflows.trigger.orphan-check.interval-ms=15000

# Message buffering
workflows.trigger.buffer.max-size=10000
workflows.trigger.buffer.ttl-ms=86400000

# Dev mode
workflows.trigger.dev-mode.max-duration-ms=3600000
workflows.trigger.dev-mode.auto-release=true

# Telegram connector
workflows.trigger.telegram.polling-timeout-s=30

# Slack connector
workflows.trigger.slack.reconnect-delay-ms=5000
```

---

## File Structure

### New Files

```
src/main/java/com/nuraly/workflows/
├── entity/
│   ├── TriggerOwnershipEntity.java
│   └── enums/
│       ├── ConnectionState.java
│       └── TriggerDesiredState.java
├── service/
│   ├── TriggerManagerService.java
│   └── TriggerOwnershipService.java
├── triggers/
│   ├── TriggerConnector.java
│   ├── TriggerMessageHandler.java
│   ├── TriggerMessageRouter.java
│   ├── ActiveTrigger.java
│   ├── HealthStatus.java
│   ├── ValidationResult.java
│   └── connectors/
│       ├── TelegramConnector.java
│       └── SlackSocketConnector.java
└── dto/
    ├── TriggerActivationResult.java
    ├── DevModeResult.java
    ├── TriggerStatusDTO.java
    └── TriggerResourceDTO.java
```

### Modified Files

```
src/main/java/com/nuraly/workflows/
├── entity/
│   ├── WorkflowTriggerEntity.java      # Add new fields
│   └── enums/
│       └── TriggerType.java            # Add new types
├── dto/
│   └── WorkflowTriggerDTO.java         # Add new fields
├── configuration/
│   └── Configuration.java              # Add new properties
└── api/rest/
    └── WorkflowTriggerResource.java    # Add new endpoints
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Add `ConnectionState` enum
- [ ] Add `TriggerDesiredState` enum
- [ ] Add new trigger types to `TriggerType` enum
- [ ] Create `TriggerOwnershipEntity`
- [ ] Extend `WorkflowTriggerEntity` with new fields
- [ ] Update DTOs

### Phase 2: Core Framework
- [ ] Create `TriggerConnector` interface
- [ ] Create `TriggerMessageHandler` interface
- [ ] Create `TriggerMessageRouter`
- [ ] Create `TriggerOwnershipService`
- [ ] Create `TriggerManagerService`
- [ ] Add heartbeat scheduler
- [ ] Add orphan claiming scheduler

### Phase 3: Telegram Connector
- [ ] Implement `TelegramConnector`
- [ ] Long-polling mode
- [ ] Webhook mode
- [ ] Message parsing and routing
- [ ] Error handling and retry logic

### Phase 4: Slack Socket Connector
- [ ] Implement `SlackSocketConnector`
- [ ] WebSocket connection management
- [ ] Socket Mode event handling
- [ ] Reconnection logic

### Phase 5: API & Dev Mode
- [ ] Add REST endpoints
- [ ] Implement dev mode switching
- [ ] Message buffering
- [ ] Automatic timeout and resume

### Phase 6: Production Hardening
- [ ] Comprehensive error handling
- [ ] Metrics and monitoring
- [ ] Admin tools
- [ ] Load testing

---

## Usage Examples

### Creating a Telegram Trigger

```json
POST /api/v1/workflows/{workflowId}/triggers
{
  "name": "Production Telegram Bot",
  "type": "TELEGRAM_BOT",
  "enabled": true,
  "environment": "production",
  "isPrimary": true,
  "configuration": {
    "botToken": "${secrets.TELEGRAM_BOT_TOKEN}",
    "mode": "polling",
    "allowedUpdates": ["message", "callback_query"]
  }
}
```

### Enabling Dev Mode

```bash
# Pause production, activate dev trigger for 1 hour
curl -X POST "/api/v1/triggers/{devTriggerId}/dev-mode?duration=3600000"

# Response
{
  "devTriggerId": "...",
  "pausedProductionTriggerId": "...",
  "success": true,
  "expiresAt": "2024-01-15T15:00:00Z",
  "message": "Dev mode enabled. Production trigger paused."
}
```

### Checking Trigger Status

```bash
curl -X GET "/api/v1/triggers/{triggerId}/status"

# Response
{
  "triggerId": "...",
  "type": "TELEGRAM_BOT",
  "desiredState": "ACTIVE",
  "connectionState": "CONNECTED",
  "ownerInstance": "workflow-app-pod-1",
  "lastHeartbeat": "2024-01-15T14:05:00Z",
  "connectedSince": "2024-01-15T10:00:00Z",
  "messagesReceived": 1523,
  "lastMessageAt": "2024-01-15T14:04:55Z",
  "health": "HEALTHY"
}
```
