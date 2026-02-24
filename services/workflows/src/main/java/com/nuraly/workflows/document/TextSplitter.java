package com.nuraly.workflows.document;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Interface for splitting text into chunks for embedding.
 */
public interface TextSplitter {

    /**
     * Split text into chunks.
     *
     * @param text The text to split
     * @param chunkSize Target chunk size in characters
     * @param chunkOverlap Overlap between chunks in characters
     * @return List of text chunks
     */
    List<TextChunk> split(String text, int chunkSize, int chunkOverlap);

    /**
     * Split text with default settings.
     */
    default List<TextChunk> split(String text) {
        return split(text, 1000, 200);
    }

    /**
     * Represents a chunk of text with metadata.
     */
    class TextChunk {
        private String content;
        private int index;
        private int startOffset;
        private int endOffset;
        private Map<String, Object> metadata;

        public TextChunk() {}

        public TextChunk(String content, int index, int startOffset, int endOffset) {
            this.content = content;
            this.index = index;
            this.startOffset = startOffset;
            this.endOffset = endOffset;
        }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }

        public int getStartOffset() { return startOffset; }
        public void setStartOffset(int startOffset) { this.startOffset = startOffset; }

        public int getEndOffset() { return endOffset; }
        public void setEndOffset(int endOffset) { this.endOffset = endOffset; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public int getLength() {
            return content != null ? content.length() : 0;
        }
    }

    /**
     * Utility method to estimate token count (rough approximation: ~4 chars per token).
     */
    static int estimateTokenCount(String text) {
        if (text == null || text.isEmpty()) return 0;
        return (int) Math.ceil(text.length() / 4.0);
    }
}
