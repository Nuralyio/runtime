package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.WorkflowExecutionDTO;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI, uses = {NodeExecutionDTOMapper.class})
public interface WorkflowExecutionDTOMapper {

    @Mapping(target = "workflow", ignore = true)
    @Mapping(target = "nodeExecutions", ignore = true)
    WorkflowExecutionEntity toEntity(WorkflowExecutionDTO dto);

    @Mapping(target = "workflowId", source = "workflow.id")
    @Mapping(target = "workflowName", source = "workflow.name")
    WorkflowExecutionDTO toDTO(WorkflowExecutionEntity entity);

    List<WorkflowExecutionDTO> toDTOList(List<WorkflowExecutionEntity> entities);
}
