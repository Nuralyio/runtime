package com.nuraly.whiteboard.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.whiteboard.collaboration.CollaborationService;
import com.nuraly.whiteboard.collaboration.Operation;
import com.nuraly.whiteboard.service.WhiteboardService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket endpoint for real-time whiteboard collaboration.
 * Handles cursor tracking, selection sync, and operation broadcasting.
 */
@ServerEndpoint("/ws/whiteboard/{whiteboardId}")
@ApplicationScoped
public class WhiteboardWebSocket {

    private static final Logger LOG = Logger.getLogger(WhiteboardWebSocket.class);

    // Active sessions per whiteboard
    private final Map<String, Set<Session>> whiteboardSessions = new ConcurrentHashMap<>();

    // User info per session
    private final Map<Session, UserInfo> sessionUsers = new ConcurrentHashMap<>();

    // Cursor throttling
    private final Map<Session, Long> lastCursorUpdate = new ConcurrentHashMap<>();
    private static final long CURSOR_THROTTLE_MS = 33; // ~30fps

    @Inject
    ObjectMapper objectMapper;

    @Inject
    WhiteboardService whiteboardService;

    @Inject
    CollaborationService collaborationService;

    @OnOpen
    public void onOpen(Session session, @PathParam("whiteboardId") String whiteboardId) {
        LOG.infof("WebSocket opened for whiteboard %s, session %s", whiteboardId, session.getId());

        // Add to whiteboard sessions
        whiteboardSessions.computeIfAbsent(whiteboardId, k -> ConcurrentHashMap.newKeySet())
                .add(session);

        // Store user info (will be updated on join message)
        UserInfo userInfo = new UserInfo();
        userInfo.whiteboardId = whiteboardId;
        userInfo.sessionId = session.getId();
        sessionUsers.put(session, userInfo);
    }

    @OnClose
    public void onClose(Session session, @PathParam("whiteboardId") String whiteboardId) {
        LOG.infof("WebSocket closed for whiteboard %s, session %s", whiteboardId, session.getId());

        // Remove from whiteboard sessions
        Set<Session> sessions = whiteboardSessions.get(whiteboardId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                whiteboardSessions.remove(whiteboardId);
            }
        }

        // Get user info before removing
        UserInfo userInfo = sessionUsers.remove(session);
        lastCursorUpdate.remove(session);

