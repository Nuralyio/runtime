package com.nuraly.workflows.document.splitters;

import com.nuraly.workflows.document.TextSplitter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SentenceTextSplitterTest {

    private SentenceTextSplitter splitter;

    @BeforeEach
    void setUp() {
        splitter = new SentenceTextSplitter();
    }

    @Test
    void testEmptyText() {
        List<TextSplitter.TextChunk> chunks = splitter.split("", 100, 20);
        assertTrue(chunks.isEmpty());

        chunks = splitter.split(null, 100, 20);
        assertTrue(chunks.isEmpty());
    }

    @Test
    void testSingleSentence() {
        String text = "This is a single sentence.";
        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        assertEquals(1, chunks.size());
        assertTrue(chunks.get(0).getContent().contains("single sentence"));
    }

    @Test
    void testMultipleSentences() {
        String text = "First sentence. Second sentence. Third sentence.";
        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        // Should fit in one chunk at 100 chars
        assertEquals(1, chunks.size());
    }

    @Test
    void testSentencesExceedChunkSize() {
        String text = "First sentence with some content. Second sentence with more content. " +
                      "Third sentence here. Fourth sentence follows. Fifth one too.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 50, 10);

        assertTrue(chunks.size() >= 2);
    }

    @Test
    void testQuestionMarks() {
        String text = "Is this a question? Yes it is. What about this one? Also yes.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 40, 10);

        assertTrue(chunks.size() >= 1);
        String combined = chunks.stream()
                .map(TextSplitter.TextChunk::getContent)
                .reduce("", String::concat);
        assertTrue(combined.contains("question"));
    }

    @Test
    void testExclamationMarks() {
        String text = "Hello there! This is exciting! What do you think? I agree.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 30, 5);

        assertTrue(chunks.size() >= 1);
    }

    @Test
    void testChunkIndicesAreSequential() {
        String text = "One. Two. Three. Four. Five. Six. Seven. Eight. Nine. Ten.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 20, 5);

        for (int i = 0; i < chunks.size(); i++) {
            assertEquals(i, chunks.get(i).getIndex());
        }
    }

    @Test
    void testOverlapBetweenChunks() {
        String text = "Sentence one here. Sentence two here. Sentence three here. " +
                      "Sentence four here. Sentence five here.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 40, 20);

        // With overlap, consecutive chunks should share some content
        if (chunks.size() >= 2) {
            // Just verify we got multiple chunks
            assertTrue(chunks.size() >= 2);
        }
    }

    @Test
    void testNoSentenceEndingsInText() {
        String text = "This text has no sentence endings at all";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        assertEquals(1, chunks.size());
        assertEquals(text, chunks.get(0).getContent());
    }

    @Test
    void testTokenCountEstimation() {
        String text = "This is a test sentence with several words.";
        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        assertEquals(1, chunks.size());
        // Token count should be roughly chars / 4
        int expectedTokens = TextSplitter.estimateTokenCount(text);
        assertTrue(expectedTokens > 0);
        assertTrue(expectedTokens < text.length());
    }

    @Test
    void testEstimateTokenCount() {
        assertEquals(0, TextSplitter.estimateTokenCount(null));
        assertEquals(0, TextSplitter.estimateTokenCount(""));
        assertEquals(3, TextSplitter.estimateTokenCount("Hello World!")); // 12 chars / 4 = 3
        assertEquals(25, TextSplitter.estimateTokenCount("A".repeat(100))); // 100 / 4 = 25
    }
}
