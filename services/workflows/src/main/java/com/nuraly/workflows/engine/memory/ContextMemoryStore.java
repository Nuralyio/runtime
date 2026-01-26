package com.nuraly.workflows.engine.memory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.llm.dto.LlmMessage;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.redis.datasource.value.ValueCommands;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Storage for conversation context with support for both in-memory and Redis backends.
 *
 * This store holds conversation history keyed by conversation ID.
 * It supports two cutoff modes:
 * - Token-based: limits context by estimated token count
 * - Message-based: limits context by number of messages
 *
 * Storage backends:
 * - "memory": In-memory storage (default, lost on restart, single worker only)
 * - "redis": Redis-based storage (persistent, supports distributed workers)
 *
 * Configure via: workflows.memory.storage=redis
 */
@ApplicationScoped
public class ContextMemoryStore {

    private static final Logger LOG = Logger.getLogger(ContextMemoryStore.class);

    // Approximate tokens per character (conservative estimate for multi-language support)
    private static final double TOKENS_PER_CHAR = 0.25;

    @Inject
    Configuration configuration;

    @Inject
    RedisDataSource redisDataSource;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory storage: conversationId -> list of messages
    private final Map<String, List<LlmMessage>> inMemoryStore = new ConcurrentHashMap<>();

    // Redis commands (initialized lazily)
    private ValueCommands<String, String> redisCommands;

    private boolean useRedis = false;

    @PostConstruct
    void init() {
        useRedis = "redis".equalsIgnoreCase(configuration.memoryStorage);
        if (useRedis) {
            try {
                redisCommands = redisDataSource.value(String.class, String.class);
                LOG.info("Context memory store initialized with Redis backend");
            } catch (Exception e) {
                LOG.warnf("Failed to initialize Redis, falling back to in-memory: %s", e.getMessage());
                useRedis = false;
            }
        } else {
            LOG.info("Context memory store initialized with in-memory backend");
        }
    }

    /**
     * Add a message to a conversation.
     */
    public void addMessage(String conversationId, LlmMessage message) {
        if (conversationId == null || message == null) {
            LOG.warn("Cannot add message: conversationId or message is null");
            return;
        }

        if (useRedis) {
            addMessageToRedis(conversationId, message);
        } else {
            addMessageToMemory(conversationId, message);
        }
    }

    private void addMessageToMemory(String conversationId, LlmMessage message) {
        inMemoryStore.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(message);
        LOG.debugf("Added message to conversation %s (role: %s), total messages: %d",
                conversationId, message.getRole(), inMemoryStore.get(conversationId).size());
    }

    private void addMessageToRedis(String conversationId, LlmMessage message) {
        try {
            String key = getRedisKey(conversationId);
            List<LlmMessage> messages = getMessagesFromRedis(conversationId);
            messages.add(message);
            String json = objectMapper.writeValueAsString(messages);
            redisCommands.setex(key, configuration.memoryTtlSeconds, json);
            LOG.debugf("Added message to Redis conversation %s (role: %s), total messages: %d",
                    conversationId, message.getRole(), messages.size());
        } catch (Exception e) {
            LOG.errorf("Failed to add message to Redis: %s", e.getMessage());
        }
    }

    /**
     * Add multiple messages to a conversation.
     */
    public void addMessages(String conversationId, List<LlmMessage> messages) {
        if (conversationId == null || messages == null || messages.isEmpty()) {
            return;
        }

        if (useRedis) {
            try {
                String key = getRedisKey(conversationId);
                List<LlmMessage> existingMessages = getMessagesFromRedis(conversationId);
                existingMessages.addAll(messages);
                String json = objectMapper.writeValueAsString(existingMessages);
                redisCommands.setex(key, configuration.memoryTtlSeconds, json);
            } catch (Exception e) {
                LOG.errorf("Failed to add messages to Redis: %s", e.getMessage());
            }
        } else {
            for (LlmMessage message : messages) {
                addMessageToMemory(conversationId, message);
            }
        }
    }

    /**
     * Get messages for a conversation with message-based cutoff.
     * Returns the most recent N messages (preserving chronological order).
     *
     * @param conversationId The conversation ID
     * @param maxMessages Maximum number of messages to return (0 or negative for no limit)
     * @return List of messages in chronological order
     */
    public List<LlmMessage> getMessagesByCount(String conversationId, int maxMessages) {
        List<LlmMessage> allMessages = useRedis
                ? getMessagesFromRedis(conversationId)
                : inMemoryStore.get(conversationId);

        if (allMessages == null || allMessages.isEmpty()) {
            return new ArrayList<>();
        }

        if (maxMessages <= 0 || allMessages.size() <= maxMessages) {
            return new ArrayList<>(allMessages);
        }

        // Return the most recent messages
        int startIndex = allMessages.size() - maxMessages;
        return new ArrayList<>(allMessages.subList(startIndex, allMessages.size()));
    }

