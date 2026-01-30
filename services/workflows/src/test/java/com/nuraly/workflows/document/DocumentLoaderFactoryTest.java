package com.nuraly.workflows.document;

import com.nuraly.workflows.document.loaders.HtmlDocumentLoader;
import com.nuraly.workflows.document.loaders.PlainTextDocumentLoader;
import jakarta.enterprise.inject.Instance;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DocumentLoaderFactoryTest {

    private DocumentLoaderFactory factory;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        // Create mock Instance with our loaders
        Instance<DocumentLoader> mockInstance = Mockito.mock(Instance.class);

        List<DocumentLoader> loaders = List.of(
                new PlainTextDocumentLoader(),
                new HtmlDocumentLoader()
        );

        when(mockInstance.iterator()).thenReturn(loaders.iterator());
        when(mockInstance.stream()).thenReturn(Stream.of(loaders.toArray(new DocumentLoader[0])));

        factory = new DocumentLoaderFactory(mockInstance);
    }

    @Test
    void testGetLoaderForTxt() {
        DocumentLoader loader = factory.getLoader("document.txt");

        assertNotNull(loader);
        assertTrue(loader instanceof PlainTextDocumentLoader);
    }

    @Test
    void testGetLoaderForMarkdown() {
        DocumentLoader loader = factory.getLoader("README.md");

        assertNotNull(loader);
        assertTrue(loader instanceof PlainTextDocumentLoader);
    }

    @Test
    void testGetLoaderForHtml() {
        DocumentLoader loader = factory.getLoader("page.html");

        assertNotNull(loader);
        assertTrue(loader instanceof HtmlDocumentLoader);
    }

    @Test
    void testGetLoaderForHtm() {
        DocumentLoader loader = factory.getLoader("index.htm");

        assertNotNull(loader);
        assertTrue(loader instanceof HtmlDocumentLoader);
    }

    @Test
    void testGetLoaderForUnknownType() {
        DocumentLoader loader = factory.getLoader("document.xyz");

        assertNull(loader);
    }

    @Test
    void testGetLoaderForNull() {
        DocumentLoader loader = factory.getLoader(null);

        assertNull(loader);
    }

    @Test
    void testGetLoaderByExtension() {
        DocumentLoader loader = factory.getLoaderByExtension(".txt");
        assertNotNull(loader);
        assertTrue(loader instanceof PlainTextDocumentLoader);

        loader = factory.getLoaderByExtension("txt");
        assertNotNull(loader);
        assertTrue(loader instanceof PlainTextDocumentLoader);
    }

    @Test
    void testGetLoaderByExtensionNull() {
        DocumentLoader loader = factory.getLoaderByExtension(null);
        assertNull(loader);
    }

    @Test
    void testCanLoad() {
        assertTrue(factory.canLoad("file.txt"));
        assertTrue(factory.canLoad("file.md"));
        assertTrue(factory.canLoad("file.html"));
        assertTrue(factory.canLoad("file.htm"));

        assertFalse(factory.canLoad("file.pdf")); // PDF loader not registered in test
        assertFalse(factory.canLoad("file.xyz"));
    }

    @Test
    void testGetSupportedExtensions() {
        String[] extensions = factory.getSupportedExtensions();

        assertNotNull(extensions);
        assertTrue(extensions.length > 0);
    }

    @Test
    void testCaseInsensitiveMatching() {
        assertNotNull(factory.getLoader("FILE.TXT"));
        assertNotNull(factory.getLoader("Document.HTML"));
        assertNotNull(factory.getLoader("README.MD"));
    }
}
