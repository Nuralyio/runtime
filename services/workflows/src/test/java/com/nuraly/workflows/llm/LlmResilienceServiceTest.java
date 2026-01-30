package com.nuraly.workflows.llm;

import com.nuraly.workflows.llm.LlmResilienceService.ResilienceConfig;
import com.nuraly.workflows.llm.dto.LlmMessage;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LlmResilienceService.
 */
@ExtendWith(MockitoExtension.class)
class LlmResilienceServiceTest {

    @Mock
    private LlmProviderFactory providerFactory;

    @Mock
    private LlmProvider primaryProvider;

    @Mock
    private LlmProvider fallbackProvider;

    private LlmResilienceService resilienceService;
    private MeterRegistry meterRegistry;

    @BeforeEach
    void setUp() throws Exception {
        resilienceService = new LlmResilienceService();
        meterRegistry = new SimpleMeterRegistry();

        // Inject mocks using reflection
        injectField(resilienceService, "providerFactory", providerFactory);
        injectField(resilienceService, "meterRegistry", meterRegistry);
    }

    private void injectField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void testSuccessfulCallOnFirstAttempt() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.builder()
                        .content("Hello!")
                        .finishReason(LlmResponse.FinishReason.STOP)
                        .build()
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.defaults();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Hello!", response.getContent());
        verify(primaryProvider, times(1)).chat(any(), anyString());
    }

    @Test
    void testRetryOnRateLimitError() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);

        AtomicInteger callCount = new AtomicInteger(0);
        when(primaryProvider.chat(any(), anyString())).thenAnswer(invocation -> {
            if (callCount.incrementAndGet() <= 2) {
                return LlmResponse.error("Rate limit exceeded (429)");
            }
            return LlmResponse.builder()
                    .content("Success after retry!")
                    .finishReason(LlmResponse.FinishReason.STOP)
                    .build();
        });

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(3)
                .initialBackoffMs(10) // Short backoff for testing
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Success after retry!", response.getContent());
        assertEquals(3, callCount.get()); // Initial + 2 retries
    }

    @Test
    void testNoRetryOnNonRetryableError() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Invalid API key")
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(3)
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertFalse(response.isSuccess());
        verify(primaryProvider, times(1)).chat(any(), anyString()); // No retries
    }

    @Test
    void testFailoverToFallbackProvider() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(providerFactory.getProvider("anthropic")).thenReturn(fallbackProvider);

        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Service unavailable (503)")
        );
        when(fallbackProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.builder()
                        .content("Response from fallback!")
                        .finishReason(LlmResponse.FinishReason.STOP)
                        .build()
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(1)
                .initialBackoffMs(10)
                .fallbackProviders(List.of("anthropic"))
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key",
                List.of("anthropic-key"), config);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Response from fallback!", response.getContent());
    }

    @Test
    void testAllProvidersFailReturnsFinalError() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(providerFactory.getProvider("anthropic")).thenReturn(fallbackProvider);

        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("OpenAI error")
        );
        when(fallbackProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Anthropic error")
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(0) // No retries
                .fallbackProviders(List.of("anthropic"))
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key",
                List.of("anthropic-key"), config);

        // Assert
        assertFalse(response.isSuccess());
        assertTrue(response.getError().contains("All LLM providers failed"));
    }

    @Test
    void testUnknownProviderReturnsError() {
        // Arrange
        when(providerFactory.getProvider("unknown")).thenReturn(null);

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.defaults();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "unknown", "test-key", config);

        // Assert
        assertFalse(response.isSuccess());
        assertTrue(response.getError().contains("Unknown provider"));
    }

    @Test
    void testRetryOnTimeoutError() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);

        AtomicInteger callCount = new AtomicInteger(0);
        when(primaryProvider.chat(any(), anyString())).thenAnswer(invocation -> {
            if (callCount.incrementAndGet() == 1) {
                return LlmResponse.error("Request timed out");
            }
            return LlmResponse.builder()
                    .content("Success!")
                    .finishReason(LlmResponse.FinishReason.STOP)
                    .build();
        });

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(2)
                .initialBackoffMs(10)
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(2, callCount.get());
    }

    @Test
    void testRetryOn500Error() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);

        AtomicInteger callCount = new AtomicInteger(0);
        when(primaryProvider.chat(any(), anyString())).thenAnswer(invocation -> {
            if (callCount.incrementAndGet() == 1) {
                return LlmResponse.error("Internal server error (500)");
            }
            return LlmResponse.builder()
                    .content("Success!")
                    .finishReason(LlmResponse.FinishReason.STOP)
                    .build();
        });

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(2)
                .initialBackoffMs(10)
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertTrue(response.isSuccess());
    }

    @Test
    void testMaxRetriesExhausted() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Rate limit exceeded")
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(2)
                .initialBackoffMs(10)
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert
        assertFalse(response.isSuccess());
        verify(primaryProvider, times(3)).chat(any(), anyString()); // 1 initial + 2 retries
    }

    @Test
    void testSkipFallbackWithoutApiKey() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        // Note: we don't stub anthropic provider because the fallback should be skipped
        // when no API key is provided for it

        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Service unavailable")
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(0)
                .fallbackProviders(List.of("anthropic")) // No API key provided
                .build();

        // Act - no fallback API keys provided
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert - should fail since anthropic needs API key
        assertFalse(response.isSuccess());
        verify(fallbackProvider, never()).chat(any(), anyString());
    }

    @Test
    void testOllamaFallbackWithoutApiKey() {
        // Arrange
        when(providerFactory.getProvider("openai")).thenReturn(primaryProvider);
        when(providerFactory.getProvider("ollama")).thenReturn(fallbackProvider);

        when(primaryProvider.chat(any(), anyString())).thenReturn(
                LlmResponse.error("Service unavailable")
        );
        when(fallbackProvider.chat(any(), isNull())).thenReturn(
                LlmResponse.builder()
                        .content("Response from Ollama!")
                        .finishReason(LlmResponse.FinishReason.STOP)
                        .build()
        );

        LlmRequest request = createTestRequest();
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(0)
                .fallbackProviders(List.of("ollama")) // Ollama doesn't need API key
                .build();

        // Act
        LlmResponse response = resilienceService.executeWithResilience(
                request, "openai", "test-key", config);

        // Assert - Ollama should be tried without API key
        assertTrue(response.isSuccess());
        assertEquals("Response from Ollama!", response.getContent());
    }

    @Test
    void testResilienceConfigBuilder() {
        // Test the builder creates correct config
        ResilienceConfig config = ResilienceConfig.builder()
                .maxRetries(5)
                .initialBackoffMs(2000)
                .maxBackoffMs(60000)
                .timeoutMs(120000)
                .fallbackProviders(List.of("anthropic", "ollama"))
                .retryableErrors(List.of("custom_error"))
                .build();

        assertEquals(5, config.getMaxRetries());
        assertEquals(2000, config.getInitialBackoffMs());
        assertEquals(60000, config.getMaxBackoffMs());
        assertEquals(120000, config.getTimeoutMs());
        assertEquals(2, config.getFallbackProviders().size());
        assertTrue(config.getRetryableErrors().contains("custom_error"));
    }

    @Test
    void testResilienceConfigDefaults() {
        ResilienceConfig config = ResilienceConfig.defaults();

        assertEquals(3, config.getMaxRetries());
        assertEquals(1000, config.getInitialBackoffMs());
        assertEquals(30000, config.getMaxBackoffMs());
        assertEquals(60000, config.getTimeoutMs());
    }

    // Helper methods

    private LlmRequest createTestRequest() {
        return LlmRequest.builder()
                .model("gpt-4")
                .messages(List.of(
                        LlmMessage.user("Hello")
                ))
                .build();
    }
}