    /**
     * Get messages for a conversation with token-based cutoff.
     * Returns the most recent messages that fit within the token limit.
     *
     * @param conversationId The conversation ID
     * @param maxTokens Maximum number of tokens (0 or negative for no limit)
     * @return List of messages in chronological order
     */
    public List<LlmMessage> getMessagesByTokens(String conversationId, int maxTokens) {
        List<LlmMessage> allMessages = useRedis
                ? getMessagesFromRedis(conversationId)
                : inMemoryStore.get(conversationId);

        if (allMessages == null || allMessages.isEmpty()) {
            return new ArrayList<>();
        }

        if (maxTokens <= 0) {
            return new ArrayList<>(allMessages);
        }

        // Calculate from the end to include most recent messages
        List<LlmMessage> result = new ArrayList<>();
        int totalTokens = 0;

        // Iterate from most recent to oldest
        for (int i = allMessages.size() - 1; i >= 0; i--) {
            LlmMessage message = allMessages.get(i);
            int messageTokens = estimateTokens(message);

            if (totalTokens + messageTokens > maxTokens && !result.isEmpty()) {
                // Would exceed limit and we already have messages
                break;
            }

            result.add(0, message); // Add at beginning to maintain chronological order
            totalTokens += messageTokens;
        }

        LOG.debugf("Retrieved %d messages for conversation %s (estimated %d tokens, limit: %d)",
                result.size(), conversationId, totalTokens, maxTokens);

        return result;
    }

    /**
     * Get all messages for a conversation without any cutoff.
     */
    public List<LlmMessage> getAllMessages(String conversationId) {
        if (useRedis) {
            return getMessagesFromRedis(conversationId);
        }
        List<LlmMessage> messages = inMemoryStore.get(conversationId);
        return messages != null ? new ArrayList<>(messages) : new ArrayList<>();
    }

    /**
     * Clear a conversation's history.
     */
    public void clearConversation(String conversationId) {
        if (useRedis) {
            try {
                redisCommands.getdel(getRedisKey(conversationId));
            } catch (Exception e) {
                LOG.errorf("Failed to clear Redis conversation: %s", e.getMessage());
            }
        } else {
            inMemoryStore.remove(conversationId);
        }
        LOG.debugf("Cleared conversation: %s", conversationId);
    }

    /**
     * Check if a conversation exists.
     */
    public boolean hasConversation(String conversationId) {
        if (useRedis) {
            try {
                String value = redisCommands.get(getRedisKey(conversationId));
                return value != null && !value.isEmpty();
            } catch (Exception e) {
                return false;
            }
        }
        return inMemoryStore.containsKey(conversationId) &&
               !inMemoryStore.get(conversationId).isEmpty();
    }

    /**
     * Get the total number of messages in a conversation.
     */
    public int getMessageCount(String conversationId) {
        if (useRedis) {
            return getMessagesFromRedis(conversationId).size();
        }
        List<LlmMessage> messages = inMemoryStore.get(conversationId);
        return messages != null ? messages.size() : 0;
    }

    /**
     * Get the Redis key for a conversation.
     */
    private String getRedisKey(String conversationId) {
        return configuration.memoryRedisKeyPrefix + conversationId;
    }

    /**
     * Get messages from Redis.
     */
    private List<LlmMessage> getMessagesFromRedis(String conversationId) {
        try {
            String json = redisCommands.get(getRedisKey(conversationId));
            if (json == null || json.isEmpty()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(json, new TypeReference<List<LlmMessage>>() {});
        } catch (Exception e) {
            LOG.errorf("Failed to get messages from Redis: %s", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Estimate the number of tokens in a message.
     * Uses a simple character-based heuristic.
     */
    public int estimateTokens(LlmMessage message) {
        if (message == null) {
            return 0;
        }

        int tokens = 0;

        // Content tokens
        if (message.getContent() != null) {
            tokens += (int) (message.getContent().length() * TOKENS_PER_CHAR);
        }

        // Role overhead (approximately 4 tokens per message for formatting)
        tokens += 4;

        // Tool call overhead
        if (message.getToolCalls() != null && !message.getToolCalls().isEmpty()) {
            for (var toolCall : message.getToolCalls()) {
                tokens += 10; // Base overhead for tool call structure
                if (toolCall.getName() != null) {
                    tokens += (int) (toolCall.getName().length() * TOKENS_PER_CHAR);
                }
                if (toolCall.getArguments() != null) {
                    tokens += (int) (toolCall.getArguments().toString().length() * TOKENS_PER_CHAR);
                }
            }
        }

        // Tool result overhead
        if (message.getName() != null) {
            tokens += (int) (message.getName().length() * TOKENS_PER_CHAR);
        }

        return Math.max(tokens, 1);
    }

    /**
     * Estimate total tokens for a list of messages.
     */
    public int estimateTotalTokens(List<LlmMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return 0;
        }
        return messages.stream().mapToInt(this::estimateTokens).sum();
    }

    /**
     * Check if Redis backend is being used.
     */
    public boolean isUsingRedis() {
        return useRedis;
    }
}
