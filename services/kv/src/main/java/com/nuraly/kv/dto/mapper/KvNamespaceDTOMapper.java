package com.nuraly.kv.dto.mapper;

import com.nuraly.kv.dto.CreateKvNamespaceRequest;
import com.nuraly.kv.dto.KvNamespaceDTO;
import com.nuraly.kv.dto.UpdateKvNamespaceRequest;
import com.nuraly.kv.entity.KvNamespaceEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface KvNamespaceDTOMapper {

    @Mapping(target = "entries", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    KvNamespaceEntity toEntity(CreateKvNamespaceRequest request);

    @Mapping(target = "entryCount", expression = "java(entity.entries != null ? (long) entity.entries.size() : 0L)")
    KvNamespaceDTO toDTO(KvNamespaceEntity entity);

    List<KvNamespaceDTO> toDTOList(List<KvNamespaceEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "applicationId", ignore = true)
    @Mapping(target = "isSecretNamespace", ignore = true)
    @Mapping(target = "entries", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateKvNamespaceRequest request, @MappingTarget KvNamespaceEntity entity);
}
