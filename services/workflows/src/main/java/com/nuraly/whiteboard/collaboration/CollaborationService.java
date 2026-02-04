package com.nuraly.whiteboard.collaboration;

import com.nuraly.whiteboard.dto.CreateElementDTO;
import com.nuraly.whiteboard.service.WhiteboardService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for handling collaborative editing with Operational Transformation (OT).
 * Ensures consistency when multiple users edit the same whiteboard concurrently.
 */
@ApplicationScoped
public class CollaborationService {

    private static final Logger LOG = Logger.getLogger(CollaborationService.class);

    // Operation buffers per whiteboard (for OT)
    private final Map<UUID, OperationBuffer> operationBuffers = new ConcurrentHashMap<>();

    // Maximum operations to keep in buffer
    private static final int MAX_BUFFER_SIZE = 1000;

    @Inject
    WhiteboardService whiteboardService;

    /**
     * Transform an incoming operation against concurrent operations and apply it.
     *
     * @param whiteboardId The whiteboard ID
     * @param operation    The incoming operation
     * @param baseVersion  The client's base version
     * @return The transformed operation with assigned version
     */
    public Operation transformAndApply(UUID whiteboardId, Operation operation, long baseVersion) {
        OperationBuffer buffer = operationBuffers.computeIfAbsent(whiteboardId, k -> new OperationBuffer());

        synchronized (buffer) {
            // Get operations since base version
            List<Operation> concurrentOps = buffer.getOperationsSince(baseVersion);

            // Transform against each concurrent operation
            Operation transformed = operation;
            for (Operation concurrent : concurrentOps) {
                transformed = transform(transformed, concurrent);
                if (transformed == null) {
                    // Operation was invalidated (e.g., element was deleted)
                    return createNoOp(operation);
                }
            }

            // Assign version
            transformed.version = buffer.getNextVersion();
            transformed.timestamp = Instant.now();

            // Add to buffer
            buffer.add(transformed);

            // Apply to database
            applyOperation(whiteboardId, transformed);

            return transformed;
        }
    }

    /**
     * Transform operation op1 against operation op2.
     * Returns the transformed op1, or null if op1 should be discarded.
     */
    private Operation transform(Operation op1, Operation op2) {
        // Different elements - no transformation needed
        if (!op1.conflictsWith(op2)) {
            return op1;
        }

        // Same element - apply transformation based on operation types
        return switch (op1.type) {
            case MOVE -> transformMove(op1, op2);
            case UPDATE -> transformUpdate(op1, op2);
            case UPDATE_TEXT -> transformText(op1, op2);
            case DELETE -> transformDelete(op1, op2);
            case RESIZE -> transformResize(op1, op2);
            default -> op1;
        };
    }

    /**
     * Transform a MOVE operation against another operation.
     * Uses last-write-wins for position conflicts.
     */
    private Operation transformMove(Operation move, Operation other) {
        if (other.type == Operation.OperationType.DELETE) {
            // Element was deleted, discard move
            return null;
        }
        // Last-write-wins for moves
        return move;
    }

    /**
     * Transform an UPDATE operation against another operation.
     */
    private Operation transformUpdate(Operation update, Operation other) {
        if (other.type == Operation.OperationType.DELETE) {
            // Element was deleted, discard update
            return null;
        }
        // For property updates, last-write-wins
        return update;
    }

    /**
     * Transform a text UPDATE operation using character-level OT.
     */
    @SuppressWarnings("unchecked")
    private Operation transformText(Operation op1, Operation op2) {
        if (op2.type != Operation.OperationType.UPDATE_TEXT) {
            if (op2.type == Operation.OperationType.DELETE) {
                return null;
            }
            return op1;
        }

        // Simple position-based OT for text
        Map<String, Object> data1 = (Map<String, Object>) op1.data;
        Map<String, Object> data2 = (Map<String, Object>) op2.data;

        Integer pos1 = (Integer) data1.get("position");
        Integer pos2 = (Integer) data2.get("position");
        Integer insertLen2 = (Integer) data2.getOrDefault("insertLength", 0);
        Integer deleteLen2 = (Integer) data2.getOrDefault("deleteLength", 0);

        if (pos1 != null && pos2 != null && pos2 <= pos1) {
            // Adjust position based on the other operation
            int newPos = pos1 + insertLen2 - deleteLen2;
            Map<String, Object> newData = new HashMap<>(data1);
            newData.put("position", Math.max(0, newPos));
            op1.data = newData;
        }

        return op1;
    }

