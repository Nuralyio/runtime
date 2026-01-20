package com.nuraly.workflows.llm.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a message in an LLM conversation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmMessage {

    public enum Role {
        SYSTEM,
        USER,
        ASSISTANT,
        TOOL
    }

    private Role role;
    private String content;

    // For tool responses
    private String toolCallId;
    private String name;

    // For assistant messages with tool calls
    private List<ToolCall> toolCalls;

    public static LlmMessage system(String content) {
        return LlmMessage.builder()
                .role(Role.SYSTEM)
                .content(content)
                .build();
    }

    public static LlmMessage user(String content) {
        return LlmMessage.builder()
                .role(Role.USER)
                .content(content)
                .build();
    }

    public static LlmMessage assistant(String content) {
        return LlmMessage.builder()
                .role(Role.ASSISTANT)
                .content(content)
                .build();
    }

    public static LlmMessage assistantWithTools(List<ToolCall> toolCalls) {
        return LlmMessage.builder()
                .role(Role.ASSISTANT)
                .toolCalls(toolCalls)
                .build();
    }

    public static LlmMessage toolResult(String toolCallId, String name, String content) {
        return LlmMessage.builder()
                .role(Role.TOOL)
                .toolCallId(toolCallId)
                .name(name)
                .content(content)
                .build();
    }
}
