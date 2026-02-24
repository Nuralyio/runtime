package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.WorkflowTriggerDTO;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface WorkflowTriggerDTOMapper {

    @Mapping(target = "workflow", ignore = true)
    WorkflowTriggerEntity toEntity(WorkflowTriggerDTO dto);

    @Mapping(target = "workflowId", source = "workflow.id")
    @Mapping(target = "webhookUrl", ignore = true)
    WorkflowTriggerDTO toDTO(WorkflowTriggerEntity entity);

    List<WorkflowTriggerDTO> toDTOList(List<WorkflowTriggerEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workflow", ignore = true)
    @Mapping(target = "webhookToken", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(WorkflowTriggerDTO dto, @MappingTarget WorkflowTriggerEntity entity);
}
