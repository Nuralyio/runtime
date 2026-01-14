package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.dto.mapper.WorkflowDTOMapper;
import com.nuraly.workflows.dto.mapper.WorkflowEdgeDTOMapper;
import com.nuraly.workflows.dto.mapper.WorkflowNodeDTOMapper;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.library.permission.PermissionCheckRequest;
import com.nuraly.library.permission.PermissionClient;
import com.nuraly.library.permission.PermissionDeniedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.*;
import java.util.stream.Collectors;

@ApplicationScoped
@Transactional
public class WorkflowService {

    @Inject
    WorkflowDTOMapper workflowDTOMapper;

    @Inject
    WorkflowNodeDTOMapper workflowNodeDTOMapper;

    @Inject
    WorkflowEdgeDTOMapper workflowEdgeDTOMapper;

    @Inject
    PermissionClient permissionClient;

    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    boolean permissionsEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WorkflowDTO> getWorkflows(String applicationId, String userHeader) {
        List<WorkflowEntity> entities;
        if (applicationId != null && !applicationId.isEmpty()) {
            entities = WorkflowEntity.list("applicationId", applicationId);
        } else {
            entities = WorkflowEntity.listAll();
        }

        // Skip permission filtering if disabled
        if (!permissionsEnabled) {
            return workflowDTOMapper.toDTOList(entities);
        }

        // Filter by permission
        List<String> accessibleIds = permissionClient.getAccessibleResources("workflow", userHeader);
        return workflowDTOMapper.toDTOList(
                entities.stream()
                        .filter(e -> accessibleIds.contains(String.valueOf(e.id)))
                        .collect(Collectors.toList())
        );
    }

