package com.nuraly.functions.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.functions.dto.EventDTO;
import com.nuraly.functions.dto.mapper.EventDTOMapper;
import com.nuraly.functions.entity.EventEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import com.nuraly.functions.exception.EventNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.ConnectionFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeoutException;

@ApplicationScoped
public class EventService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Inject
    EventDTOMapper eventDTOMapper;

    private static final String QUEUE_NAME = "event-queue";
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        EventEntity entity = eventDTOMapper.toEntity(eventDTO);
        entity.persist();
        return eventDTOMapper.toEventDTO(entity);
    }

    // RabbitMQ connection factory
    private ConnectionFactory createConnectionFactory() {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost"); // Replace with your RabbitMQ host
        factory.setPort(5672);        // Default RabbitMQ port
        factory.setUsername("guest"); // Replace with your username
        factory.setPassword("guest"); // Replace with your password
        return factory;
    }

    private void sendToRabbitMQ(String message) {
        ConnectionFactory factory = createConnectionFactory();
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // Declare the queue
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);

            // Publish the message
            channel.basicPublish("", QUEUE_NAME, null, message.getBytes(StandardCharsets.UTF_8));
            System.out.println("Sent message: " + message);

        } catch (IOException | TimeoutException e) {
            throw new RuntimeException("Failed to send message to RabbitMQ", e);
        }
    }

    @Transactional
    public EventDTO createEventAndSend(EventDTO eventDTO) {
        // Persist the event in the database
        EventEntity entity = eventDTOMapper.toEntity(eventDTO);
        entity.persist();

        // Serialize the event to JSON
        try {
            String eventJson = objectMapper.writeValueAsString(eventDTO);

            // Send the event to RabbitMQ
            sendToRabbitMQ(eventJson);

        } catch (IOException e) {
            throw new RuntimeException("Failed to serialize event to JSON", e);
        }

        return eventDTOMapper.toEventDTO(entity);
    }

    @Transactional
    public void logEvent(EventType eventType, String source, EventStatus eventStatus, JsonNode payload) {
        if (eventType == null) {
            throw new IllegalArgumentException("EventType cannot be null");
        }

        EventEntity eventEntity = new EventEntity();
        eventEntity.setType(eventType);
        eventEntity.setTimestamp(Instant.now());
        eventEntity.setSource(source);
        eventEntity.setPayload(payload != null ? payload.toString() : null);
        eventEntity.setStatus(eventStatus);
        eventEntity.setRetryCount(0);
        eventEntity.persist();

        // Serialize and send the event to RabbitMQ
        try {
            objectMapper.registerModule(new JavaTimeModule());
            String eventJson = objectMapper.writeValueAsString(eventEntity);
            sendToRabbitMQ(eventJson);
        } catch (IOException e) {
            throw new RuntimeException("Failed to serialize event to JSON", e);
        }
    }

    @Transactional
    public EventDTO getEventById(Long id) throws EventNotFoundException {
        EventEntity entity = EventEntity.findById(id);
        if (entity == null) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        return eventDTOMapper.toEventDTO(entity);
    }

    @Transactional
    public List<EventDTO> getEvents() {
        List<EventEntity> entities = EventEntity.listAll();
        return eventDTOMapper.toEventDTO(entities);
    }

    @Transactional
    public EventDTO updateEvent(Long id, EventDTO eventDTO) throws EventNotFoundException {
        EventEntity entity = EventEntity.findById(id);
        if (entity == null) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        entity.setType(eventDTO.getType());
        entity.setTimestamp(eventDTO.getTimestamp());
        entity.setSource(eventDTO.getSource());
        entity.setPayload(eventDTO.getPayload());
        entity.setStatus(eventDTO.getStatus());
        entity.setRetryCount(eventDTO.getRetryCount());
        entity.setProcessingTime(eventDTO.getProcessingTime());
        return eventDTOMapper.toEventDTO(entity);
    }

    @Transactional
    public void deleteEvent(Long id) throws EventNotFoundException {
        EventEntity entity = EventEntity.findById(id);
        if (entity == null) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        entity.delete();
    }
}