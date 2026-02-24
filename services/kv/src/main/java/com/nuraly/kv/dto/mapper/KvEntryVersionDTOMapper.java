package com.nuraly.kv.dto.mapper;

import com.nuraly.kv.dto.KvEntryVersionDTO;
import com.nuraly.kv.entity.KvEntryVersionEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface KvEntryVersionDTOMapper {

    @Mapping(target = "entryId", source = "entry.id")
    @Mapping(target = "value", ignore = true)
    KvEntryVersionDTO toDTO(KvEntryVersionEntity entity);

    List<KvEntryVersionDTO> toDTOList(List<KvEntryVersionEntity> entities);
}
