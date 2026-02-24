package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.WorkflowDTO;
import com.nuraly.workflows.entity.WorkflowEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI,
        uses = {WorkflowNodeDTOMapper.class, WorkflowEdgeDTOMapper.class, WorkflowTriggerDTOMapper.class})
public interface WorkflowDTOMapper {

    @Mapping(target = "nodes", ignore = true)
    @Mapping(target = "edges", ignore = true)
    @Mapping(target = "triggers", ignore = true)
    WorkflowEntity toEntity(WorkflowDTO dto);

    WorkflowDTO toDTO(WorkflowEntity entity);

    List<WorkflowDTO> toDTOList(List<WorkflowEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "nodes", ignore = true)
    @Mapping(target = "edges", ignore = true)
    @Mapping(target = "triggers", ignore = true)
    void updateEntity(WorkflowDTO dto, @MappingTarget WorkflowEntity entity);
}
