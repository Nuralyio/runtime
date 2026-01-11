package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.WorkflowEdgeDTO;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface WorkflowEdgeDTOMapper {

    @Mapping(target = "workflow", ignore = true)
    @Mapping(target = "sourceNode", ignore = true)
    @Mapping(target = "targetNode", ignore = true)
    WorkflowEdgeEntity toEntity(WorkflowEdgeDTO dto);

    @Mapping(target = "workflowId", source = "workflow.id")
    @Mapping(target = "sourceNodeId", source = "sourceNode.id")
    @Mapping(target = "targetNodeId", source = "targetNode.id")
    WorkflowEdgeDTO toDTO(WorkflowEdgeEntity entity);

    List<WorkflowEdgeDTO> toDTOList(List<WorkflowEdgeEntity> entities);
}
