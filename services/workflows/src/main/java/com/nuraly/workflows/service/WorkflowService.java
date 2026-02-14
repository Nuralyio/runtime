package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.*;
import com.nuraly.workflows.dto.mapper.WorkflowDTOMapper;
import com.nuraly.workflows.dto.mapper.WorkflowEdgeDTOMapper;
import com.nuraly.workflows.dto.mapper.WorkflowNodeDTOMapper;
import com.nuraly.workflows.entity.NodeExecutionEntity;
import com.nuraly.workflows.entity.WorkflowEdgeEntity;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import com.nuraly.workflows.engine.registry.PortMergeService;
import com.nuraly.workflows.exception.InvalidWorkflowException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import com.nuraly.library.logging.LogClient;
import com.nuraly.library.permission.PermissionCheckRequest;
import com.nuraly.library.permission.PermissionClient;
import com.nuraly.library.permission.PermissionDeniedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.dto.CreateFromTemplateRequest;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;

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

    @Inject
    LogClient logClient;

    @Inject
    PortMergeService portMergeService;

    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    boolean permissionsEnabled;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<NodeType, Set<String>> SENSITIVE_CONFIG_KEYS = Map.of(
            NodeType.LLM, Set.of("apiKeyPath", "apiUrlPath"),
            NodeType.EMBEDDING, Set.of("apiKeyPath", "apiUrlPath"),
            NodeType.VECTOR_SEARCH, Set.of("apiKeyPath", "apiUrlPath"),
            NodeType.CONTEXT_MEMORY, Set.of("embeddingApiKeyPath", "embeddingApiUrlPath"),
            NodeType.FILE_STORAGE, Set.of("storageConfigPath"),
            NodeType.DATABASE, Set.of("connectionPath"),
            NodeType.HTTP, Set.of("headers")
    );

    public List<WorkflowDTO> getWorkflows(String applicationId, String userHeader, Boolean isTemplate) {
        List<WorkflowEntity> entities;
        if (applicationId != null && !applicationId.isEmpty()) {
            entities = WorkflowEntity.list("applicationId", applicationId);
        } else {
            entities = WorkflowEntity.listAll();
        }

        // Filter by template flag
        if (isTemplate != null) {
            entities = entities.stream()
                    .filter(e -> isTemplate.equals(e.isTemplate))
                    .collect(Collectors.toList());
        }

        // Skip permission filtering if disabled
        if (!permissionsEnabled) {
            List<WorkflowDTO> dtos = workflowDTOMapper.toDTOList(entities);
            dtos.forEach(this::mergeNodePorts);
            return dtos;
        }

        // Filter by permission
        List<String> accessibleIds = permissionClient.getAccessibleResources("workflow", userHeader);
        List<WorkflowDTO> dtos = workflowDTOMapper.toDTOList(
                entities.stream()
                        .filter(e -> accessibleIds.contains(String.valueOf(e.id)))
                        .collect(Collectors.toList())
        );
        dtos.forEach(this::mergeNodePorts);
        return dtos;
    }

    public WorkflowDTO getWorkflowById(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        WorkflowDTO dto = workflowDTOMapper.toDTO(entity);
        mergeNodePorts(dto);
        return dto;
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

        logClient.info("workflow", null, Map.of(
                "action", "created",
                "workflow_id", String.valueOf(entity.id),
                "name", entity.name != null ? entity.name : "",
                "created_by", userUuid != null ? userUuid : "unknown"
        ));

        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO updateWorkflow(UUID workflowId, WorkflowDTO workflowDTO) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        workflowDTOMapper.updateEntity(workflowDTO, entity);
        entity.persist();

        logClient.info("workflow", null, Map.of(
                "action", "updated",
                "workflow_id", String.valueOf(workflowId)
        ));

        return workflowDTOMapper.toDTO(entity);
    }

    public void deleteWorkflow(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        entity.delete();

        logClient.info("workflow", null, Map.of(
                "action", "deleted",
                "workflow_id", String.valueOf(workflowId)
        ));
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

        logClient.info("workflow", null, Map.of(
                "action", "published",
                "workflow_id", String.valueOf(workflowId),
                "name", entity.name != null ? entity.name : ""
        ));

        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO pauseWorkflow(UUID workflowId) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        entity.status = WorkflowStatus.PAUSED;
        entity.persist();

        logClient.info("workflow", null, Map.of(
                "action", "paused",
                "workflow_id", String.valueOf(workflowId)
        ));

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

    // Template Management

    public List<WorkflowDTO> getTemplates() {
        List<WorkflowEntity> entities = WorkflowEntity.list("isTemplate", true);
        return workflowDTOMapper.toDTOList(entities);
    }

    public WorkflowDTO setTemplate(UUID workflowId, boolean isTemplate) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        entity.isTemplate = isTemplate;
        entity.persist();
        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO setVerified(UUID workflowId, boolean verified) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        entity.verified = verified;
        entity.persist();
        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO setEditorChoice(UUID workflowId, boolean editorChoice) throws WorkflowNotFoundException {
        WorkflowEntity entity = WorkflowEntity.findById(workflowId);
        if (entity == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }
        entity.editorChoice = editorChoice;
        entity.persist();
        return workflowDTOMapper.toDTO(entity);
    }

    public WorkflowDTO createFromTemplate(UUID templateId, CreateFromTemplateRequest request, String userUuid)
            throws WorkflowNotFoundException {
        WorkflowEntity template = WorkflowEntity.findById(templateId);
        if (template == null) {
            throw new WorkflowNotFoundException("Template not found with id: " + templateId);
        }
        if (!Boolean.TRUE.equals(template.isTemplate)) {
            throw new IllegalArgumentException("Workflow is not marked as a template");
        }

        // Check application permission
        String applicationId = request.getApplicationId();
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

        // Create new workflow from template
        WorkflowEntity newWorkflow = new WorkflowEntity();
        newWorkflow.name = request.getName() != null ? request.getName() : template.name + " (from template)";
        newWorkflow.description = request.getDescription() != null ? request.getDescription() : template.description;
        newWorkflow.applicationId = applicationId;
        newWorkflow.createdBy = userUuid;
        newWorkflow.status = WorkflowStatus.DRAFT;
        newWorkflow.isTemplate = false;
        newWorkflow.variables = template.variables;
        newWorkflow.viewport = template.viewport;
        newWorkflow.persist();

        // Clone nodes with sanitized configuration and ID mapping
        Map<UUID, WorkflowNodeEntity> nodeIdMapping = new HashMap<>();
        for (WorkflowNodeEntity templateNode : template.nodes) {
            WorkflowNodeEntity newNode = new WorkflowNodeEntity();
            newNode.workflow = newWorkflow;
            newNode.name = templateNode.name;
            newNode.type = templateNode.type;
            newNode.configuration = sanitizeNodeConfiguration(templateNode.type, templateNode.configuration);
            newNode.ports = templateNode.ports;
            newNode.positionX = templateNode.positionX;
            newNode.positionY = templateNode.positionY;
            newNode.maxRetries = templateNode.maxRetries;
            newNode.retryDelayMs = templateNode.retryDelayMs;
            newNode.timeoutMs = templateNode.timeoutMs;
            newNode.persist();
            nodeIdMapping.put(templateNode.id, newNode);
        }

        // Clone edges with remapped node IDs
        for (WorkflowEdgeEntity templateEdge : template.edges) {
            WorkflowEdgeEntity newEdge = new WorkflowEdgeEntity();
            newEdge.workflow = newWorkflow;
            newEdge.sourceNode = nodeIdMapping.get(templateEdge.sourceNode.id);
            newEdge.targetNode = nodeIdMapping.get(templateEdge.targetNode.id);
            newEdge.sourcePortId = templateEdge.sourcePortId;
            newEdge.targetPortId = templateEdge.targetPortId;
            newEdge.condition = templateEdge.condition;
            newEdge.label = templateEdge.label;
            newEdge.priority = templateEdge.priority;
            newEdge.persist();
        }

        // Clone triggers with stripped secrets
        for (WorkflowTriggerEntity templateTrigger : template.triggers) {
            WorkflowTriggerEntity newTrigger = new WorkflowTriggerEntity();
            newTrigger.workflow = newWorkflow;
            newTrigger.name = templateTrigger.name;
            newTrigger.type = templateTrigger.type;
            newTrigger.configuration = templateTrigger.configuration;
            newTrigger.enabled = templateTrigger.enabled;
            newTrigger.webhookToken = null; // auto-generated by @PrePersist
            newTrigger.lastTriggeredAt = null;
            newTrigger.persist();
        }

        // Initialize owner permissions
        if (permissionsEnabled && userUuid != null) {
            permissionClient.initOwnerPermissions("workflow", String.valueOf(newWorkflow.id), userUuid);
        }

        return workflowDTOMapper.toDTO(newWorkflow);
    }

    private String sanitizeNodeConfiguration(NodeType type, String configuration) {
        if (configuration == null || configuration.isEmpty()) {
            return configuration;
        }
        Set<String> keysToRemove = SENSITIVE_CONFIG_KEYS.get(type);
        if (keysToRemove == null || keysToRemove.isEmpty()) {
            return configuration;
        }
        try {
            ObjectNode configNode = (ObjectNode) objectMapper.readTree(configuration);
            for (String key : keysToRemove) {
                configNode.remove(key);
            }
            return objectMapper.writeValueAsString(configNode);
        } catch (Exception e) {
            return configuration;
        }
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

        // Check for start node (START or HTTP_START)
        boolean hasStartNode = entity.nodes.stream()
                .anyMatch(n -> n.type == NodeType.START || n.type == NodeType.HTTP_START);
        if (!hasStartNode) {
            result.addError("Workflow must have a START or HTTP_START node");
        }

        // Check for end node (END or HTTP_END)
        boolean hasEndNode = entity.nodes.stream()
                .anyMatch(n -> n.type == NodeType.END || n.type == NodeType.HTTP_END);
        if (!hasEndNode) {
            result.addError("Workflow must have at least one END or HTTP_END node");
        }

        // If workflow has HTTP_START, it should have HTTP_END (warning)
        boolean hasHttpStart = entity.nodes.stream().anyMatch(n -> n.type == NodeType.HTTP_START);
        boolean hasHttpEnd = entity.nodes.stream().anyMatch(n -> n.type == NodeType.HTTP_END);
        if (hasHttpStart && !hasHttpEnd) {
            result.addWarning("Workflow has HTTP_START but no HTTP_END node. HTTP requests won't receive a response.");
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

        // Validate HTTP_START path/method conflicts within this workflow
        validateHttpStartConflictsWithinWorkflow(entity, result);

        // Validate HTTP_START path/method conflicts with other workflows in same application
        validateHttpStartConflictsAcrossWorkflows(entity, result);

        return result;
    }

    private void validateHttpStartConflictsWithinWorkflow(WorkflowEntity entity, ValidationResult result) {
        List<WorkflowNodeEntity> httpStartNodes = entity.nodes.stream()
                .filter(n -> n.type == NodeType.HTTP_START)
                .collect(Collectors.toList());

        if (httpStartNodes.size() <= 1) {
            return; // No conflict possible with 0 or 1 HTTP_START nodes
        }

        // Check for path+method conflicts within this workflow
        Map<String, WorkflowNodeEntity> pathMethodMap = new HashMap<>();
        for (WorkflowNodeEntity node : httpStartNodes) {
            List<String> pathMethods = extractPathMethods(node);
            for (String pathMethod : pathMethods) {
                if (pathMethodMap.containsKey(pathMethod)) {
                    WorkflowNodeEntity existingNode = pathMethodMap.get(pathMethod);
                    result.addError("HTTP_START nodes '" + existingNode.name + "' and '" + node.name +
                            "' have conflicting path/method: " + pathMethod);
                } else {
                    pathMethodMap.put(pathMethod, node);
                }
            }
        }
    }

    private void validateHttpStartConflictsAcrossWorkflows(WorkflowEntity entity, ValidationResult result) {
        List<WorkflowNodeEntity> httpStartNodes = entity.nodes.stream()
                .filter(n -> n.type == NodeType.HTTP_START)
                .collect(Collectors.toList());

        if (httpStartNodes.isEmpty()) {
            return;
        }

        // Get all active workflows in the same application
        List<WorkflowEntity> otherWorkflows;
        if (entity.applicationId != null && !entity.applicationId.isEmpty()) {
            otherWorkflows = WorkflowEntity.list("applicationId = ?1 and status = ?2 and id != ?3",
                    entity.applicationId, WorkflowStatus.ACTIVE, entity.id);
        } else {
            // If no applicationId, check globally (less common case)
            otherWorkflows = WorkflowEntity.list("status = ?1 and id != ?2",
                    WorkflowStatus.ACTIVE, entity.id);
        }

        // Collect all path+methods from other workflows
        Map<String, String> existingPathMethods = new HashMap<>(); // path+method -> workflow name
        for (WorkflowEntity otherWorkflow : otherWorkflows) {
            for (WorkflowNodeEntity node : otherWorkflow.nodes) {
                if (node.type == NodeType.HTTP_START) {
                    List<String> pathMethods = extractPathMethods(node);
                    for (String pathMethod : pathMethods) {
                        existingPathMethods.put(pathMethod, otherWorkflow.name);
                    }
                }
            }
        }

        // Check for conflicts
        for (WorkflowNodeEntity node : httpStartNodes) {
            List<String> pathMethods = extractPathMethods(node);
            for (String pathMethod : pathMethods) {
                if (existingPathMethods.containsKey(pathMethod)) {
                    String conflictingWorkflow = existingPathMethods.get(pathMethod);
                    result.addError("HTTP_START node '" + node.name + "' has path/method '" + pathMethod +
                            "' that conflicts with active workflow '" + conflictingWorkflow + "'");
                }
            }
        }
    }

    private List<String> extractPathMethods(WorkflowNodeEntity node) {
        List<String> pathMethods = new ArrayList<>();

        if (node.configuration == null || node.configuration.isEmpty()) {
            return pathMethods;
        }

        try {
            JsonNode config = objectMapper.readTree(node.configuration);
            String path = config.has("httpPath") ? config.get("httpPath").asText() : "/webhook";

            // Normalize path
            if (!path.startsWith("/")) {
                path = "/" + path;
            }

            List<String> methods = new ArrayList<>();
            if (config.has("httpMethods") && config.get("httpMethods").isArray()) {
                for (JsonNode methodNode : config.get("httpMethods")) {
                    methods.add(methodNode.asText().toUpperCase());
                }
            }

            if (methods.isEmpty()) {
                methods.add("POST"); // Default method
            }

            for (String method : methods) {
                pathMethods.add(method + ":" + path);
            }
        } catch (Exception e) {
            // If config parsing fails, return empty list
        }

        return pathMethods;
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
        } else if (node.type == NodeType.HTTP_START) {
            validateHttpStartNodeConfiguration(node, result);
        } else if (node.type == NodeType.HTTP_END) {
            validateHttpEndNodeConfiguration(node, result);
        }
    }

    private void validateHttpStartNodeConfiguration(WorkflowNodeEntity node, ValidationResult result) {
        if (node.configuration == null || node.configuration.isEmpty()) {
            result.addWarning("HTTP_START node '" + node.name + "' has no configuration, using defaults");
            return;
        }

        try {
            JsonNode config = objectMapper.readTree(node.configuration);

            // Validate httpPath
            if (config.has("httpPath")) {
                String path = config.get("httpPath").asText();
                if (path == null || path.trim().isEmpty()) {
                    result.addError("HTTP_START node '" + node.name + "' has empty httpPath");
                } else if (!path.startsWith("/")) {
                    result.addWarning("HTTP_START node '" + node.name + "' httpPath should start with '/'");
                }
            }

            // Validate httpMethods
            if (config.has("httpMethods")) {
                JsonNode methods = config.get("httpMethods");
                if (!methods.isArray() || methods.size() == 0) {
                    result.addWarning("HTTP_START node '" + node.name + "' has no HTTP methods defined, defaulting to POST");
                } else {
                    for (JsonNode method : methods) {
                        String m = method.asText().toUpperCase();
                        if (!m.equals("GET") && !m.equals("POST") && !m.equals("PUT") &&
                                !m.equals("DELETE") && !m.equals("PATCH")) {
                            result.addError("HTTP_START node '" + node.name + "' has invalid HTTP method: " + m);
                        }
                    }
                }
            }

            // Validate httpAuth
            if (config.has("httpAuth")) {
                String auth = config.get("httpAuth").asText();
                if (!auth.equals("none") && !auth.equals("api_key") &&
                        !auth.equals("bearer") && !auth.equals("basic")) {
                    result.addError("HTTP_START node '" + node.name + "' has invalid httpAuth: " + auth);
                }
            }
        } catch (Exception e) {
            result.addError("HTTP_START node '" + node.name + "' has invalid configuration JSON");
        }
    }

    private void validateHttpEndNodeConfiguration(WorkflowNodeEntity node, ValidationResult result) {
        if (node.configuration == null || node.configuration.isEmpty()) {
            return; // HTTP_END can work with defaults
        }

        try {
            JsonNode config = objectMapper.readTree(node.configuration);

            // Validate httpStatusCode
            if (config.has("httpStatusCode")) {
                int statusCode = config.get("httpStatusCode").asInt();
                if (statusCode < 100 || statusCode >= 600) {
                    result.addError("HTTP_END node '" + node.name + "' has invalid status code: " + statusCode);
                }
            }
        } catch (Exception e) {
            result.addError("HTTP_END node '" + node.name + "' has invalid configuration JSON");
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

        WorkflowNodeDTO result = workflowNodeDTOMapper.toDTO(node);
        mergeNodePorts(result);
        return result;
    }

    public WorkflowNodeDTO updateNode(UUID nodeId, WorkflowNodeDTO nodeDTO) throws Exception {
        WorkflowNodeEntity node = WorkflowNodeEntity.findById(nodeId);
        if (node == null) {
            throw new Exception("Node not found with id: " + nodeId);
        }

        workflowNodeDTOMapper.updateEntity(nodeDTO, node);
        node.persist();

        WorkflowNodeDTO result = workflowNodeDTOMapper.toDTO(node);
        mergeNodePorts(result);
        return result;
    }

    public void deleteNode(UUID nodeId) throws Exception {
        WorkflowNodeEntity node = WorkflowNodeEntity.findById(nodeId);
        if (node == null) {
            throw new Exception("Node not found with id: " + nodeId);
        }

        // Delete associated node executions first (foreign key constraint)
        NodeExecutionEntity.delete("node.id = ?1", nodeId);
        // Delete associated edges
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
        edge.targetPortId = edgeDTO.getTargetPortId();
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

    // ========================================================================
    // Port merge-on-read helpers
    // ========================================================================

    /**
     * Merge canonical port definitions into all nodes of a workflow DTO.
     * This ensures nodes created under an older schema automatically pick up
     * new ports defined in NodeTypeRegistry without delete/recreate.
     */
    private void mergeNodePorts(WorkflowDTO workflowDTO) {
        if (workflowDTO.getNodes() == null) {
            return;
        }
        for (WorkflowNodeDTO nodeDTO : workflowDTO.getNodes()) {
            mergeNodePorts(nodeDTO);
        }
    }

    private void mergeNodePorts(WorkflowNodeDTO nodeDTO) {
        if (nodeDTO.getType() == null) {
            return;
        }
        String merged = portMergeService.mergePorts(nodeDTO.getType(), nodeDTO.getPorts());
        nodeDTO.setPorts(merged);
    }
}
