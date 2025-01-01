package com.nuraly.functions.service;

import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.dto.mapper.FunctionDTOMapper;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.FunctionNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class FunctionService {

    @Inject
    FunctionDTOMapper functionDTOMapper;

    @Inject
    ContainerManager containerManager;

    @Inject
    FunctionInvoker functionInvoker;

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

    public FunctionDTO createFunction(FunctionDTO functionDTO) {
        FunctionEntity entity = functionDTOMapper.toEntity(functionDTO);
        entity.persist();
        return functionDTOMapper.toFunctionDTO(entity);
    }

    public FunctionDTO updateFunction(Long id, FunctionDTO functionDTO) throws FunctionNotFoundException {
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

    public void deleteFunction(UUID id) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        entity.delete();
    }

    /**
     * Builds a Docker image for the specified function by its ID.
     *
     * @param functionId The ID of the function to build the Docker image for.
     * @return The image name if the build is successful.
     * @throws FunctionNotFoundException If no function is found with the given ID.
     * @throws Exception If an error occurs while building the Docker image.
     */
    public String buildFunctionDockerImage(Long functionId) throws FunctionNotFoundException, Exception {
        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        return containerManager.buildDockerImage(functionEntity);
    }
    public String invokeFunction(Long functionId, InvokeRequest request) throws FunctionNotFoundException, Exception {
        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        return functionInvoker.invoke(functionEntity, request);
    }

}