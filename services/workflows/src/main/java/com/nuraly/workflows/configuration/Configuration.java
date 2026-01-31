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
}
