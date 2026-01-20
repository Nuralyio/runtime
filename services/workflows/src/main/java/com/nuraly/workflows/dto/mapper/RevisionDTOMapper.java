package com.nuraly.workflows.dto.mapper;

import com.nuraly.workflows.dto.revision.*;
import com.nuraly.workflows.entity.revision.*;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface RevisionDTOMapper {

    // WorkflowVersion mappings
    WorkflowVersionDTO toDTO(WorkflowVersionEntity entity);
    List<WorkflowVersionDTO> toWorkflowVersionDTOList(List<WorkflowVersionEntity> entities);

    // WorkflowNodeVersion mappings
    WorkflowNodeVersionDTO toDTO(WorkflowNodeVersionEntity entity);
    List<WorkflowNodeVersionDTO> toNodeVersionDTOList(List<WorkflowNodeVersionEntity> entities);

    // WorkflowEdgeVersion mappings
    WorkflowEdgeVersionDTO toDTO(WorkflowEdgeVersionEntity entity);
    List<WorkflowEdgeVersionDTO> toEdgeVersionDTOList(List<WorkflowEdgeVersionEntity> entities);

    // WorkflowTriggerVersion mappings
    WorkflowTriggerVersionDTO toDTO(WorkflowTriggerVersionEntity entity);
    List<WorkflowTriggerVersionDTO> toTriggerVersionDTOList(List<WorkflowTriggerVersionEntity> entities);

    // WorkflowRevision mappings
    WorkflowRevisionDTO toDTO(WorkflowRevisionEntity entity);
    List<WorkflowRevisionDTO> toRevisionDTOList(List<WorkflowRevisionEntity> entities);

    // WorkflowPublishedVersion mappings
    WorkflowPublishedVersionDTO toDTO(WorkflowPublishedVersionEntity entity);
}
