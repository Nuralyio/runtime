package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Document loader for plain text files (TXT, Markdown, etc.).
 */
@ApplicationScoped
public class PlainTextDocumentLoader implements DocumentLoader {

    private static final String[] SUPPORTED_EXTENSIONS = {".txt", ".md", ".markdown", ".text", ".log", ".csv"};

    @Override
    public String[] getSupportedExtensions() {
        return SUPPORTED_EXTENSIONS;
    }

    @Override
    public LoadedDocument load(InputStream inputStream, String filename, Map<String, Object> metadata) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String content = reader.lines().collect(Collectors.joining("\n"));
            return createDocument(content, filename, metadata);
        }
    }

    @Override
    public LoadedDocument loadFromString(String content, String filename, Map<String, Object> metadata) throws Exception {
        return createDocument(content, filename, metadata);
    }

    private LoadedDocument createDocument(String content, String filename, Map<String, Object> metadata) {
        Map<String, Object> docMetadata = new HashMap<>();
        if (metadata != null) {
            docMetadata.putAll(metadata);
        }

        // Detect source type from extension
        String sourceType = "txt";
        if (filename != null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
                sourceType = "markdown";
            } else if (lower.endsWith(".csv")) {
                sourceType = "csv";
            } else if (lower.endsWith(".log")) {
                sourceType = "log";
            }
        }

        docMetadata.put("filename", filename);
        docMetadata.put("format", sourceType);

        LoadedDocument doc = new LoadedDocument();
        doc.setContent(content);
        doc.setSourceId(filename);
        doc.setSourceType(sourceType);
        doc.setMetadata(docMetadata);
        doc.setPageCount(1);

        return doc;
    }
}
