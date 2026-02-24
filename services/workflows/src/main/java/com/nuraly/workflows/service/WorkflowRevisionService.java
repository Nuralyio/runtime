package com.nuraly.workflows.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.dto.mapper.RevisionDTOMapper;
import com.nuraly.workflows.dto.revision.*;
import com.nuraly.workflows.entity.*;
import com.nuraly.workflows.entity.revision.*;
import com.nuraly.workflows.exception.RevisionNotFoundException;
import com.nuraly.workflows.exception.WorkflowNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
@Transactional
public class WorkflowRevisionService {

    @Inject
    RevisionDTOMapper revisionDTOMapper;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== Version Creation (Internal) ====================

    /**
     * Creates a version snapshot of the workflow metadata.
     */
    public WorkflowVersionEntity createWorkflowVersion(UUID workflowId, String createdBy) throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Get the next version number
        Integer maxVersion = getMaxWorkflowVersion(workflowId);
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        WorkflowVersionEntity version = new WorkflowVersionEntity();
        version.workflowId = workflowId;
        version.version = nextVersion;
        version.name = workflow.name;
        version.description = workflow.description;
        version.applicationId = workflow.applicationId;
        version.variables = workflow.variables;
        version.viewport = workflow.viewport;
        version.createdBy = createdBy;
        version.persist();

