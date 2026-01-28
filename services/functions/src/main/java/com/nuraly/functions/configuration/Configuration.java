package com.nuraly.functions.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Optional;

@Singleton
public class Configuration {

    // Function templates
    @ConfigProperty(name = "nuraly.functions.template.base.path")
    public String FunctionsBasePath;

    // RabbitMQ Configuration
    @ConfigProperty(name = "rabbitmq.host", defaultValue = "rabbitmq")
    public String rabbitmqHost;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    public int rabbitmqPort;

    @ConfigProperty(name = "rabbitmq.username")
    public Optional<String> rabbitmqUsername;

    @ConfigProperty(name = "rabbitmq.password")
    public Optional<String> rabbitmqPassword;

    @ConfigProperty(name = "rabbitmq.functions.execute-queue", defaultValue = "functions.execute")
    public String functionsExecuteQueue;

    @ConfigProperty(name = "rabbitmq.functions.results-queue", defaultValue = "functions.results")
    public String functionsResultsQueue;

    @ConfigProperty(name = "rabbitmq.functions.dlq-queue", defaultValue = "functions.dlq")
    public String functionsDlqQueue;

    @ConfigProperty(name = "rabbitmq.functions.result-timeout-ms", defaultValue = "35000")
    public long functionsResultTimeoutMs;

    // Deno execution settings
    @ConfigProperty(name = "nuraly.deno.execution-timeout-ms", defaultValue = "30000")
    public long denoExecutionTimeoutMs;

    @ConfigProperty(name = "nuraly.deno.default-allowed-hosts", defaultValue = "esm.sh,cdn.jsdelivr.net,cdn.skypack.dev,unpkg.com,esm.run")
    public String denoDefaultAllowedHosts;
}
