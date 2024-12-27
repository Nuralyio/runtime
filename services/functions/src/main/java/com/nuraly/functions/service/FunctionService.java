package com.nuraly.functions.service;

import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.dto.mapper.FunctionDTOMapper;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.FunctionNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class FunctionService {

    @Inject
    FunctionDTOMapper functionDTOMapper;

    public List<FunctionDTO> getFunctions() {
        List<FunctionEntity> entities = FunctionEntity.listAll();
        return functionDTOMapper.toFunctionDTO(entities);
    }

    public FunctionDTO getFunctionById(UUID id) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        return functionDTOMapper.toFunctionDTO(entity);
    }

    @Transactional
    public FunctionDTO createFunction(FunctionDTO functionDTO) {
        FunctionEntity entity = functionDTOMapper.toEntity(functionDTO);
        entity.persist();
        return functionDTOMapper.toFunctionDTO(entity);
    }

    @Transactional
    public FunctionDTO updateFunction(UUID id, FunctionDTO functionDTO) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        entity.setLabel(functionDTO.getLabel());
        entity.setDescription(functionDTO.getDescription());
        entity.setTemplate(functionDTO.getTemplate());
        entity.setRuntime(functionDTO.getRuntime());
        entity.setHandler(functionDTO.getHandler());
        return functionDTOMapper.toFunctionDTO(entity);
    }

    @Transactional
    public void deleteFunction(UUID id) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        entity.delete();
    }
}
