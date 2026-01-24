package com.nuraly.journal.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nuraly.journal.dto.LogEntryDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * WebSocket endpoint for real-time log streaming.
 *
 * Connect to: ws://host:port/api/v1/logs/stream/{filter}
 *
 * Filter can be:
 * - "all" - receive all logs
 * - service name (e.g., "workflows") - receive logs from that service
 * - "type:execution" - receive logs of specific type
 */
@ServerEndpoint("/api/v1/logs/stream/{filter}")
@ApplicationScoped
public class LogStreamSocket {

    private static final Logger LOGGER = Logger.getLogger(LogStreamSocket.class.getName());

    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // All connected sessions
    private final Set<Session> sessions = new CopyOnWriteArraySet<>();

    // Sessions grouped by filter
    private final Map<String, Set<Session>> filterSessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("filter") String filter) {
        sessions.add(session);
        filterSessions.computeIfAbsent(filter, k -> new CopyOnWriteArraySet<>()).add(session);
        LOGGER.info("WebSocket client connected: " + session.getId() + " with filter: " + filter);
    }

    @OnClose
    public void onClose(Session session, @PathParam("filter") String filter) {
        sessions.remove(session);
        Set<Session> filtered = filterSessions.get(filter);
        if (filtered != null) {
            filtered.remove(session);
        }
        LOGGER.info("WebSocket client disconnected: " + session.getId());
    }

    @OnError
    public void onError(Session session, @PathParam("filter") String filter, Throwable throwable) {
        sessions.remove(session);
        Set<Session> filtered = filterSessions.get(filter);
        if (filtered != null) {
            filtered.remove(session);
        }
        LOGGER.log(Level.WARNING, "WebSocket error for session " + session.getId(), throwable);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        // Client can send ping/pong or filter updates
        LOGGER.fine("Received message from " + session.getId() + ": " + message);
    }

    /**
     * Broadcast a log entry to all connected clients.
     * Respects client filters.
     */
    public void broadcast(LogEntryDTO log) {
        if (sessions.isEmpty()) {
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(log);

            for (Map.Entry<String, Set<Session>> entry : filterSessions.entrySet()) {
                String filter = entry.getKey();
                Set<Session> filteredSessions = entry.getValue();

                if (shouldSendToFilter(filter, log)) {
                    for (Session session : filteredSessions) {
                        sendToSession(session, json);
                    }
                }
            }
        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Failed to broadcast log", e);
        }
    }

    private boolean shouldSendToFilter(String filter, LogEntryDTO log) {
        if ("all".equalsIgnoreCase(filter)) {
            return true;
        }

        // Filter by service name
        if (filter.equalsIgnoreCase(log.getService())) {
            return true;
        }

        // Filter by type (format: "type:execution")
        if (filter.startsWith("type:")) {
            String typeFilter = filter.substring(5);
            return typeFilter.equalsIgnoreCase(log.getType());
        }

        // Filter by level (format: "level:ERROR")
        if (filter.startsWith("level:")) {
            String levelFilter = filter.substring(6);
            return levelFilter.equalsIgnoreCase(log.getLevel());
        }

        return false;
    }

    private void sendToSession(Session session, String message) {
        if (session.isOpen()) {
            session.getAsyncRemote().sendText(message, result -> {
                if (result.getException() != null) {
                    LOGGER.log(Level.WARNING, "Failed to send message to session " + session.getId(),
                            result.getException());
                }
            });
        }
    }

    /**
     * Get the number of connected clients.
     */
    public int getConnectionCount() {
        return sessions.size();
    }
}
