package com.nuraly.crawler.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.crawler.configuration.CrawlerConfiguration;
import com.nuraly.crawler.dto.CrawlRequestDTO;
import com.nuraly.crawler.dto.CrawlResponseDTO;
import com.nuraly.crawler.dto.CrawlResultDTO;
import com.nuraly.crawler.dto.CrawledPageDTO;
import com.nuraly.crawler.service.CrawlerService;
import com.rabbitmq.client.*;
import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@ApplicationScoped
public class RabbitMQConsumer {

    private static final Logger LOG = Logger.getLogger(RabbitMQConsumer.class);

    @Inject
    CrawlerConfiguration config;

    @Inject
    CrawlerService crawlerService;

    @Inject
    ObjectMapper objectMapper;

    private Connection connection;
    private Channel channel;

    void onStart(@Observes StartupEvent ev) {
        LOG.info("Starting Crawler Service...");
        try {
            connectAndConsume();
        } catch (Exception e) {
            LOG.errorf(e, "Failed to start RabbitMQ consumer");
        }
    }

    void onStop(@Observes ShutdownEvent ev) {
        LOG.info("Stopping Crawler Service...");
        try {
            if (channel != null && channel.isOpen()) {
                channel.close();
            }
            if (connection != null && connection.isOpen()) {
                connection.close();
            }
        } catch (Exception e) {
            LOG.warnf(e, "Error closing RabbitMQ connection");
        }
    }

    private void connectAndConsume() throws IOException, TimeoutException {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(config.rabbitmqHost);
        factory.setPort(config.rabbitmqPort);
        factory.setUsername(config.rabbitmqUsername);
        factory.setPassword(config.rabbitmqPassword);
        factory.setAutomaticRecoveryEnabled(true);

        connection = factory.newConnection();
        channel = connection.createChannel();

        // Declare queue
        channel.queueDeclare(config.rabbitmqQueue, true, false, false, null);

        // Set prefetch count to 1
        channel.basicQos(1);

        LOG.infof("Connected to RabbitMQ at %s:%d", config.rabbitmqHost, config.rabbitmqPort);
        LOG.infof("Listening on queue: %s", config.rabbitmqQueue);

        // Start consuming
        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            processMessage(delivery);
        };

        channel.basicConsume(config.rabbitmqQueue, false, deliverCallback, consumerTag -> {});
    }

    private void processMessage(Delivery delivery) {
        String requestId = null;
        CrawlResponseDTO response;

        try {
            String body = new String(delivery.getBody(), StandardCharsets.UTF_8);
            JsonNode messageNode = objectMapper.readTree(body);

            requestId = messageNode.has("requestId") ? messageNode.get("requestId").asText() : null;
            LOG.infof("Received crawl request: %s", requestId != null ? requestId : "unknown");

            // Parse the nested payload
            String payloadStr = messageNode.has("payload") ? messageNode.get("payload").asText() : "{}";
            JsonNode payloadNode = objectMapper.readTree(payloadStr);

            // Build crawl request
            CrawlRequestDTO request = CrawlRequestDTO.builder()
                    .requestId(requestId)
                    .urls(parseStringList(payloadNode, "urls"))
                    .maxDepth(payloadNode.has("max_depth") ? payloadNode.get("max_depth").asInt() : 1)
                    .maxPages(payloadNode.has("max_pages") ? payloadNode.get("max_pages").asInt() : 10)
                    .sameDomainOnly(payloadNode.has("same_domain_only") ? payloadNode.get("same_domain_only").asBoolean() : true)
                    .renderJs(payloadNode.has("render_js") ? payloadNode.get("render_js").asBoolean() : false)
                    .includePatterns(parseStringList(payloadNode, "include_patterns"))
                    .excludePatterns(parseStringList(payloadNode, "exclude_patterns"))
                    .extractSelectors(parseStringMap(payloadNode, "extract_selectors"))
                    .removeSelectors(parseStringList(payloadNode, "remove_selectors"))
                    .workflowId(messageNode.has("workflowId") ? messageNode.get("workflowId").asText() : null)
                    .userId(messageNode.has("userId") ? messageNode.get("userId").asText() : null)
                    .isolationKey(messageNode.has("isolationKey") ? messageNode.get("isolationKey").asText() : null)
                    .build();

            // Perform crawl
            CrawlResultDTO result = crawlerService.crawl(request);

            // Build response
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("pages", result.getPages().stream()
                    .map(this::pageToMap)
                    .toList());
            payloadMap.put("total_pages", result.getTotalPages());
            payloadMap.put("total_characters", result.getTotalCharacters());
            payloadMap.put("errors", result.getErrors());

            response = CrawlResponseDTO.builder()
                    .requestId(requestId)
                    .serviceType("crawl")
                    .success(true)
                    .payload(objectMapper.writeValueAsString(payloadMap))
                    .processedAt(Instant.now().toString())
                    .build();

            LOG.infof("Crawl completed: %s, pages=%d", requestId, result.getTotalPages());

        } catch (Exception e) {
            LOG.errorf(e, "Error processing crawl request");
            response = CrawlResponseDTO.builder()
                    .requestId(requestId)
                    .serviceType("crawl")
                    .success(false)
                    .errorMessage(e.getMessage())
                    .processedAt(Instant.now().toString())
                    .build();
        }

        // Send reply if replyTo is specified
        AMQP.BasicProperties props = delivery.getProperties();
        String replyTo = props.getReplyTo();
        String correlationId = props.getCorrelationId();

        if (replyTo != null && !replyTo.isBlank()) {
            try {
                String responseBody = objectMapper.writeValueAsString(response);

                AMQP.BasicProperties replyProps = new AMQP.BasicProperties.Builder()
                        .contentType("application/json")
                        .correlationId(correlationId)
                        .deliveryMode(2) // Persistent
                        .build();

                channel.basicPublish("", replyTo, replyProps, responseBody.getBytes(StandardCharsets.UTF_8));
                LOG.infof("Sent reply to %s, correlationId=%s", replyTo, correlationId);

            } catch (Exception e) {
                LOG.errorf(e, "Failed to send reply");
            }
        }

        // Acknowledge message
        try {
            channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
        } catch (IOException e) {
            LOG.errorf(e, "Failed to acknowledge message");
        }
    }

    private List<String> parseStringList(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) {
            return null;
        }
        JsonNode arrayNode = node.get(field);
        if (!arrayNode.isArray()) {
            return null;
        }
        return java.util.stream.StreamSupport.stream(arrayNode.spliterator(), false)
                .map(JsonNode::asText)
                .toList();
    }

    private Map<String, String> parseStringMap(JsonNode node, String field) {
        if (!node.has(field) || node.get(field).isNull()) {
            return null;
        }
        JsonNode mapNode = node.get(field);
        if (!mapNode.isObject()) {
            return null;
        }
        Map<String, String> result = new HashMap<>();
        mapNode.fields().forEachRemaining(entry -> result.put(entry.getKey(), entry.getValue().asText()));
        return result;
    }

    private Map<String, Object> pageToMap(CrawledPageDTO page) {
        Map<String, Object> map = new HashMap<>();
        map.put("url", page.getUrl());
        map.put("title", page.getTitle());
        map.put("content", page.getContent());
        map.put("description", page.getDescription());
        map.put("character_count", page.getCharacterCount());
        map.put("crawled_at", page.getCrawledAt());
        map.put("links", page.getLinks());
        map.put("extracted", page.getExtracted());
        return map;
    }
}
