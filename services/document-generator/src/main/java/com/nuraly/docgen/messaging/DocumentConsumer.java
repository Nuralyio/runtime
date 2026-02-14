package com.nuraly.docgen.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.docgen.configuration.DocgenConfiguration;
import com.nuraly.docgen.entity.GenerationJobEntity;
import com.nuraly.docgen.service.DocumentService;
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
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class DocumentConsumer {

    private static final Logger LOGGER = Logger.getLogger(DocumentConsumer.class.getName());
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Inject
    DocgenConfiguration config;

    @Inject
    DocumentService documentService;

    @Inject
    DocumentProducer documentProducer;

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
            channel.queueDeclare(config.generateQueueName, true, false, false, null);

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                try {
                    String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    Map<String, Object> payload = objectMapper.readValue(message, Map.class);

                    UUID templateId = UUID.fromString((String) payload.get("templateId"));
                    Map<String, Object> data = (Map<String, Object>) payload.get("data");
                    String callbackId = (String) payload.get("callbackId");
                    String applicationId = (String) payload.get("applicationId");
                    String userId = (String) payload.get("userId");

                    GenerationJobEntity job = documentService.createJob(templateId, data, callbackId, applicationId, userId);
                    GenerationJobEntity result = documentService.processJob(job.id);

                    String fileUrl = null;
                    if (result.outputPath != null) {
                        fileUrl = "/api/v1/documents/files/" + Paths.get(result.outputPath).getFileName().toString();
                    }

                    documentProducer.publishResult(callbackId, result.status.name(), fileUrl, result.id, result.error);

                    channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
                } catch (Exception e) {
                    LOGGER.log(Level.WARNING, "Failed to process document generation message: " + e.getMessage(), e);
                    channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
                }
            };

            channel.basicConsume(config.generateQueueName, false, deliverCallback, consumerTag -> {});

            LOGGER.info("Connected to RabbitMQ and consuming from queue: " + config.generateQueueName);
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to connect to RabbitMQ: " + e.getMessage() + ". Document consuming disabled.");
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
