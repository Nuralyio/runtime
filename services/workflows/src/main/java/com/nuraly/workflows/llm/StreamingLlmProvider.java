package com.nuraly.workflows.llm;

import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;

import java.util.function.Consumer;

/**
 * Interface for LLM providers that support streaming responses.
 * Extends LlmProvider to add streaming capabilities.
 */
public interface StreamingLlmProvider extends LlmProvider {

    /**
     * Check if this provider supports streaming for the given model.
     */
    default boolean supportsStreaming(String model) {
        return true;
    }

    /**
     * Send a streaming request to the LLM.
     * Tokens are delivered via the callback as they arrive.
     *
     * @param request The LLM request
     * @param apiKey The API key to use
     * @param tokenCallback Callback invoked for each token received
     * @return Final response with complete content and usage stats
     */
    LlmResponse streamChat(LlmRequest request, String apiKey, Consumer<StreamToken> tokenCallback);

    /**
     * Represents a single streamed token or event.
     */
    class StreamToken {
        private final TokenType type;
        private final String content;
        private final String finishReason;

        public enum TokenType {
            CONTENT,        // Regular content token
            TOOL_CALL,      // Tool call in progress
            DONE,           // Stream completed
            ERROR           // Error occurred
        }

        public StreamToken(TokenType type, String content) {
            this(type, content, null);
        }

        public StreamToken(TokenType type, String content, String finishReason) {
            this.type = type;
            this.content = content;
            this.finishReason = finishReason;
        }

        public static StreamToken content(String content) {
            return new StreamToken(TokenType.CONTENT, content);
        }

        public static StreamToken toolCall(String content) {
            return new StreamToken(TokenType.TOOL_CALL, content);
        }

        public static StreamToken done(String finishReason) {
            return new StreamToken(TokenType.DONE, null, finishReason);
        }

        public static StreamToken error(String message) {
            return new StreamToken(TokenType.ERROR, message);
        }

        public TokenType getType() { return type; }
        public String getContent() { return content; }
        public String getFinishReason() { return finishReason; }

        public boolean isContent() { return type == TokenType.CONTENT; }
        public boolean isDone() { return type == TokenType.DONE; }
        public boolean isError() { return type == TokenType.ERROR; }
    }
}
