package com.nuraly.journal.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.journal.configuration.JournalConfiguration;
import com.nuraly.journal.dto.LogRequest;
import com.nuraly.journal.service.LogService;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import io.quarkus.runtime.StartupEvent;
import jakarta.annotation.PreDestroy;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class LogConsumer {

    private static final Logger LOGGER = Logger.getLogger(LogConsumer.class.getName());
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Inject
    JournalConfiguration config;

    @Inject
    LogService logService;

    private Connection connection;
    private Channel channel;

    void onStart(@Observes StartupEvent ev) {
        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost(config.rabbitmqHost);
            factory.setPort(config.rabbitmqPort);
            factory.setUsername(config.rabbitmqUsername);
            factory.setPassword(config.rabbitmqPassword);

            connection = factory.newConnection();
            channel = connection.createChannel();
            channel.queueDeclare(config.logsQueueName, true, false, false, null);

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    LogRequest request = objectMapper.readValue(message, LogRequest.class);
                    logService.createLog(request);
                    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to process log message: " + e.getMessage(), e);
                    channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
                }
            };

            channel.basicConsume(config.logsQueueName, false, deliverCallback, consumerTag -> {});

            LOGGER.info("Connected to RabbitMQ and consuming from queue: " + config.logsQueueName);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to connect to RabbitMQ: " + e.getMessage() + ". Log consuming disabled.");
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
            LOGGER.log(Level.WARNING, "Error closing RabbitMQ connection", e);
        }
    }
}
