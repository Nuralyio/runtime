package com.nuraly.workflows.document;

import java.io.InputStream;
import java.util.Map;

/**
 * Interface for loading and extracting text from various document formats.
 */
public interface DocumentLoader {

    /**
     * Get the supported file extensions for this loader.
     */
    String[] getSupportedExtensions();

    /**
     * Check if this loader can handle the given file type.
     */
    default boolean canLoad(String filename) {
        if (filename == null) return false;
        String lower = filename.toLowerCase();
        for (String ext : getSupportedExtensions()) {
            if (lower.endsWith(ext)) return true;
        }
        return false;
    }

    /**
     * Load document from input stream.
     *
     * @param inputStream The document content
     * @param filename Original filename (for type detection)
     * @param metadata Additional metadata to include
     * @return Loaded document with extracted text and metadata
     */
    LoadedDocument load(InputStream inputStream, String filename, Map<String, Object> metadata) throws Exception;

    /**
     * Load document from string content (for plain text, HTML, Markdown).
     *
     * @param content The text content
     * @param filename Original filename
     * @param metadata Additional metadata to include
     * @return Loaded document with extracted text and metadata
     */
    default LoadedDocument loadFromString(String content, String filename, Map<String, Object> metadata) throws Exception {
        throw new UnsupportedOperationException("This loader does not support loading from string");
    }

    /**
     * Represents a loaded document with its extracted content and metadata.
     */
    class LoadedDocument {
        private String content;
        private String sourceId;
        private String sourceType;
        private Map<String, Object> metadata;
        private int pageCount;
        private int characterCount;

        public LoadedDocument() {}

        public LoadedDocument(String content, String sourceId, String sourceType, Map<String, Object> metadata) {
            this.content = content;
            this.sourceId = sourceId;
            this.sourceType = sourceType;
            this.metadata = metadata;
            this.characterCount = content != null ? content.length() : 0;
            this.pageCount = 1;
        }

        public String getContent() { return content; }
        public void setContent(String content) {
            this.content = content;
            this.characterCount = content != null ? content.length() : 0;
        }

        public String getSourceId() { return sourceId; }
        public void setSourceId(String sourceId) { this.sourceId = sourceId; }

        public String getSourceType() { return sourceType; }
        public void setSourceType(String sourceType) { this.sourceType = sourceType; }

        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

        public int getPageCount() { return pageCount; }
        public void setPageCount(int pageCount) { this.pageCount = pageCount; }

        public int getCharacterCount() { return characterCount; }
        public void setCharacterCount(int characterCount) { this.characterCount = characterCount; }
    }
}
