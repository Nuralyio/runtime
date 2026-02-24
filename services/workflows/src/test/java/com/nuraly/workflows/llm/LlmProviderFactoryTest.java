package com.nuraly.workflows.llm;

import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class LlmProviderFactoryTest {

    @Inject
    LlmProviderFactory factory;

    @Test
    void testGetOpenAiProvider() {
        LlmProvider provider = factory.getProvider("openai");
        assertNotNull(provider);
        assertEquals("openai", provider.getName());
    }

    @Test
    void testGetAnthropicProvider() {
        LlmProvider provider = factory.getProvider("anthropic");
        assertNotNull(provider);
        assertEquals("anthropic", provider.getName());
    }

    @Test
    void testGetGeminiProvider() {
        LlmProvider provider = factory.getProvider("gemini");
        assertNotNull(provider);
        assertEquals("gemini", provider.getName());
    }

    @Test
    void testGetProviderCaseInsensitive() {
        assertNotNull(factory.getProvider("OpenAI"));
        assertNotNull(factory.getProvider("ANTHROPIC"));
        assertNotNull(factory.getProvider("Gemini"));
    }

    @Test
    void testGetUnknownProvider() {
        LlmProvider provider = factory.getProvider("unknown");
        assertNull(provider);
    }

    @Test
    void testGetProviderWithNull() {
        LlmProvider provider = factory.getProvider(null);
        assertNull(provider);
    }

    @Test
    void testHasProvider() {
        assertTrue(factory.hasProvider("openai"));
        assertTrue(factory.hasProvider("anthropic"));
        assertTrue(factory.hasProvider("gemini"));
        assertFalse(factory.hasProvider("unknown"));
        assertFalse(factory.hasProvider(null));
    }

    @Test
    void testFindProviderForModel_OpenAi() {
        Optional<LlmProvider> provider = factory.findProviderForModel("gpt-4o");
        assertTrue(provider.isPresent());
        assertEquals("openai", provider.get().getName());
    }

    @Test
    void testFindProviderForModel_Anthropic() {
        Optional<LlmProvider> provider = factory.findProviderForModel("claude-3-opus-20240229");
        assertTrue(provider.isPresent());
        assertEquals("anthropic", provider.get().getName());
    }

    @Test
    void testFindProviderForModel_Gemini() {
        Optional<LlmProvider> provider = factory.findProviderForModel("gemini-1.5-pro");
        assertTrue(provider.isPresent());
        assertEquals("gemini", provider.get().getName());
    }

    @Test
    void testFindProviderForModel_Unknown() {
        Optional<LlmProvider> provider = factory.findProviderForModel("unknown-model");
        assertFalse(provider.isPresent());
    }

    @Test
    void testGetAvailableProviders() {
        String[] providers = factory.getAvailableProviders();
        assertNotNull(providers);
        assertTrue(providers.length >= 3);
    }
}
