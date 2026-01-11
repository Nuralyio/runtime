package com.nuraly.workflows.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Optional;

@Singleton
public class Configuration {

    // Functions Service
    @ConfigProperty(name = "nuraly.functions.service.url", defaultValue = "http://functions:7001")
    public String functionsServiceUrl;

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
}
