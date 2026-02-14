package com.nuraly.docgen.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.docgen.configuration.DocgenConfiguration;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class DocumentProducer {

    private static final Logger LOG = Logger.getLogger(DocumentProducer.class);

    @Inject
    DocgenConfiguration config;

    private Connection connection;
    private Channel channel;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    void init() {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(config.rabbitmqHost);
            factory.setPort(config.rabbitmqPort);
            factory.setUsername(config.rabbitmqUsername);
            factory.setPassword(config.rabbitmqPassword);

            connection = factory.newConnection();
            channel = connection.createChannel();
            channel.queueDeclare(config.readyQueueName, true, false, false, null);

            LOG.info("Connected to RabbitMQ and declared queue: " + config.readyQueueName);
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

    public void publishResult(String callbackId, String status, String fileUrl, UUID jobId, String error) {
        if (channel == null || !channel.isOpen()) {
            LOG.debug("RabbitMQ channel not available, skipping document.ready event");
            return;
        }

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("callbackId", callbackId);
            message.put("status", status);
            message.put("fileUrl", fileUrl);
            message.put("jobId", jobId != null ? jobId.toString() : null);
            message.put("error", error);
            message.put("timestamp", System.currentTimeMillis());

            String json = objectMapper.writeValueAsString(message);
            channel.basicPublish("", config.readyQueueName, null, json.getBytes());
            LOG.debugf("Published document.ready event for callbackId: %s", callbackId);
        } catch (Exception e) {
            LOG.warnf("Failed to publish document.ready event: %s", e.getMessage());
        }
    }
}
