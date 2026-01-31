package com.nuraly.crawler.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.List;
import java.util.Optional;

@Singleton
public class CrawlerConfiguration {

    // RabbitMQ Configuration
    @ConfigProperty(name = "rabbitmq.host", defaultValue = "rabbitmq")
    public String rabbitmqHost;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    public int rabbitmqPort;

    @ConfigProperty(name = "rabbitmq.username", defaultValue = "guest")
    public String rabbitmqUsername;

    @ConfigProperty(name = "rabbitmq.password", defaultValue = "guest")
    public String rabbitmqPassword;

    @ConfigProperty(name = "rabbitmq.queue", defaultValue = "crawl-requests")
    public String rabbitmqQueue;

    // Browserless Configuration (optional, for JS rendering)
    @ConfigProperty(name = "browserless.url")
    public Optional<String> browserlessUrl;

    // Crawler Settings
    @ConfigProperty(name = "crawler.timeout-seconds", defaultValue = "30")
    public int timeoutSeconds;

    @ConfigProperty(name = "crawler.delay-ms", defaultValue = "500")
    public int delayMs;

    @ConfigProperty(name = "crawler.user-agent", defaultValue = "NuralyBot/1.0 (+https://nuraly.io)")
    public String userAgent;

    // Default selectors to remove from pages
    @ConfigProperty(name = "crawler.default-remove-selectors", defaultValue = "nav,footer,header,script,style,noscript,iframe,aside")
    public List<String> defaultRemoveSelectors;

    // SSRF Protection
    @ConfigProperty(name = "crawler.block-private-ips", defaultValue = "true")
    public boolean blockPrivateIps;

    @ConfigProperty(name = "crawler.block-localhost", defaultValue = "true")
    public boolean blockLocalhost;

    @ConfigProperty(name = "crawler.allowed-schemes", defaultValue = "http,https")
    public List<String> allowedSchemes;
}
