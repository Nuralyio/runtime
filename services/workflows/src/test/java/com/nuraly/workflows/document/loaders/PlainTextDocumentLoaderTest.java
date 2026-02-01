package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PlainTextDocumentLoaderTest {

    private PlainTextDocumentLoader loader;

    @BeforeEach
    void setUp() {
        loader = new PlainTextDocumentLoader();
    }

    @Test
    void testSupportedExtensions() {
        String[] extensions = loader.getSupportedExtensions();

        assertTrue(extensions.length > 0);
        assertTrue(containsExtension(extensions, ".txt"));
        assertTrue(containsExtension(extensions, ".md"));
        assertTrue(containsExtension(extensions, ".markdown"));
    }

    @Test
    void testCanLoad() {
        assertTrue(loader.canLoad("document.txt"));
        assertTrue(loader.canLoad("README.md"));
        assertTrue(loader.canLoad("notes.markdown"));
        assertTrue(loader.canLoad("data.csv"));
        assertTrue(loader.canLoad("server.log"));

        assertFalse(loader.canLoad("document.pdf"));
        assertFalse(loader.canLoad("page.html"));
        assertFalse(loader.canLoad(null));
    }

    @Test
    void testLoadFromInputStream() throws Exception {
        String content = "Hello, World!\nThis is a test document.";
        ByteArrayInputStream inputStream = new ByteArrayInputStream(
                content.getBytes(StandardCharsets.UTF_8));

        DocumentLoader.LoadedDocument doc = loader.load(inputStream, "test.txt", null);

        assertNotNull(doc);
        assertEquals(content, doc.getContent());
        assertEquals("test.txt", doc.getSourceId());
        assertEquals("txt", doc.getSourceType());
        assertEquals(1, doc.getPageCount());
        assertEquals(content.length(), doc.getCharacterCount());
    }

    @Test
    void testLoadFromString() throws Exception {
        String content = "# Markdown Title\n\nThis is a markdown document.";

        DocumentLoader.LoadedDocument doc = loader.loadFromString(content, "README.md", null);

        assertNotNull(doc);
        assertEquals(content, doc.getContent());
        assertEquals("README.md", doc.getSourceId());
        assertEquals("markdown", doc.getSourceType());
    }

    @Test
    void testLoadWithMetadata() throws Exception {
        String content = "Test content";
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("author", "John Doe");
        metadata.put("version", "1.0");

        DocumentLoader.LoadedDocument doc = loader.loadFromString(content, "doc.txt", metadata);

        assertNotNull(doc);
        assertNotNull(doc.getMetadata());
        assertEquals("John Doe", doc.getMetadata().get("author"));
        assertEquals("1.0", doc.getMetadata().get("version"));
        assertEquals("doc.txt", doc.getMetadata().get("filename"));
    }

    @Test
    void testDetectsMarkdownType() throws Exception {
        DocumentLoader.LoadedDocument doc = loader.loadFromString("# Title", "file.md", null);
        assertEquals("markdown", doc.getSourceType());

        doc = loader.loadFromString("# Title", "file.markdown", null);
        assertEquals("markdown", doc.getSourceType());
    }

    @Test
    void testDetectsCsvType() throws Exception {
        DocumentLoader.LoadedDocument doc = loader.loadFromString("a,b,c", "data.csv", null);
        assertEquals("csv", doc.getSourceType());
    }

    @Test
    void testDetectsLogType() throws Exception {
        DocumentLoader.LoadedDocument doc = loader.loadFromString("INFO: test", "app.log", null);
        assertEquals("log", doc.getSourceType());
    }

    private boolean containsExtension(String[] extensions, String ext) {
        for (String e : extensions) {
            if (e.equals(ext)) return true;
        }
        return false;
    }
}