    /**
     * Transform a DELETE operation against another operation.
     */
    private Operation transformDelete(Operation delete, Operation other) {
        if (other.type == Operation.OperationType.DELETE) {
            // Both deleted the same element - return no-op
            return null;
        }
        // Delete takes precedence
        return delete;
    }

    /**
     * Transform a RESIZE operation against another operation.
     */
    private Operation transformResize(Operation resize, Operation other) {
        if (other.type == Operation.OperationType.DELETE) {
            return null;
        }
        // Last-write-wins for resize
        return resize;
    }

    /**
     * Apply the operation to the database.
     */
    @SuppressWarnings("unchecked")
    private void applyOperation(UUID whiteboardId, Operation operation) {
        try {
            switch (operation.type) {
                case ADD -> {
                    Map<String, Object> data = (Map<String, Object>) operation.data;
                    CreateElementDTO dto = mapToCreateElementDTO(data);
                    UUID userId = operation.userId != null ? UUID.fromString(operation.userId) : null;
                    whiteboardService.addElement(whiteboardId, dto, userId);
                }
                case UPDATE, MOVE, RESIZE, UPDATE_TEXT -> {
                    Map<String, Object> data = (Map<String, Object>) operation.data;
                    CreateElementDTO dto = mapToCreateElementDTO(data);
                    UUID userId = operation.userId != null ? UUID.fromString(operation.userId) : null;
                    whiteboardService.updateElement(
                            whiteboardId,
                            UUID.fromString(operation.elementId),
                            dto,
                            userId
                    );
                }
                case DELETE -> {
                    whiteboardService.deleteElement(
                            whiteboardId,
                            UUID.fromString(operation.elementId)
                    );
                }
                default -> LOG.warnf("Unhandled operation type: %s", operation.type);
            }
        } catch (Exception e) {
            LOG.errorf(e, "Failed to apply operation %s", operation.id);
        }
    }

    /**
     * Map operation data to CreateElementDTO.
     */
    private CreateElementDTO mapToCreateElementDTO(Map<String, Object> data) {
        CreateElementDTO dto = new CreateElementDTO();
        dto.name = (String) data.get("name");
        dto.elementType = (String) data.get("elementType");
        dto.positionX = (Integer) data.get("positionX");
        dto.positionY = (Integer) data.get("positionY");
        dto.width = (Integer) data.get("width");
        dto.height = (Integer) data.get("height");
        dto.zIndex = (Integer) data.get("zIndex");
        dto.rotation = data.get("rotation") != null ? ((Number) data.get("rotation")).floatValue() : null;
        dto.opacity = data.get("opacity") != null ? ((Number) data.get("opacity")).floatValue() : null;
        dto.backgroundColor = (String) data.get("backgroundColor");
        dto.textContent = (String) data.get("textContent");
        dto.fontSize = (Integer) data.get("fontSize");
        dto.textColor = (String) data.get("textColor");
        dto.shapeType = (String) data.get("shapeType");
        dto.fillColor = (String) data.get("fillColor");
        return dto;
    }

    /**
     * Create a no-op operation (used when operation is invalidated).
     */
    private Operation createNoOp(Operation original) {
        Operation noop = new Operation();
        noop.id = original.id;
        noop.type = original.type;
        noop.elementId = original.elementId;
        noop.userId = original.userId;
        noop.timestamp = Instant.now();
        noop.version = -1; // Indicates no-op
        noop.data = Map.of("noop", true, "reason", "Operation invalidated by concurrent edit");
        return noop;
    }

    /**
     * Get the current version for a whiteboard.
     */
    public long getCurrentVersion(UUID whiteboardId) {
        OperationBuffer buffer = operationBuffers.get(whiteboardId);
        return buffer != null ? buffer.getCurrentVersion() : 0;
    }

    /**
     * Clear the operation buffer for a whiteboard.
     */
    public void clearBuffer(UUID whiteboardId) {
        operationBuffers.remove(whiteboardId);
    }

    /**
     * Internal buffer for storing recent operations for OT.
     */
    private static class OperationBuffer {
        private final LinkedList<Operation> operations = new LinkedList<>();
        private long currentVersion = 0;

        synchronized void add(Operation operation) {
            operations.addLast(operation);
            currentVersion = operation.version;

            // Trim buffer if too large
            while (operations.size() > MAX_BUFFER_SIZE) {
                operations.removeFirst();
            }
        }

        synchronized List<Operation> getOperationsSince(long version) {
            List<Operation> result = new ArrayList<>();
            for (Operation op : operations) {
                if (op.version > version) {
                    result.add(op);
                }
            }
            return result;
        }

        synchronized long getNextVersion() {
            return ++currentVersion;
        }

        synchronized long getCurrentVersion() {
            return currentVersion;
        }
    }
}
