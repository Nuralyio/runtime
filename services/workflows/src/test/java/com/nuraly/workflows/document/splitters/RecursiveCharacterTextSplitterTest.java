package com.nuraly.workflows.document.splitters;

import com.nuraly.workflows.document.TextSplitter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RecursiveCharacterTextSplitterTest {

    private RecursiveCharacterTextSplitter splitter;

    @BeforeEach
    void setUp() {
        splitter = new RecursiveCharacterTextSplitter();
    }

    @Test
    void testEmptyText() {
        List<TextSplitter.TextChunk> chunks = splitter.split("", 100, 20);
        assertTrue(chunks.isEmpty());

        chunks = splitter.split(null, 100, 20);
        assertTrue(chunks.isEmpty());
    }

    @Test
    void testShortTextNoSplit() {
        String text = "This is a short text.";
        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        assertEquals(1, chunks.size());
        assertEquals(text, chunks.get(0).getContent());
        assertEquals(0, chunks.get(0).getIndex());
    }

    @Test
    void testSplitOnParagraphs() {
        String text = """
            First paragraph with some content.

            Second paragraph with more content.

            Third paragraph with even more content.
            """.trim();

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 50, 10);

        assertTrue(chunks.size() >= 2);
        // Should have split on paragraph boundaries
        for (TextSplitter.TextChunk chunk : chunks) {
            assertNotNull(chunk.getContent());
            assertFalse(chunk.getContent().isEmpty());
        }
    }

    @Test
    void testSplitOnSentences() {
        String text = "First sentence. Second sentence. Third sentence. Fourth sentence.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 40, 10);

        assertTrue(chunks.size() >= 2);
        for (TextSplitter.TextChunk chunk : chunks) {
            assertTrue(chunk.getContent().length() <= 50); // Some tolerance
        }
    }

    @Test
    void testChunkIndices() {
        String text = "A".repeat(300);
        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        for (int i = 0; i < chunks.size(); i++) {
            assertEquals(i, chunks.get(i).getIndex());
        }
    }

    @Test
    void testChunkOffsets() {
        String text = "First chunk here.\n\nSecond chunk here.\n\nThird chunk here.";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 20, 5);

        for (TextSplitter.TextChunk chunk : chunks) {
            assertTrue(chunk.getStartOffset() >= 0);
            assertTrue(chunk.getEndOffset() > chunk.getStartOffset());
            assertEquals(chunk.getContent().length(), chunk.getLength());
        }
    }

    @Test
    void testDefaultSplit() {
        String text = "A".repeat(2000);
        List<TextSplitter.TextChunk> chunks = splitter.split(text);

        // Default is 1000 chars with 200 overlap
        assertTrue(chunks.size() >= 2);
    }

    @Test
    void testVeryLongWord() {
        String longWord = "A".repeat(200);
        String text = "Hello " + longWord + " world";

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 50, 10);

        // Should handle long words gracefully
        assertFalse(chunks.isEmpty());
    }

    @Test
    void testMixedContent() {
        String text = """
            # Title

            This is a paragraph with multiple sentences. It has some content. And more here.

            ## Section 2

            Another paragraph follows. With its own sentences. And details.

            - List item 1
            - List item 2
            - List item 3
            """.trim();

        List<TextSplitter.TextChunk> chunks = splitter.split(text, 100, 20);

        assertTrue(chunks.size() >= 2);
        // All original content should be represented
        String combined = String.join("", chunks.stream().map(TextSplitter.TextChunk::getContent).toList());
        assertTrue(combined.contains("Title"));
        assertTrue(combined.contains("Section 2"));
    }
}
