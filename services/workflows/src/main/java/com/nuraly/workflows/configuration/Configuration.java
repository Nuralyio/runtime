package com.nuraly.workflows.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Optional;

@Singleton
public class Configuration {

    // Functions Service
    @ConfigProperty(name = "nuraly.functions.service.url", defaultValue = "http://functions:7001")
    public String functionsServiceUrl;

    // KV Service
    @ConfigProperty(name = "nuraly.kv.service.url", defaultValue = "http://kv:7003")
    public String kvServiceUrl;

    // Conduit - Database Connection & Query Service
    @ConfigProperty(name = "nuraly.conduit.service.url", defaultValue = "http://conduit:7004")
    public String conduitServiceUrl;

    // RabbitMQ
    @ConfigProperty(name = "rabbitmq.host", defaultValue = "rabbitmq")
    public String rabbitmqHost;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    public int rabbitmqPort;

    @ConfigProperty(name = "rabbitmq.username", defaultValue = "guest")
    public Optional<String> rabbitmqUsername;

    @ConfigProperty(name = "rabbitmq.password", defaultValue = "guest")
    public Optional<String> rabbitmqPassword;

    @ConfigProperty(name = "rabbitmq.queue.events", defaultValue = "workflow-events")
    public String rabbitmqEventsQueue;

    @ConfigProperty(name = "rabbitmq.queue.executions", defaultValue = "workflow-executions")
    public String rabbitmqExecutionsQueue;

    @ConfigProperty(name = "rabbitmq.exchange.workflows", defaultValue = "workflows-exchange")
    public String rabbitmqExchange;

    @ConfigProperty(name = "rabbitmq.routing-key.executions", defaultValue = "workflow.execute")
    public String rabbitmqExecutionsRoutingKey;

    // Execution Settings
    @ConfigProperty(name = "workflows.execution.timeout.default", defaultValue = "300000")
    public long executionTimeoutDefault;

    @ConfigProperty(name = "workflows.execution.max-concurrent", defaultValue = "100")
    public int maxConcurrentExecutions;

    @ConfigProperty(name = "workflows.node.retry.max", defaultValue = "3")
    public int nodeRetryMax;

    @ConfigProperty(name = "workflows.node.retry.delay", defaultValue = "1000")
    public int nodeRetryDelay;

    // Webhook Base URL
    @ConfigProperty(name = "workflows.webhook.base-url", defaultValue = "http://localhost:7002")
    public String webhookBaseUrl;

    // Synchronous HTTP Workflow Settings
    @ConfigProperty(name = "workflows.http.sync.enabled", defaultValue = "true")
    public boolean httpSyncEnabled;

    @ConfigProperty(name = "workflows.http.sync.timeout", defaultValue = "30000")
    public long httpSyncTimeout;

    // Dev Mode - allows triggering draft workflows
    @ConfigProperty(name = "workflows.dev-mode", defaultValue = "false")
    public boolean devMode;

    // Context Memory Settings
    @ConfigProperty(name = "workflows.memory.storage", defaultValue = "memory")
    public String memoryStorage; // "memory" or "redis"

    @ConfigProperty(name = "workflows.memory.redis.key-prefix", defaultValue = "workflow:memory:")
    public String memoryRedisKeyPrefix;

    @ConfigProperty(name = "workflows.memory.ttl-seconds", defaultValue = "86400")
    public long memoryTtlSeconds; // Default 24 hours

    // Service Queues (OCR, Crawl, etc.)
    @ConfigProperty(name = "rabbitmq.queue.ocr", defaultValue = "ocr-requests")
    public String rabbitmqOcrQueue;

    @ConfigProperty(name = "rabbitmq.routing-key.ocr", defaultValue = "service.ocr")
    public String rabbitmqOcrRoutingKey;

    @ConfigProperty(name = "rabbitmq.queue.crawl", defaultValue = "crawl-requests")
    public String rabbitmqCrawlQueue;

    @ConfigProperty(name = "rabbitmq.routing-key.crawl", defaultValue = "service.crawl")
    public String rabbitmqCrawlRoutingKey;

    @ConfigProperty(name = "workflows.service.timeout", defaultValue = "120000")
    public long serviceTimeout; // Default 2 minutes

    // =====================================================
    // Persistent Trigger Settings
    // =====================================================

    // Instance identification for cluster awareness
    @ConfigProperty(name = "workflows.instance.id", defaultValue = "${HOSTNAME:localhost}")
    public String instanceId;

    // Trigger ownership lease duration (how long before an orphan can be claimed)
    @ConfigProperty(name = "workflows.trigger.lease.duration-ms", defaultValue = "30000")
    public long triggerLeaseDurationMs;

    // Trigger heartbeat interval (how often to renew leases)
    @ConfigProperty(name = "workflows.trigger.heartbeat.interval-ms", defaultValue = "10000")
    public long triggerHeartbeatIntervalMs;

    // Orphan check interval (how often to look for expired leases)
    @ConfigProperty(name = "workflows.trigger.orphan-check.interval-ms", defaultValue = "15000")
    public long triggerOrphanCheckIntervalMs;

    // Message buffer max size per trigger
    @ConfigProperty(name = "workflows.trigger.buffer.max-size", defaultValue = "10000")
    public int triggerBufferMaxSize;

    // Message buffer TTL (how long to keep buffered messages)
    @ConfigProperty(name = "workflows.trigger.buffer.ttl-ms", defaultValue = "86400000")
    public long triggerBufferTtlMs;

    // Dev mode max duration (prevents forgetting to release dev mode)
    @ConfigProperty(name = "workflows.trigger.dev-mode.max-duration-ms", defaultValue = "3600000")
    public long devModeMaxDurationMs;

    // Auto-release dev mode when expires
    @ConfigProperty(name = "workflows.trigger.dev-mode.auto-release", defaultValue = "true")
    public boolean devModeAutoRelease;

    // Telegram connector settings
    @ConfigProperty(name = "workflows.trigger.telegram.polling-timeout-s", defaultValue = "30")
    public int telegramPollingTimeoutSeconds;

    // Slack connector settings
    @ConfigProperty(name = "workflows.trigger.slack.reconnect-delay-ms", defaultValue = "5000")
    public long slackReconnectDelayMs;
}
