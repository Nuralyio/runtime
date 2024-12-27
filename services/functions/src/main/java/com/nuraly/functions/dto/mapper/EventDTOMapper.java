package com.nuraly.functions.dto.mapper;

import com.nuraly.functions.dto.EventDTO;
import com.nuraly.functions.entity.EventEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface EventDTOMapper {

    EventEntity toEntity(EventDTO eventDTO);

    EventDTO toEventDTO(EventEntity entity);

    List<EventDTO> toEventDTO(List<EventEntity> entities);
}
