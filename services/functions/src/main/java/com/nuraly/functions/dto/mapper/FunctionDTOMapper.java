package com.nuraly.functions.dto.mapper;

import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.entity.FunctionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.JAKARTA_CDI)
public interface FunctionDTOMapper {

    FunctionEntity toEntity(FunctionDTO functionDTO);

    FunctionDTO toFunctionDTO(FunctionEntity entity);

    List<FunctionDTO> toFunctionDTO(List<FunctionEntity> entities);
}
