package com.nuraly.kv.dto.mapper;

import com.nuraly.kv.dto.KvEntryDTO;
import com.nuraly.kv.entity.KvEntryEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface KvEntryDTOMapper {

    @Mapping(target = "namespaceId", source = "namespace.id")
    @Mapping(target = "value", ignore = true)
    KvEntryDTO toDTO(KvEntryEntity entity);

    List<KvEntryDTO> toDTOList(List<KvEntryEntity> entities);
}
