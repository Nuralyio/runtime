package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class HtmlDocumentLoaderTest {

    private HtmlDocumentLoader loader;

    @BeforeEach
    void setUp() {
        loader = new HtmlDocumentLoader();
    }

    @Test
    void testSupportedExtensions() {
        String[] extensions = loader.getSupportedExtensions();

        assertTrue(extensions.length > 0);
        assertTrue(containsExtension(extensions, ".html"));
        assertTrue(containsExtension(extensions, ".htm"));
    }

    @Test
    void testCanLoad() {
        assertTrue(loader.canLoad("page.html"));
        assertTrue(loader.canLoad("index.htm"));
        assertTrue(loader.canLoad("app.xhtml"));

        assertFalse(loader.canLoad("document.pdf"));
        assertFalse(loader.canLoad("notes.txt"));
        assertFalse(loader.canLoad(null));
    }

    @Test
    void testLoadSimpleHtml() throws Exception {
        String html = """
            <html>
            <head><title>Test Page</title></head>
            <body>
                <h1>Hello World</h1>
                <p>This is a test paragraph.</p>
            </body>
            </html>
            """;

        DocumentLoader.LoadedDocument doc = loader.loadFromString(html, "test.html", null);

        assertNotNull(doc);
        assertNotNull(doc.getContent());
        assertTrue(doc.getContent().contains("Hello World"));
        assertTrue(doc.getContent().contains("test paragraph"));
        assertEquals("test.html", doc.getSourceId());
        assertEquals("html", doc.getSourceType());
        assertEquals("Test Page", doc.getMetadata().get("title"));
    }

    @Test
    void testRemovesScriptsAndStyles() throws Exception {
        String html = """
            <html>
            <head>
                <style>body { color: red; }</style>
                <script>alert('hello');</script>
            </head>
            <body>
                <p>Visible content</p>
                <script>document.write('hidden');</script>
            </body>
            </html>
            """;

        DocumentLoader.LoadedDocument doc = loader.loadFromString(html, "test.html", null);

        assertNotNull(doc);
        assertTrue(doc.getContent().contains("Visible content"));
        assertFalse(doc.getContent().contains("alert"));
        assertFalse(doc.getContent().contains("color: red"));
        assertFalse(doc.getContent().contains("document.write"));
    }

    @Test
    void testExtractsMetaTags() throws Exception {
        String html = """
            <html>
            <head>
                <title>Page Title</title>
                <meta name="description" content="A test page description">
                <meta name="author" content="John Doe">
                <meta property="og:title" content="Open Graph Title">
            </head>
            <body><p>Content</p></body>
            </html>
            """;

        DocumentLoader.LoadedDocument doc = loader.loadFromString(html, "test.html", null);

        assertNotNull(doc.getMetadata());
        assertEquals("Page Title", doc.getMetadata().get("title"));
        assertEquals("A test page description", doc.getMetadata().get("meta_description"));
        assertEquals("John Doe", doc.getMetadata().get("meta_author"));
        assertEquals("Open Graph Title", doc.getMetadata().get("meta_og:title"));
    }

    @Test
    void testLoadFromInputStream() throws Exception {
        String html = "<html><body><p>Hello from stream</p></body></html>";
        ByteArrayInputStream inputStream = new ByteArrayInputStream(
                html.getBytes(StandardCharsets.UTF_8));

        DocumentLoader.LoadedDocument doc = loader.load(inputStream, "stream.html", null);

        assertNotNull(doc);
        assertTrue(doc.getContent().contains("Hello from stream"));
    }

    @Test
    void testPreservesCustomMetadata() throws Exception {
        String html = "<html><body><p>Test</p></body></html>";
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("source", "web-crawler");
        metadata.put("url", "https://example.com");

        DocumentLoader.LoadedDocument doc = loader.loadFromString(html, "test.html", metadata);

        assertEquals("web-crawler", doc.getMetadata().get("source"));
        assertEquals("https://example.com", doc.getMetadata().get("url"));
    }

    @Test
    void testRemovesNavigationElements() throws Exception {
        String html = """
            <html>
            <body>
                <nav><a href="/">Home</a><a href="/about">About</a></nav>
                <header><h1>Site Header</h1></header>
                <main><p>Main content here</p></main>
                <footer>Copyright 2024</footer>
            </body>
            </html>
            """;

        DocumentLoader.LoadedDocument doc = loader.loadFromString(html, "test.html", null);

        // Main content should be present
        assertTrue(doc.getContent().contains("Main content"));
        // Navigation should be removed
        assertFalse(doc.getContent().contains("Home"));
    }

    private boolean containsExtension(String[] extensions, String ext) {
        for (String e : extensions) {
            if (e.equals(ext)) return true;
        }
        return false;
    }
}