    public WorkflowDTO getWorkflowById(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO createWorkflow(WorkflowDTO workflowDTO, String userUuid) {
        // Check application permission if applicationId is provided (skip if permissions disabled)
        String applicationId = workflowDTO.getApplicationId();
        if (permissionsEnabled && applicationId != null && !applicationId.isEmpty() && userUuid != null) {
            PermissionCheckRequest checkRequest = PermissionCheckRequest.builder()
                    .userId(userUuid)
                    .permissionType("application:write")
                    .resourceType("application")
                    .resourceId(applicationId)
                    .build();

            if (!permissionClient.hasPermission(checkRequest)) {
                throw new PermissionDeniedException("Permission denied: application:write on " + applicationId);
            }
        }

        WorkflowEntity entity = workflowDTOMapper.toEntity(workflowDTO);
        entity.createdBy = userUuid;
        entity.status = WorkflowStatus.DRAFT;
        entity.persist();

        // Initialize owner permissions (skip if permissions disabled)
        if (permissionsEnabled && userUuid != null) {
            permissionClient.initOwnerPermissions("workflow", String.valueOf(entity.id), userUuid);
        }

        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO updateWorkflow(UUID workflowId, WorkflowDTO workflowDTO) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        workflowDTOMapper.updateEntity(workflowDTO, entity);
        entity.persist();

        return workflowDTOMapper.toDTO(entity);
    }

    public void deleteWorkflow(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        entity.delete();
    }

    public WorkflowDTO publishWorkflow(UUID workflowId) throws WorkflowNotFoundException, InvalidWorkflowException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Validate before publishing
        ValidationResult validation = validateWorkflowEntity(entity);
        if (!validation.isValid()) {
            throw new InvalidWorkflowException(validation.getErrors());
        }

        entity.status = WorkflowStatus.ACTIVE;
        entity.persist();

        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO pauseWorkflow(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        entity.status = WorkflowStatus.PAUSED;
        entity.persist();

        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO cloneWorkflow(UUID workflowId, String userUuid) throws WorkflowNotFoundException {
        WorkflowEntity original = WorkflowEntity.findById(workflowId);
        if (original == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Create new workflow
        WorkflowEntity clone = new WorkflowEntity();
        clone.name = original.name + " (Copy)";
        clone.description = original.description;
        clone.applicationId = original.applicationId;
        clone.createdBy = userUuid;
        clone.status = WorkflowStatus.DRAFT;
        clone.variables = original.variables;
        clone.persist();

        // Clone nodes with ID mapping
        Map<UUID, WorkflowNodeEntity> nodeIdMapping = new HashMap<>();
        for (WorkflowNodeEntity originalNode : original.nodes) {
            WorkflowNodeEntity cloneNode = new WorkflowNodeEntity();
            cloneNode.workflow = clone;
            cloneNode.name = originalNode.name;
            cloneNode.type = originalNode.type;
            cloneNode.configuration = originalNode.configuration;
            cloneNode.positionX = originalNode.positionX;
            cloneNode.positionY = originalNode.positionY;
            cloneNode.maxRetries = originalNode.maxRetries;
            cloneNode.retryDelayMs = originalNode.retryDelayMs;
            cloneNode.timeoutMs = originalNode.timeoutMs;
            cloneNode.persist();
            nodeIdMapping.put(originalNode.id, cloneNode);
        }

        // Clone edges using mapped node IDs
        for (WorkflowEdgeEntity originalEdge : original.edges) {
            WorkflowEdgeEntity cloneEdge = new WorkflowEdgeEntity();
            cloneEdge.workflow = clone;
            cloneEdge.sourceNode = nodeIdMapping.get(originalEdge.sourceNode.id);
            cloneEdge.targetNode = nodeIdMapping.get(originalEdge.targetNode.id);
            cloneEdge.condition = originalEdge.condition;
            cloneEdge.label = originalEdge.label;
            cloneEdge.priority = originalEdge.priority;
            cloneEdge.persist();
        }

        // Initialize owner permissions for clone (skip if permissions disabled)
        if (permissionsEnabled && userUuid != null) {
            permissionClient.initOwnerPermissions("workflow", String.valueOf(clone.id), userUuid);
        }

        return workflowDTOMapper.toDTO(clone);
    }

    public ValidationResult validateWorkflow(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        return validateWorkflowEntity(entity);
    }

    private ValidationResult validateWorkflowEntity(WorkflowEntity entity) {
        ValidationResult result = new ValidationResult();
        result.setValid(true);

        // Check for start node
        boolean hasStartNode = entity.nodes.stream()
                .anyMatch(n -> n.type == NodeType.START);
        if (!hasStartNode) {
            result.addError("Workflow must have a START node");
        }

        // Check for end node
        boolean hasEndNode = entity.nodes.stream()
                .anyMatch(n -> n.type == NodeType.END);
        if (!hasEndNode) {
            result.addError("Workflow must have at least one END node");
        }

        // Check all nodes are connected
        Set<UUID> connectedNodes = new HashSet<>();
        for (WorkflowEdgeEntity edge : entity.edges) {
            connectedNodes.add(edge.sourceNode.id);
            connectedNodes.add(edge.targetNode.id);
        }

        for (WorkflowNodeEntity node : entity.nodes) {
            if (!connectedNodes.contains(node.id) && entity.nodes.size() > 1) {
                result.addWarning("Node '" + node.name + "' is not connected to any other node");
            }
        }

        // Validate node configurations
        for (WorkflowNodeEntity node : entity.nodes) {
            validateNodeConfiguration(node, result);
        }

        return result;
    }

    private void validateNodeConfiguration(WorkflowNodeEntity node, ValidationResult result) {
        if (node.type == NodeType.FUNCTION) {
            if (node.configuration == null || node.configuration.isEmpty()) {
                result.addError("Function node '" + node.name + "' must have a configuration with functionId");
            }
        } else if (node.type == NodeType.HTTP) {
            if (node.configuration == null || node.configuration.isEmpty()) {
                result.addError("HTTP node '" + node.name + "' must have a configuration with url and method");
            }
        } else if (node.type == NodeType.SUB_WORKFLOW) {
            if (node.configuration == null || node.configuration.isEmpty()) {
                result.addError("SubWorkflow node '" + node.name + "' must have a configuration with workflowId");
            }
        }
    }

    // Node Management
    public WorkflowNodeDTO addNode(UUID workflowId, WorkflowNodeDTO nodeDTO) throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        WorkflowNodeEntity node = workflowNodeDTOMapper.toEntity(nodeDTO);
        node.workflow = workflow;
        node.persist();

        return workflowNodeDTOMapper.toDTO(node);
    }

    public WorkflowNodeDTO updateNode(UUID nodeId, WorkflowNodeDTO nodeDTO) throws Exception {
        WorkflowNodeEntity node = WorkflowNodeEntity.findById(nodeId);
        if (node == null) {
            throw new Exception("Node not found with id: " + nodeId);
        }

        workflowNodeDTOMapper.updateEntity(nodeDTO, node);
        node.persist();

        return workflowNodeDTOMapper.toDTO(node);
    }

    public void deleteNode(UUID nodeId) throws Exception {
        WorkflowNodeEntity node = WorkflowNodeEntity.findById(nodeId);
        if (node == null) {
            throw new Exception("Node not found with id: " + nodeId);
        }

        // Delete associated edges first
        WorkflowEdgeEntity.delete("sourceNode.id = ?1 or targetNode.id = ?1", nodeId);
        node.delete();
    }

    // Edge Management
    public WorkflowEdgeDTO addEdge(UUID workflowId, WorkflowEdgeDTO edgeDTO) throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        WorkflowNodeEntity sourceNode = WorkflowNodeEntity.findById(edgeDTO.getSourceNodeId());
        WorkflowNodeEntity targetNode = WorkflowNodeEntity.findById(edgeDTO.getTargetNodeId());

        if (sourceNode == null || targetNode == null) {
            throw new IllegalArgumentException("Source or target node not found");
        }

        // Check for existing edge to prevent duplicates
        String sourcePortId = edgeDTO.getSourcePortId();
        WorkflowEdgeEntity existingEdge;
        if (sourcePortId != null && !sourcePortId.isEmpty()) {
            existingEdge = WorkflowEdgeEntity.find(
                "sourceNode.id = ?1 and targetNode.id = ?2 and sourcePortId = ?3",
                edgeDTO.getSourceNodeId(), edgeDTO.getTargetNodeId(), sourcePortId
            ).firstResult();
        } else {
            existingEdge = WorkflowEdgeEntity.find(
                "sourceNode.id = ?1 and targetNode.id = ?2 and (sourcePortId is null or sourcePortId = '')",
                edgeDTO.getSourceNodeId(), edgeDTO.getTargetNodeId()
            ).firstResult();
        }

        if (existingEdge != null) {
            // Return existing edge instead of creating duplicate
            return workflowEdgeDTOMapper.toDTO(existingEdge);
        }

        WorkflowEdgeEntity edge = new WorkflowEdgeEntity();
        edge.workflow = workflow;
        edge.sourceNode = sourceNode;
        edge.targetNode = targetNode;
        edge.sourcePortId = sourcePortId;
        edge.condition = edgeDTO.getCondition();
        edge.label = edgeDTO.getLabel();
        edge.priority = edgeDTO.getPriority() != null ? edgeDTO.getPriority() : 0;
        edge.persist();

        return workflowEdgeDTOMapper.toDTO(edge);
    }

    public void deleteEdge(UUID edgeId) throws Exception {
        WorkflowEdgeEntity edge = WorkflowEdgeEntity.findById(edgeId);
        if (edge == null) {
            throw new Exception("Edge not found with id: " + edgeId);
        }
        edge.delete();
    }
}
