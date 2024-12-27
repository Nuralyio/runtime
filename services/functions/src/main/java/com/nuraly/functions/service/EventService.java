package com.nuraly.functions.service;

import com.nuraly.functions.dto.EventDTO;
import com.nuraly.functions.dto.mapper.EventDTOMapper;
import com.nuraly.functions.entity.EventEntity;
import com.nuraly.functions.exception.EventNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
@Transactional
public class EventService {

    @Inject
    EventDTOMapper eventDTOMapper;

    public List<EventDTO> getEvents() {
        List<EventEntity> entities = EventEntity.listAll();
        return eventDTOMapper.toEventDTO(entities);
    }

    public EventDTO getEventById(Long id) throws EventNotFoundException {
        EventEntity entity = EventEntity.findById(id);
        if (entity == null) {
            throw new EventNotFoundException("Event not found with id: " + id);
        }
        return eventDTOMapper.toEventDTO(entity);
    }

    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        EventEntity entity = eventDTOMapper.toEntity(eventDTO);
        entity.persist();
        return eventDTOMapper.toEventDTO(entity);
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
