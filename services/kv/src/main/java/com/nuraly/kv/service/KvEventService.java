package com.nuraly.kv.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class KvEventService {

    private static final Logger LOG = Logger.getLogger(KvEventService.class);

    @ConfigProperty(name = "rabbitmq.host", defaultValue = "localhost")
    String host;

    @ConfigProperty(name = "rabbitmq.port", defaultValue = "5672")
    int port;

    @ConfigProperty(name = "rabbitmq.username", defaultValue = "guest")
    String username;

    @ConfigProperty(name = "rabbitmq.password", defaultValue = "guest")
    String password;

    @ConfigProperty(name = "rabbitmq.queue.events", defaultValue = "kv-events")
    String queueName;

    private Connection connection;
    private Channel channel;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    void init() {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(host);
            factory.setPort(port);
            factory.setUsername(username);
            factory.setPassword(password);

            connection = factory.newConnection();
            channel = connection.createChannel();
            channel.queueDeclare(queueName, true, false, false, null);

            LOG.info("Connected to RabbitMQ and declared queue: " + queueName);
        } catch (Exception e) {
            LOG.warn("Failed to connect to RabbitMQ: " + e.getMessage() + ". Events will not be published.");
        }
    }

    @PreDestroy
    void cleanup() {
        try {
            if (channel != null && channel.isOpen()) {
                channel.close();
            }
            if (connection != null && connection.isOpen()) {
                connection.close();
            }
        } catch (Exception e) {
            LOG.warn("Error closing RabbitMQ connection", e);
        }
    }

    public void publishEntryCreated(UUID namespaceId, UUID entryId, String keyPath) {
        publishEvent("kv.entry.created", namespaceId, entryId, keyPath, null);
    }

    public void publishEntryUpdated(UUID namespaceId, UUID entryId, String keyPath) {
        publishEvent("kv.entry.updated", namespaceId, entryId, keyPath, null);
    }

    public void publishEntryDeleted(UUID namespaceId, UUID entryId, String keyPath) {
        publishEvent("kv.entry.deleted", namespaceId, entryId, keyPath, null);
    }

    public void publishSecretRotated(UUID namespaceId, UUID entryId, String keyPath, Long newVersion) {
        publishEvent("kv.secret.rotated", namespaceId, entryId, keyPath, newVersion);
    }

    public void publishNamespaceCreated(UUID namespaceId, String name) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "kv.namespace.created");
        event.put("namespaceId", namespaceId.toString());
        event.put("name", name);
        event.put("timestamp", System.currentTimeMillis());
        publishMessage(event);
    }

    public void publishNamespaceDeleted(UUID namespaceId, String name) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", "kv.namespace.deleted");
        event.put("namespaceId", namespaceId.toString());
        event.put("name", name);
        event.put("timestamp", System.currentTimeMillis());
        publishMessage(event);
    }

    private void publishEvent(String type, UUID namespaceId, UUID entryId, String keyPath, Long version) {
        Map<String, Object> event = new HashMap<>();
        event.put("type", type);
        event.put("namespaceId", namespaceId != null ? namespaceId.toString() : null);
        event.put("entryId", entryId != null ? entryId.toString() : null);
        event.put("keyPath", keyPath);
        event.put("version", version);
        event.put("timestamp", System.currentTimeMillis());
        publishMessage(event);
    }

    private void publishMessage(Map<String, Object> event) {
        if (channel == null || !channel.isOpen()) {
            LOG.debug("RabbitMQ channel not available, skipping event: " + event.get("type"));
            return;
        }

        try {
            String message = objectMapper.writeValueAsString(event);
            channel.basicPublish("", queueName, null, message.getBytes());
            LOG.debug("Published event: " + event.get("type"));
        } catch (Exception e) {
            LOG.warn("Failed to publish event: " + e.getMessage());
        }
    }
}