        return version;
    }

    /**
     * Creates a version snapshot of a node.
     */
    public WorkflowNodeVersionEntity createNodeVersion(WorkflowNodeEntity node, String createdBy) {
        // Get the next version number for this node
        Integer maxVersion = getMaxNodeVersion(node.id);
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        WorkflowNodeVersionEntity version = new WorkflowNodeVersionEntity();
        version.nodeId = node.id;
        version.workflowId = node.workflow.id;
        version.version = nextVersion;
        version.name = node.name;
        version.type = node.type;
        version.configuration = node.configuration;
        version.ports = node.ports;
        version.positionX = node.positionX;
        version.positionY = node.positionY;
        version.maxRetries = node.maxRetries;
        version.retryDelayMs = node.retryDelayMs;
        version.timeoutMs = node.timeoutMs;
        version.createdBy = createdBy;
        version.persist();

        return version;
    }

    /**
     * Creates a version snapshot of an edge.
     */
    public WorkflowEdgeVersionEntity createEdgeVersion(WorkflowEdgeEntity edge, String createdBy) {
        // Get the next version number for this edge
        Integer maxVersion = getMaxEdgeVersion(edge.id);
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        WorkflowEdgeVersionEntity version = new WorkflowEdgeVersionEntity();
        version.edgeId = edge.id;
        version.workflowId = edge.workflow.id;
        version.version = nextVersion;
        version.sourceNodeId = edge.sourceNode.id;
        version.sourcePortId = edge.sourcePortId;
        version.targetNodeId = edge.targetNode.id;
        version.targetPortId = edge.targetPortId;
        version.condition = edge.condition;
        version.label = edge.label;
        version.priority = edge.priority;
        version.createdBy = createdBy;
        version.persist();

        return version;
    }

    /**
     * Creates a version snapshot of a trigger.
     */
    public WorkflowTriggerVersionEntity createTriggerVersion(WorkflowTriggerEntity trigger, String createdBy) {
        // Get the next version number for this trigger
        Integer maxVersion = getMaxTriggerVersion(trigger.id);
        int nextVersion = (maxVersion == null) ? 1 : maxVersion + 1;

        WorkflowTriggerVersionEntity version = new WorkflowTriggerVersionEntity();
        version.triggerId = trigger.id;
        version.workflowId = trigger.workflow.id;
        version.version = nextVersion;
        version.name = trigger.name;
        version.type = trigger.type;
        version.configuration = trigger.configuration;
        version.enabled = trigger.enabled;
        version.webhookToken = trigger.webhookToken;
        version.createdBy = createdBy;
        version.persist();

        return version;
    }

    // ==================== Revision Operations ====================

    /**
     * Creates a new revision by snapshotting the current workflow state.
     */
    public WorkflowRevisionDTO createRevision(UUID workflowId, String createdBy, CreateRevisionRequest request)
            throws WorkflowNotFoundException {
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Create workflow version snapshot
        WorkflowVersionEntity workflowVersion = createWorkflowVersion(workflowId, createdBy);

        // Create node version snapshots
        List<VersionRef> nodeRefs = new ArrayList<>();
        for (WorkflowNodeEntity node : workflow.nodes) {
            WorkflowNodeVersionEntity nodeVersion = createNodeVersion(node, createdBy);
            nodeRefs.add(new VersionRef(node.id, nodeVersion.version));
        }

        // Create edge version snapshots
        List<VersionRef> edgeRefs = new ArrayList<>();
        for (WorkflowEdgeEntity edge : workflow.edges) {
            WorkflowEdgeVersionEntity edgeVersion = createEdgeVersion(edge, createdBy);
            edgeRefs.add(new VersionRef(edge.id, edgeVersion.version));
        }

        // Create trigger version snapshots
        List<VersionRef> triggerRefs = new ArrayList<>();
        for (WorkflowTriggerEntity trigger : workflow.triggers) {
            WorkflowTriggerVersionEntity triggerVersion = createTriggerVersion(trigger, createdBy);
            triggerRefs.add(new VersionRef(trigger.id, triggerVersion.version));
        }

        // Get the next revision number
        Integer maxRevision = getMaxRevision(workflowId);
        int nextRevision = (maxRevision == null) ? 1 : maxRevision + 1;

        // Create the revision manifest
        WorkflowRevisionEntity revision = new WorkflowRevisionEntity();
        revision.workflowId = workflowId;
        revision.revision = nextRevision;
        revision.versionLabel = request != null ? request.getVersionLabel() : null;
        revision.description = request != null ? request.getDescription() : null;
        revision.workflowVersion = workflowVersion.version;
        revision.nodeRefs = serializeRefs(nodeRefs);
        revision.edgeRefs = serializeRefs(edgeRefs);
        revision.triggerRefs = serializeRefs(triggerRefs);
        revision.createdBy = createdBy;
        revision.persist();

        return revisionDTOMapper.toDTO(revision);
    }

    /**
     * Gets a specific revision by workflow ID and revision number.
     */
    public WorkflowRevisionDTO getRevision(UUID workflowId, int revision) throws RevisionNotFoundException {
        WorkflowRevisionEntity entity = WorkflowRevisionEntity.find(
                "workflowId = ?1 and revision = ?2", workflowId, revision).firstResult();
        if (entity == null) {
            throw new RevisionNotFoundException("Revision " + revision + " not found for workflow: " + workflowId);
        }
        return revisionDTOMapper.toDTO(entity);
    }

    /**
     * Gets the full snapshot for a revision (all versioned data).
     */
    public RevisionSnapshotDTO getRevisionSnapshot(UUID workflowId, int revision) throws RevisionNotFoundException {
        WorkflowRevisionEntity revisionEntity = WorkflowRevisionEntity.find(
                "workflowId = ?1 and revision = ?2", workflowId, revision).firstResult();
        if (revisionEntity == null) {
            throw new RevisionNotFoundException("Revision " + revision + " not found for workflow: " + workflowId);
        }

        // Get workflow version
        WorkflowVersionEntity workflowVersion = WorkflowVersionEntity.find(
                "workflowId = ?1 and version = ?2", workflowId, revisionEntity.workflowVersion).firstResult();

        // Parse refs and fetch versions
        List<VersionRef> nodeRefs = deserializeRefs(revisionEntity.nodeRefs);
        List<VersionRef> edgeRefs = deserializeRefs(revisionEntity.edgeRefs);
        List<VersionRef> triggerRefs = deserializeRefs(revisionEntity.triggerRefs);

        List<WorkflowNodeVersionEntity> nodeVersions = new ArrayList<>();
        for (VersionRef ref : nodeRefs) {
            WorkflowNodeVersionEntity nodeVersion = WorkflowNodeVersionEntity.find(
                    "nodeId = ?1 and version = ?2", ref.getId(), ref.getVersion()).firstResult();
            if (nodeVersion != null) {
                nodeVersions.add(nodeVersion);
            }
        }

        List<WorkflowEdgeVersionEntity> edgeVersions = new ArrayList<>();
        for (VersionRef ref : edgeRefs) {
            WorkflowEdgeVersionEntity edgeVersion = WorkflowEdgeVersionEntity.find(
                    "edgeId = ?1 and version = ?2", ref.getId(), ref.getVersion()).firstResult();
            if (edgeVersion != null) {
                edgeVersions.add(edgeVersion);
            }
        }

        List<WorkflowTriggerVersionEntity> triggerVersions = new ArrayList<>();
        for (VersionRef ref : triggerRefs) {
            WorkflowTriggerVersionEntity triggerVersion = WorkflowTriggerVersionEntity.find(
                    "triggerId = ?1 and version = ?2", ref.getId(), ref.getVersion()).firstResult();
            if (triggerVersion != null) {
                triggerVersions.add(triggerVersion);
            }
        }

        RevisionSnapshotDTO snapshot = new RevisionSnapshotDTO();
        snapshot.setRevision(revisionDTOMapper.toDTO(revisionEntity));
        snapshot.setWorkflow(revisionDTOMapper.toDTO(workflowVersion));
        snapshot.setNodes(revisionDTOMapper.toNodeVersionDTOList(nodeVersions));
        snapshot.setEdges(revisionDTOMapper.toEdgeVersionDTOList(edgeVersions));
        snapshot.setTriggers(revisionDTOMapper.toTriggerVersionDTOList(triggerVersions));

        return snapshot;
    }

    /**
     * Lists all revisions for a workflow with pagination.
     */
    public ListRevisionsResponse listRevisions(UUID workflowId, int page, int limit) {
        long total = WorkflowRevisionEntity.count("workflowId", workflowId);
        List<WorkflowRevisionEntity> entities = WorkflowRevisionEntity.find(
                "workflowId = ?1 order by revision desc", workflowId)
                .page(page, limit)
                .list();

        ListRevisionsResponse response = new ListRevisionsResponse();
        response.setRevisions(revisionDTOMapper.toRevisionDTOList(entities));
        response.setPage(page);
        response.setLimit(limit);
        response.setTotal(total);
        response.setTotalPages((int) Math.ceil((double) total / limit));

        return response;
    }

    /**
     * Deletes a revision (cannot delete published revision).
     */
    public void deleteRevision(UUID workflowId, int revision) throws RevisionNotFoundException {
        WorkflowRevisionEntity entity = WorkflowRevisionEntity.find(
                "workflowId = ?1 and revision = ?2", workflowId, revision).firstResult();
        if (entity == null) {
            throw new RevisionNotFoundException("Revision " + revision + " not found for workflow: " + workflowId);
        }

        // Check if this revision is currently published
        WorkflowPublishedVersionEntity published = WorkflowPublishedVersionEntity.find(
                "workflowId", workflowId).firstResult();
        if (published != null && published.revision == revision) {
            throw new IllegalStateException("Cannot delete the currently published revision");
        }

        entity.delete();
    }

    // ==================== Publishing ====================

    /**
     * Publishes a specific revision.
     */
    public WorkflowPublishedVersionDTO publishRevision(UUID workflowId, int revision, String publishedBy)
            throws RevisionNotFoundException, WorkflowNotFoundException {
        // Verify the revision exists
        WorkflowRevisionEntity revisionEntity = WorkflowRevisionEntity.find(
                "workflowId = ?1 and revision = ?2", workflowId, revision).firstResult();
        if (revisionEntity == null) {
            throw new RevisionNotFoundException("Revision " + revision + " not found for workflow: " + workflowId);
        }

        // Verify the workflow exists
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Upsert published version
        WorkflowPublishedVersionEntity published = WorkflowPublishedVersionEntity.find(
                "workflowId", workflowId).firstResult();
        if (published == null) {
            published = new WorkflowPublishedVersionEntity();
            published.workflowId = workflowId;
        }
        published.revision = revision;
        published.publishedBy = publishedBy;
        published.publishedAt = java.time.Instant.now();
        published.persist();

        return revisionDTOMapper.toDTO(published);
    }

    /**
     * Gets the currently published version for a workflow.
     */
    public WorkflowPublishedVersionDTO getPublishedVersion(UUID workflowId) {
        WorkflowPublishedVersionEntity published = WorkflowPublishedVersionEntity.find(
                "workflowId", workflowId).firstResult();
        if (published == null) {
            return null;
        }
        return revisionDTOMapper.toDTO(published);
    }

    /**
     * Gets the full snapshot of the currently published revision.
     */
    public RevisionSnapshotDTO getPublishedSnapshot(UUID workflowId) throws RevisionNotFoundException {
        WorkflowPublishedVersionEntity published = WorkflowPublishedVersionEntity.find(
                "workflowId", workflowId).firstResult();
        if (published == null) {
            throw new RevisionNotFoundException("No published version found for workflow: " + workflowId);
        }
        return getRevisionSnapshot(workflowId, published.revision);
    }

    /**
     * One-click: creates a revision from current state and publishes it.
     */
    public PublishCurrentResponse publishCurrent(UUID workflowId, String publishedBy, String description)
            throws WorkflowNotFoundException {
        // Create a revision request with optional description
        CreateRevisionRequest request = new CreateRevisionRequest();
        request.setDescription(description);

        // Create revision
        WorkflowRevisionDTO revision = createRevision(workflowId, publishedBy, request);

        // Publish it
        WorkflowPublishedVersionDTO published;
        try {
            published = publishRevision(workflowId, revision.getRevision(), publishedBy);
        } catch (RevisionNotFoundException e) {
            // Should not happen since we just created it
            throw new RuntimeException("Failed to publish just-created revision", e);
        }

        PublishCurrentResponse response = new PublishCurrentResponse();
        response.setRevision(revision);
        response.setPublishedVersion(published);

        return response;
    }

    // ==================== Restore ====================

    /**
     * Restores a workflow to a specific revision's state.
     * Uses update-in-place strategy to preserve execution history.
     * Creates a new revision after restoring.
     */
    public WorkflowRevisionDTO restoreRevision(UUID workflowId, int revision, String restoredBy, String description)
            throws RevisionNotFoundException, WorkflowNotFoundException {
        // Get the snapshot to restore from
        RevisionSnapshotDTO snapshot = getRevisionSnapshot(workflowId, revision);

        // Get the current workflow
        WorkflowEntity workflow = WorkflowEntity.findById(workflowId);
        if (workflow == null) {
            throw new WorkflowNotFoundException("Workflow not found with id: " + workflowId);
        }

        // Restore workflow metadata
        WorkflowVersionDTO workflowVersion = snapshot.getWorkflow();
        workflow.name = workflowVersion.getName();
        workflow.description = workflowVersion.getDescription();
        workflow.variables = workflowVersion.getVariables();
        workflow.viewport = workflowVersion.getViewport();
        workflow.persist();

        // Build maps for current state
        java.util.Map<UUID, WorkflowNodeEntity> currentNodesById = new java.util.HashMap<>();
        for (WorkflowNodeEntity node : workflow.nodes) {
            currentNodesById.put(node.id, node);
        }

        java.util.Map<UUID, WorkflowTriggerEntity> currentTriggersById = new java.util.HashMap<>();
        for (WorkflowTriggerEntity trigger : workflow.triggers) {
            currentTriggersById.put(trigger.id, trigger);
        }

        // Build set of snapshot node IDs and trigger IDs
        java.util.Set<UUID> snapshotNodeIds = new java.util.HashSet<>();
        for (WorkflowNodeVersionDTO nv : snapshot.getNodes()) {
            snapshotNodeIds.add(nv.getNodeId());
        }

        java.util.Set<UUID> snapshotTriggerIds = new java.util.HashSet<>();
        for (WorkflowTriggerVersionDTO tv : snapshot.getTriggers()) {
            snapshotTriggerIds.add(tv.getTriggerId());
        }

        // Delete all edges first (they don't have execution history references)
        workflow.edges.forEach(e -> e.delete());
        workflow.edges.clear();

        // Process nodes: update existing, create new, delete unused (if no executions)
        java.util.Map<UUID, WorkflowNodeEntity> nodeMap = new java.util.HashMap<>();

        for (WorkflowNodeVersionDTO nodeVersion : snapshot.getNodes()) {
            UUID originalNodeId = nodeVersion.getNodeId();
            WorkflowNodeEntity existingNode = currentNodesById.get(originalNodeId);

            if (existingNode != null) {
                // Update existing node in place (preserves execution history references)
                existingNode.name = nodeVersion.getName();
                existingNode.type = nodeVersion.getType();
                existingNode.configuration = nodeVersion.getConfiguration();
                existingNode.ports = nodeVersion.getPorts();
                existingNode.positionX = nodeVersion.getPositionX();
                existingNode.positionY = nodeVersion.getPositionY();
                existingNode.maxRetries = nodeVersion.getMaxRetries();
                existingNode.retryDelayMs = nodeVersion.getRetryDelayMs();
                existingNode.timeoutMs = nodeVersion.getTimeoutMs();
                existingNode.persist();
                nodeMap.put(originalNodeId, existingNode);
                // Remove from current map so we know what's left to delete
                currentNodesById.remove(originalNodeId);
            } else {
                // Create new node (original was deleted)
                WorkflowNodeEntity newNode = new WorkflowNodeEntity();
                newNode.workflow = workflow;
                newNode.name = nodeVersion.getName();
                newNode.type = nodeVersion.getType();
                newNode.configuration = nodeVersion.getConfiguration();
                newNode.ports = nodeVersion.getPorts();
                newNode.positionX = nodeVersion.getPositionX();
                newNode.positionY = nodeVersion.getPositionY();
                newNode.maxRetries = nodeVersion.getMaxRetries();
                newNode.retryDelayMs = nodeVersion.getRetryDelayMs();
                newNode.timeoutMs = nodeVersion.getTimeoutMs();
                newNode.persist();
                workflow.nodes.add(newNode);
                nodeMap.put(originalNodeId, newNode);
            }
        }

        // Delete nodes that are not in the snapshot (if they have no executions)
        for (WorkflowNodeEntity nodeToRemove : currentNodesById.values()) {
            long executionCount = NodeExecutionEntity.count("node.id", nodeToRemove.id);
            if (executionCount == 0) {
                workflow.nodes.remove(nodeToRemove);
                nodeToRemove.delete();
            }
            // If has executions, leave it orphaned - history preserved
        }

        // Recreate edges from snapshot
        for (WorkflowEdgeVersionDTO edgeVersion : snapshot.getEdges()) {
            WorkflowNodeEntity sourceNode = nodeMap.get(edgeVersion.getSourceNodeId());
            WorkflowNodeEntity targetNode = nodeMap.get(edgeVersion.getTargetNodeId());

            // Only create edge if both nodes exist
            if (sourceNode != null && targetNode != null) {
                WorkflowEdgeEntity edge = new WorkflowEdgeEntity();
                edge.workflow = workflow;
                edge.sourceNode = sourceNode;
                edge.targetNode = targetNode;
                edge.sourcePortId = edgeVersion.getSourcePortId();
                edge.targetPortId = edgeVersion.getTargetPortId();
                edge.condition = edgeVersion.getCondition();
                edge.label = edgeVersion.getLabel();
                edge.priority = edgeVersion.getPriority();
                edge.persist();
                workflow.edges.add(edge);
            }
        }

        // Process triggers: update existing, create new, delete unused
        for (WorkflowTriggerVersionDTO triggerVersion : snapshot.getTriggers()) {
            UUID originalTriggerId = triggerVersion.getTriggerId();
            WorkflowTriggerEntity existingTrigger = currentTriggersById.get(originalTriggerId);

            if (existingTrigger != null) {
                // Update existing trigger in place
                existingTrigger.name = triggerVersion.getName();
                existingTrigger.type = triggerVersion.getType();
                existingTrigger.configuration = triggerVersion.getConfiguration();
                existingTrigger.enabled = triggerVersion.isEnabled();
                existingTrigger.webhookToken = triggerVersion.getWebhookToken();
                existingTrigger.persist();
                currentTriggersById.remove(originalTriggerId);
            } else {
                // Create new trigger
                WorkflowTriggerEntity newTrigger = new WorkflowTriggerEntity();
                newTrigger.workflow = workflow;
                newTrigger.name = triggerVersion.getName();
                newTrigger.type = triggerVersion.getType();
                newTrigger.configuration = triggerVersion.getConfiguration();
                newTrigger.enabled = triggerVersion.isEnabled();
                newTrigger.webhookToken = triggerVersion.getWebhookToken();
                newTrigger.persist();
                workflow.triggers.add(newTrigger);
            }
        }

        // Delete triggers not in snapshot
        for (WorkflowTriggerEntity triggerToRemove : currentTriggersById.values()) {
            workflow.triggers.remove(triggerToRemove);
            triggerToRemove.delete();
        }

        // Create a new revision after restore
        CreateRevisionRequest request = new CreateRevisionRequest();
        request.setDescription(description != null ? description : "Restored from revision " + revision);
        request.setVersionLabel("Restored from r" + revision);

        return createRevision(workflowId, restoredBy, request);
    }

    // ==================== History ====================

    /**
     * Gets recent changes across all version tables for a workflow.
     */
    public RecentChangesResponse getRecentChanges(UUID workflowId, int limit) {
        List<RecentChangesResponse.ChangeEntry> changes = new ArrayList<>();

        // Get recent workflow versions
        List<WorkflowVersionEntity> workflowVersions = WorkflowVersionEntity.find(
                "workflowId = ?1 order by createdAt desc", workflowId)
                .page(0, limit)
                .list();
        for (WorkflowVersionEntity v : workflowVersions) {
            changes.add(new RecentChangesResponse.ChangeEntry(
                    "workflow", v.workflowId, v.version, v.createdBy, v.createdAt));
        }

        // Get recent node versions
        List<WorkflowNodeVersionEntity> nodeVersions = WorkflowNodeVersionEntity.find(
                "workflowId = ?1 order by createdAt desc", workflowId)
                .page(0, limit)
                .list();
        for (WorkflowNodeVersionEntity v : nodeVersions) {
            changes.add(new RecentChangesResponse.ChangeEntry(
                    "node", v.nodeId, v.version, v.createdBy, v.createdAt));
        }

        // Get recent edge versions
        List<WorkflowEdgeVersionEntity> edgeVersions = WorkflowEdgeVersionEntity.find(
                "workflowId = ?1 order by createdAt desc", workflowId)
                .page(0, limit)
                .list();
        for (WorkflowEdgeVersionEntity v : edgeVersions) {
            changes.add(new RecentChangesResponse.ChangeEntry(
                    "edge", v.edgeId, v.version, v.createdBy, v.createdAt));
        }

        // Get recent trigger versions
        List<WorkflowTriggerVersionEntity> triggerVersions = WorkflowTriggerVersionEntity.find(
                "workflowId = ?1 order by createdAt desc", workflowId)
                .page(0, limit)
                .list();
        for (WorkflowTriggerVersionEntity v : triggerVersions) {
            changes.add(new RecentChangesResponse.ChangeEntry(
                    "trigger", v.triggerId, v.version, v.createdBy, v.createdAt));
        }

        // Sort by createdAt descending and limit
        changes.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        if (changes.size() > limit) {
            changes = changes.subList(0, limit);
        }

        RecentChangesResponse response = new RecentChangesResponse();
        response.setChanges(changes);
        return response;
    }

    // ==================== Helper Methods ====================

    private Integer getMaxWorkflowVersion(UUID workflowId) {
        return WorkflowVersionEntity.find("select max(version) from WorkflowVersionEntity where workflowId = ?1", workflowId)
                .project(Integer.class)
                .firstResult();
    }

    private Integer getMaxNodeVersion(UUID nodeId) {
        return WorkflowNodeVersionEntity.find("select max(version) from WorkflowNodeVersionEntity where nodeId = ?1", nodeId)
                .project(Integer.class)
                .firstResult();
    }

    private Integer getMaxEdgeVersion(UUID edgeId) {
        return WorkflowEdgeVersionEntity.find("select max(version) from WorkflowEdgeVersionEntity where edgeId = ?1", edgeId)
                .project(Integer.class)
                .firstResult();
    }

    private Integer getMaxTriggerVersion(UUID triggerId) {
        return WorkflowTriggerVersionEntity.find("select max(version) from WorkflowTriggerVersionEntity where triggerId = ?1", triggerId)
                .project(Integer.class)
                .firstResult();
    }

    private Integer getMaxRevision(UUID workflowId) {
        return WorkflowRevisionEntity.find("select max(revision) from WorkflowRevisionEntity where workflowId = ?1", workflowId)
                .project(Integer.class)
                .firstResult();
    }

    private String serializeRefs(List<VersionRef> refs) {
        try {
            return objectMapper.writeValueAsString(refs);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize version refs", e);
        }
    }

    private List<VersionRef> deserializeRefs(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<VersionRef>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize version refs", e);
        }
    }
}
