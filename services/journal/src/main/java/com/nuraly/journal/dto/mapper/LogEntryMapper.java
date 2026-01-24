package com.nuraly.journal.dto.mapper;

import com.nuraly.journal.dto.LogEntryDTO;
import com.nuraly.journal.dto.LogRequest;
import com.nuraly.journal.entity.LogEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

/**
 * MapStruct mapper for LogEntry entity and DTOs.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface LogEntryMapper {

    LogEntryDTO toDTO(LogEntry entity);

    List<LogEntryDTO> toDTOList(List<LogEntry> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    LogEntry toEntity(LogRequest request);
}