        // Broadcast user left
        if (userInfo != null && userInfo.userId != null) {
            broadcastToWhiteboard(whiteboardId, session, Map.of(
                    "type", "user:left",
                    "userId", userInfo.userId,
                    "timestamp", Instant.now().toEpochMilli()
            ));
        }
    }

    @OnError
    public void onError(Session session, @PathParam("whiteboardId") String whiteboardId, Throwable throwable) {
        LOG.errorf(throwable, "WebSocket error for whiteboard %s, session %s", whiteboardId, session.getId());
    }

    @OnMessage
    public void onMessage(String message, Session session, @PathParam("whiteboardId") String whiteboardId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(message, Map.class);
            String type = (String) data.get("type");

            switch (type) {
                case "join" -> handleJoin(session, whiteboardId, data);
                case "cursor:move" -> handleCursorMove(session, whiteboardId, data);
                case "selection:change" -> handleSelectionChange(session, whiteboardId, data);
                case "typing:start" -> handleTypingStart(session, whiteboardId, data);
                case "typing:stop" -> handleTypingStop(session, whiteboardId, data);
                case "operation:apply" -> handleOperation(session, whiteboardId, data);
                default -> LOG.warnf("Unknown message type: %s", type);
            }
        } catch (Exception e) {
            LOG.errorf(e, "Error processing WebSocket message");
            sendError(session, "Invalid message format");
        }
    }

    private void handleJoin(Session session, String whiteboardId, Map<String, Object> data) {
        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null) return;

        userInfo.userId = (String) data.get("userId");
        userInfo.username = (String) data.get("username");
        userInfo.color = generateUserColor(userInfo.userId);

        // Broadcast user joined
        broadcastToWhiteboard(whiteboardId, session, Map.of(
                "type", "user:joined",
                "userId", userInfo.userId,
                "username", userInfo.username,
                "color", userInfo.color,
                "timestamp", Instant.now().toEpochMilli()
        ));

        // Send current users list to the new user
        List<Map<String, Object>> users = new ArrayList<>();
        Set<Session> sessions = whiteboardSessions.get(whiteboardId);
        if (sessions != null) {
            for (Session s : sessions) {
                UserInfo info = sessionUsers.get(s);
                if (info != null && info.userId != null) {
                    users.add(Map.of(
                            "userId", info.userId,
                            "username", info.username != null ? info.username : "Unknown",
                            "color", info.color != null ? info.color : "#888888"
                    ));
                }
            }
        }

        sendToSession(session, Map.of(
                "type", "users:sync",
                "users", users
        ));
    }

    private void handleCursorMove(Session session, String whiteboardId, Map<String, Object> data) {
        // Throttle cursor updates
        Long lastUpdate = lastCursorUpdate.get(session);
        long now = System.currentTimeMillis();
        if (lastUpdate != null && (now - lastUpdate) < CURSOR_THROTTLE_MS) {
            return;
        }
        lastCursorUpdate.put(session, now);

        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null || userInfo.userId == null) return;

        broadcastToWhiteboard(whiteboardId, session, Map.of(
                "type", "cursor:update",
                "userId", userInfo.userId,
                "username", userInfo.username != null ? userInfo.username : "Unknown",
                "color", userInfo.color != null ? userInfo.color : "#888888",
                "x", data.get("x"),
                "y", data.get("y"),
                "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private void handleSelectionChange(Session session, String whiteboardId, Map<String, Object> data) {
        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null || userInfo.userId == null) return;

        broadcastToWhiteboard(whiteboardId, session, Map.of(
                "type", "selection:update",
                "userId", userInfo.userId,
                "elementIds", data.get("elementIds"),
                "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private void handleTypingStart(Session session, String whiteboardId, Map<String, Object> data) {
        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null || userInfo.userId == null) return;

        broadcastToWhiteboard(whiteboardId, session, Map.of(
                "type", "typing:indicator",
                "userId", userInfo.userId,
                "elementId", data.get("elementId"),
                "isTyping", true,
                "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private void handleTypingStop(Session session, String whiteboardId, Map<String, Object> data) {
        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null || userInfo.userId == null) return;

        broadcastToWhiteboard(whiteboardId, session, Map.of(
                "type", "typing:indicator",
                "userId", userInfo.userId,
                "elementId", data.get("elementId"),
                "isTyping", false,
                "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private void handleOperation(Session session, String whiteboardId, Map<String, Object> data) {
        UserInfo userInfo = sessionUsers.get(session);
        if (userInfo == null || userInfo.userId == null) return;

        try {
            // Parse operation
            Operation operation = new Operation();
            operation.id = UUID.randomUUID().toString();
            operation.type = Operation.OperationType.valueOf((String) data.get("operationType"));
            operation.elementId = (String) data.get("elementId");
            operation.data = data.get("data");
            operation.userId = userInfo.userId;
            operation.timestamp = Instant.now();

            Long baseVersion = data.get("baseVersion") != null
                    ? ((Number) data.get("baseVersion")).longValue()
                    : 0L;

            // Transform and apply operation
            Operation transformed = collaborationService.transformAndApply(
                    UUID.fromString(whiteboardId),
                    operation,
                    baseVersion
            );

            // Acknowledge to sender
            sendToSession(session, Map.of(
                    "type", "operation:ack",
                    "operationId", operation.id,
                    "serverVersion", transformed.version
            ));

            // Broadcast to others
            broadcastToWhiteboard(whiteboardId, session, Map.of(
                    "type", "operation:received",
                    "operation", Map.of(
                            "id", transformed.id,
                            "type", transformed.type.name(),
                            "elementId", transformed.elementId != null ? transformed.elementId : "",
                            "data", transformed.data != null ? transformed.data : Map.of(),
                            "userId", transformed.userId,
                            "version", transformed.version,
                            "timestamp", transformed.timestamp.toEpochMilli()
                    )
            ));

        } catch (Exception e) {
            LOG.errorf(e, "Error handling operation");
            sendError(session, "Failed to apply operation: " + e.getMessage());
        }
    }

    private void broadcastToWhiteboard(String whiteboardId, Session excludeSession, Map<String, Object> message) {
        Set<Session> sessions = whiteboardSessions.get(whiteboardId);
        if (sessions == null) return;

        String json;
        try {
            json = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            LOG.errorf(e, "Error serializing message");
            return;
        }

        for (Session s : sessions) {
            if (s != excludeSession && s.isOpen()) {
                s.getAsyncRemote().sendText(json);
            }
        }
    }

    private void sendToSession(Session session, Map<String, Object> message) {
        if (!session.isOpen()) return;

        try {
            String json = objectMapper.writeValueAsString(message);
            session.getAsyncRemote().sendText(json);
        } catch (Exception e) {
            LOG.errorf(e, "Error sending message to session");
        }
    }

    private void sendError(Session session, String errorMessage) {
        sendToSession(session, Map.of(
                "type", "error",
                "message", errorMessage,
                "timestamp", Instant.now().toEpochMilli()
        ));
    }

    private String generateUserColor(String userId) {
        // Generate consistent color from user ID
        int hash = userId != null ? userId.hashCode() : 0;
        String[] colors = {
                "#ef4444", "#f97316", "#f59e0b", "#84cc16",
                "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
                "#6366f1", "#8b5cf6", "#a855f7", "#ec4899"
        };
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * User info stored per WebSocket session.
     */
    private static class UserInfo {
        String whiteboardId;
        String sessionId;
        String userId;
        String username;
        String color;
    }
}
