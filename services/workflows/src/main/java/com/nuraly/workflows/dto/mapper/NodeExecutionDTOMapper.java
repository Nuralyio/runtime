package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.NodeExecutionDTO;
import com.nuraly.workflows.entity.NodeExecutionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface NodeExecutionDTOMapper {

    @Mapping(target = "execution", ignore = true)
    @Mapping(target = "node", ignore = true)
    NodeExecutionEntity toEntity(NodeExecutionDTO dto);

    @Mapping(target = "executionId", source = "execution.id")
    @Mapping(target = "nodeId", source = "node.id")
    @Mapping(target = "nodeName", source = "node.name")
    NodeExecutionDTO toDTO(NodeExecutionEntity entity);

    List<NodeExecutionDTO> toDTOList(List<NodeExecutionEntity> entities);
}
