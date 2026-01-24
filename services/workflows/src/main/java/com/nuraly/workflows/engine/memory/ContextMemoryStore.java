package com.nuraly.workflows.engine.memory;

import com.nuraly.workflows.llm.dto.LlmMessage;
import jakarta.enterprise.context.ApplicationScoped;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory storage for conversation context.
 *
 * This store holds conversation history keyed by conversation ID.
 * It supports two cutoff modes:
 * - Token-based: limits context by estimated token count
 * - Message-based: limits context by number of messages
 *
 * Note: This is purely in-memory and will be lost on application restart.
 */
@ApplicationScoped
public class ContextMemoryStore {

    private static final Logger LOG = Logger.getLogger(ContextMemoryStore.class);

    // Approximate tokens per character (conservative estimate for multi-language support)
    private static final double TOKENS_PER_CHAR = 0.25;

    // In-memory storage: conversationId -> list of messages
    private final Map<String, List<LlmMessage>> conversations = new ConcurrentHashMap<>();

    /**
     * Add a message to a conversation.
     */
    public void addMessage(String conversationId, LlmMessage message) {
        if (conversationId == null || message == null) {
            LOG.warn("Cannot add message: conversationId or message is null");
            return;
        }

        conversations.computeIfAbsent(conversationId, k -> new ArrayList<>()).add(message);
        LOG.debugf("Added message to conversation %s (role: %s), total messages: %d",
                conversationId, message.getRole(), conversations.get(conversationId).size());
    }

    /**
     * Add multiple messages to a conversation.
     */
    public void addMessages(String conversationId, List<LlmMessage> messages) {
        if (conversationId == null || messages == null || messages.isEmpty()) {
            return;
        }

        for (LlmMessage message : messages) {
            addMessage(conversationId, message);
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
        List<LlmMessage> allMessages = conversations.get(conversationId);

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
        List<LlmMessage> allMessages = conversations.get(conversationId);

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
        List<LlmMessage> messages = conversations.get(conversationId);
        return messages != null ? new ArrayList<>(messages) : new ArrayList<>();
    }

    /**
     * Clear a conversation's history.
     */
    public void clearConversation(String conversationId) {
        conversations.remove(conversationId);
        LOG.debugf("Cleared conversation: %s", conversationId);
    }

    /**
     * Check if a conversation exists.
     */
    public boolean hasConversation(String conversationId) {
        return conversations.containsKey(conversationId) &&
               !conversations.get(conversationId).isEmpty();
    }

    /**
     * Get the total number of messages in a conversation.
     */
    public int getMessageCount(String conversationId) {
        List<LlmMessage> messages = conversations.get(conversationId);
        return messages != null ? messages.size() : 0;
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
}
