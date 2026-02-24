package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.WorkflowNodeDTO;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface WorkflowNodeDTOMapper {

    @Mapping(target = "workflow", ignore = true)
    WorkflowNodeEntity toEntity(WorkflowNodeDTO dto);

    @Mapping(target = "workflowId", source = "workflow.id")
    WorkflowNodeDTO toDTO(WorkflowNodeEntity entity);

    List<WorkflowNodeDTO> toDTOList(List<WorkflowNodeEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "workflow", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(WorkflowNodeDTO dto, @MappingTarget WorkflowNodeEntity entity);
}
