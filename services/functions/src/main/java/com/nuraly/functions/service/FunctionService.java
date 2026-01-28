package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.dto.FunctionDTO;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.dto.mapper.FunctionDTOMapper;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.FunctionNotFoundException;
import com.nuraly.functions.exception.ImportResolutionException;
import org.jboss.logging.Logger;
import com.nuraly.library.permission.PermissionCheckRequest;
import com.nuraly.library.permission.PermissionClient;
import com.nuraly.library.permission.PermissionDeniedException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class FunctionService {

    private static final Logger LOG = Logger.getLogger(FunctionService.class);

    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    boolean permissionsEnabled;

    @Inject
    Configuration configuration;

    @Inject
    FunctionDTOMapper functionDTOMapper;

    @Inject
    UrlImportService urlImportService;

    @Inject
    ContainerManager containerManager;

    @Inject
    FunctionInvoker functionInvoker;

    @Inject
    WasmRuntimeService wasmRuntime;

    @Inject
    PermissionClient permissionClient;

    public List<FunctionDTO> getFunctions(String applicationId, String userHeader) {
        List<FunctionEntity> entities;
        if (applicationId != null && !applicationId.isEmpty()) {
            entities = FunctionEntity.list("applicationId", applicationId);
        } else {
            entities = FunctionEntity.listAll();
        }

        // Skip permission filtering if permissions are disabled
        if (!permissionsEnabled) {
            return functionDTOMapper.toFunctionDTO(entities);
        }

        // Filter by user permission
        List<String> accessibleIds = permissionClient.getAccessibleResources("function", userHeader);

        // If no permissions found, return empty (user has no access)
        if (accessibleIds.isEmpty()) {
            return List.of();
        }

        // Filter entities by accessible IDs
        List<FunctionEntity> filteredEntities = entities.stream()
                .filter(e -> accessibleIds.contains(String.valueOf(e.id)))
                .toList();

        return functionDTOMapper.toFunctionDTO(filteredEntities);
    }

    public FunctionDTO getFunctionById(UUID id) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        return functionDTOMapper.toFunctionDTO(entity);
    }

    public FunctionDTO createFunction(FunctionDTO functionDTO) {
        return createFunction(functionDTO, null);
    }

    public FunctionDTO createFunction(FunctionDTO functionDTO, String userUuid) {
        // Check if user has write permission on the application (only if permissions enabled)
        String applicationId = functionDTO.getApplicationId();
        if (permissionsEnabled && applicationId != null && !applicationId.isEmpty() && userUuid != null && !userUuid.isEmpty()) {
            PermissionCheckRequest checkRequest = PermissionCheckRequest.builder()
                    .userId(userUuid)
                    .permissionType("application:write")
                    .resourceType("application")
                    .resourceId(applicationId)
                    .build();

            if (!permissionClient.hasPermission(checkRequest)) {
                throw new PermissionDeniedException(
                    "Permission denied: application:write on application [" + applicationId + "]"
                );
            }
        }

        FunctionEntity entity = functionDTOMapper.toEntity(functionDTO);
        entity.persist();

        // Grant creator full permissions on the new function (only if permissions enabled)
        if (permissionsEnabled && functionDTO.getCreatedBy() != null && !functionDTO.getCreatedBy().isEmpty()) {
            permissionClient.initOwnerPermissions(
                "function",
                String.valueOf(entity.id),
                functionDTO.getCreatedBy()
            );
        }

        return functionDTOMapper.toFunctionDTO(entity);
    }

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

    public void deleteFunction(UUID id) throws FunctionNotFoundException {
        FunctionEntity entity = FunctionEntity.findById(id);
        if (entity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + id);
        }
        entity.delete();
    }

    /**
     * Check if user has permission on a function.
     * For authenticated users, permission is verified by the gateway.
     * For anonymous users, checks via the /check-anonymous endpoint.
     *
     * @param functionId The ID of the function
     * @param userUuid The user's UUID (null or empty for anonymous)
     * @param permissionType The permission type to check (e.g., "function:execute")
     * @param allowAnonymous Whether anonymous access is allowed for this endpoint
     * @throws FunctionNotFoundException If the function is not found
     * @throws PermissionDeniedException If access is denied
     */
    public void checkFunctionPermission(UUID functionId, String userUuid, String permissionType, boolean allowAnonymous)
            throws FunctionNotFoundException, PermissionDeniedException {

        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        // Skip permission checks if permissions are disabled
        if (!permissionsEnabled) {
            return;
        }

        // Check if user is anonymous
        boolean isAnonymous = (userUuid == null || userUuid.isEmpty());

        if (isAnonymous) {
            if (!allowAnonymous) {
                throw new PermissionDeniedException("Authentication required");
            }
            // Anonymous access check is handled by the permission interceptor
            // via the @RequiresPermission annotation with allowAnonymous=true
        }

        // For authenticated users, owner check for convenience
        if (userUuid != null && userUuid.equals(functionEntity.createdBy)) {
            return; // Owner has all permissions
        }

        // Permission check is handled by the interceptor via @RequiresPermission annotation
    }

    /**
     * Check if user has permission on a function (authenticated users only).
     *
     * @param functionId The ID of the function
     * @param userUuid The user's UUID
     * @throws FunctionNotFoundException If the function is not found
     * @throws PermissionDeniedException If authentication is required
     */
    public void checkFunctionPermission(UUID functionId, String userUuid)
            throws FunctionNotFoundException, PermissionDeniedException {
        checkFunctionPermission(functionId, userUuid, "function:read", false);
    }

    /**
     * Check if user is the owner of a function.
     *
     * @param functionId The ID of the function
     * @param userUuid The user's UUID
     * @return true if user is the owner
     * @throws FunctionNotFoundException If the function is not found
     */
    public boolean isOwner(UUID functionId, String userUuid) throws FunctionNotFoundException {
        if (userUuid == null || userUuid.isEmpty()) {
            return false;
        }

        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        return userUuid.equals(functionEntity.createdBy);
    }

    /**
     * Builds a Docker image for the specified function by its ID.
     * Permission is verified by the gateway.
     *
     * @param functionId The ID of the function to build the Docker image for.
     * @param userUuid The user's UUID.
     * @return The image name if the build is successful.
     * @throws FunctionNotFoundException If no function is found with the given ID.
     * @throws PermissionDeniedException If authentication is required.
     * @throws Exception If an error occurs while building the Docker image.
     */
    public String buildFunctionDockerImage(UUID functionId, String userUuid) throws FunctionNotFoundException, PermissionDeniedException, Exception {
        checkFunctionPermission(functionId, userUuid);

        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        return containerManager.buildDockerImage(functionEntity);
    }

    /**
     * Deploy a function to the V8 runtime.
     * Permission is verified by the gateway.
     *
     * Resolves URL imports (e.g., from esm.sh) at deploy time:
     * - Fetches modules from CDN
     * - Inlines them into the handler
     * - Tracks line offsets for error translation
     *
     * @param functionId The ID of the function to deploy.
     * @param userUuid The user's UUID.
     * @throws FunctionNotFoundException If no function is found with the given ID.
     * @throws PermissionDeniedException If authentication is required.
     * @throws ImportResolutionException If URL import resolution fails.
     */
    public void deployFunction(UUID functionId, String userUuid)
            throws FunctionNotFoundException, PermissionDeniedException, Exception {
        checkFunctionPermission(functionId, userUuid);

        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        String handler = functionEntity.getHandler();
        int lineOffset = 0;

        // Resolve URL imports if enabled and present
        if (configuration.UrlImportEnabled && urlImportService.hasUrlImports(handler)) {
            try {
                LOG.infof("Resolving URL imports for function %s", functionId);
                UrlImportService.ResolvedHandler resolved = urlImportService.resolveImports(handler);
                handler = resolved.code();
                lineOffset = resolved.preambleLineCount();
                LOG.infof("Resolved %d URL imports for function %s (preamble: %d lines)",
                    resolved.resolvedUrls().size(), functionId, lineOffset);
            } catch (ImportResolutionException e) {
                LOG.errorf("Failed to resolve imports for function %s: %s", functionId, e.getMessage());
                throw e;
            }
        }

        // Deploy to V8 runtime with line offset for error translation
        wasmRuntime.deploy(functionId.toString(), handler, lineOffset);
    }
    public String invokeFunction(UUID functionId, InvokeRequest request) throws FunctionNotFoundException, Exception {
        FunctionEntity functionEntity = FunctionEntity.findById(functionId);
        if (functionEntity == null) {
            throw new FunctionNotFoundException("Function not found with id: " + functionId);
        }

        return functionInvoker.invoke(functionEntity, request);
    }

}