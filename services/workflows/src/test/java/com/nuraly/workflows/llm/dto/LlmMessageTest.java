package com.nuraly.workflows.llm.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LlmMessageTest {

    @Test
    void testSystemMessage() {
        LlmMessage msg = LlmMessage.system("You are a helpful assistant.");

        assertEquals(LlmMessage.Role.SYSTEM, msg.getRole());
        assertEquals("You are a helpful assistant.", msg.getContent());
        assertNull(msg.getToolCallId());
        assertNull(msg.getToolCalls());
    }

    @Test
    void testUserMessage() {
        LlmMessage msg = LlmMessage.user("Hello, how are you?");

        assertEquals(LlmMessage.Role.USER, msg.getRole());
        assertEquals("Hello, how are you?", msg.getContent());
    }

    @Test
    void testAssistantMessage() {
        LlmMessage msg = LlmMessage.assistant("I'm doing well, thank you!");

        assertEquals(LlmMessage.Role.ASSISTANT, msg.getRole());
        assertEquals("I'm doing well, thank you!", msg.getContent());
    }

    @Test
    void testAssistantWithToolCalls() {
        ToolCall toolCall = ToolCall.builder()
                .id("call_123")
                .name("get_weather")
                .build();

        LlmMessage msg = LlmMessage.assistantWithTools(List.of(toolCall));

        assertEquals(LlmMessage.Role.ASSISTANT, msg.getRole());
        assertNull(msg.getContent());
        assertNotNull(msg.getToolCalls());
        assertEquals(1, msg.getToolCalls().size());
        assertEquals("call_123", msg.getToolCalls().get(0).getId());
    }

    @Test
    void testToolResultMessage() {
        LlmMessage msg = LlmMessage.toolResult("call_123", "get_weather", "{\"temp\": 72}");

        assertEquals(LlmMessage.Role.TOOL, msg.getRole());
        assertEquals("call_123", msg.getToolCallId());
        assertEquals("get_weather", msg.getName());
        assertEquals("{\"temp\": 72}", msg.getContent());
    }

    @Test
    void testBuilderPattern() {
        LlmMessage msg = LlmMessage.builder()
                .role(LlmMessage.Role.USER)
                .content("Test content")
                .build();

        assertEquals(LlmMessage.Role.USER, msg.getRole());
        assertEquals("Test content", msg.getContent());
    }
}
