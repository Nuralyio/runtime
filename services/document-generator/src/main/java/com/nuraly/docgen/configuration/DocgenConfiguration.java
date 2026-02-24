package com.nuraly.docgen.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Singleton
public class DocgenConfiguration {

    @ConfigProperty(name = "rabbitmq.host", defaultValue = "rabbitmq")
    public String rabbitmqHost;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    public int rabbitmqPort;

    @ConfigProperty(name = "rabbitmq.username", defaultValue = "guest")
    public String rabbitmqUsername;

    @ConfigProperty(name = "rabbitmq.password", defaultValue = "guest")
    public String rabbitmqPassword;

    @ConfigProperty(name = "rabbitmq.queue.generate", defaultValue = "document.generate")
    public String generateQueueName;

    @ConfigProperty(name = "rabbitmq.queue.ready", defaultValue = "document.ready")
    public String readyQueueName;

    @ConfigProperty(name = "docgen.upload.path", defaultValue = "/app/uploads")
    public String uploadPath;

    @ConfigProperty(name = "permission.api.base-url", defaultValue = "http://api:8000/api")
    public String permissionApiBaseUrl;

    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    public boolean permissionsEnabled;
}
