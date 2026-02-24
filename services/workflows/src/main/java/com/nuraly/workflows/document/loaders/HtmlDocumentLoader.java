package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import jakarta.enterprise.context.ApplicationScoped;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Document loader for HTML files using JSoup.
 * Extracts clean text content from HTML, removing scripts, styles, and tags.
 */
@ApplicationScoped
public class HtmlDocumentLoader implements DocumentLoader {

    private static final String[] SUPPORTED_EXTENSIONS = {".html", ".htm", ".xhtml"};

    @Override
    public String[] getSupportedExtensions() {
        return SUPPORTED_EXTENSIONS;
    }

    @Override
    public LoadedDocument load(InputStream inputStream, String filename, Map<String, Object> metadata) throws Exception {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String htmlContent = reader.lines().collect(Collectors.joining("\n"));
            return parseHtml(htmlContent, filename, metadata);
        }
    }

    @Override
    public LoadedDocument loadFromString(String content, String filename, Map<String, Object> metadata) throws Exception {
        return parseHtml(content, filename, metadata);
    }

    private LoadedDocument parseHtml(String htmlContent, String filename, Map<String, Object> metadata) {
        Document doc = Jsoup.parse(htmlContent);

        // Remove script and style elements
        doc.select("script, style, noscript, iframe, nav, footer, header").remove();

        Map<String, Object> docMetadata = new HashMap<>();
        if (metadata != null) {
            docMetadata.putAll(metadata);
        }

        // Extract metadata from HTML
        String title = doc.title();
        if (title != null && !title.isEmpty()) {
            docMetadata.put("title", title);
        }

        // Extract meta tags
        for (Element meta : doc.select("meta")) {
            String name = meta.attr("name");
            String property = meta.attr("property");
            String content = meta.attr("content");

            if (!content.isEmpty()) {
                if (!name.isEmpty()) {
                    docMetadata.put("meta_" + name, content);
                } else if (!property.isEmpty()) {
                    docMetadata.put("meta_" + property, content);
                }
            }
        }

        // Extract clean text
        String textContent = extractCleanText(doc);

        docMetadata.put("filename", filename);
        docMetadata.put("format", "html");

        LoadedDocument loadedDoc = new LoadedDocument();
        loadedDoc.setContent(textContent);
        loadedDoc.setSourceId(filename);
        loadedDoc.setSourceType("html");
        loadedDoc.setMetadata(docMetadata);
        loadedDoc.setPageCount(1);

        return loadedDoc;
    }

    /**
     * Extract clean text from HTML document, preserving paragraph structure.
     */
    private String extractCleanText(Document doc) {
        // Get body content, or full document if no body
        Element body = doc.body();
        if (body == null) {
            body = doc;
        }

        // Use JSoup's text extraction with some formatting preservation
        StringBuilder text = new StringBuilder();

        // Process block elements to preserve structure
        for (Element element : body.getAllElements()) {
            String tagName = element.tagName();

            // Add newlines for block elements
            if (isBlockElement(tagName)) {
                if (text.length() > 0 && !text.toString().endsWith("\n\n")) {
                    text.append("\n");
                }
            }

            // Only process leaf text nodes
            if (element.ownText() != null && !element.ownText().trim().isEmpty()) {
                String ownText = element.ownText().trim();
                text.append(ownText);

                if (isBlockElement(tagName)) {
                    text.append("\n");
                } else {
                    text.append(" ");
                }
            }
        }

        // Clean up excessive whitespace
        return text.toString()
                .replaceAll("[ \\t]+", " ")
                .replaceAll("\n{3,}", "\n\n")
                .trim();
    }

    private boolean isBlockElement(String tagName) {
        return switch (tagName.toLowerCase()) {
            case "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
                 "ul", "ol", "li", "blockquote", "pre", "article",
                 "section", "aside", "main", "br", "hr", "table",
                 "tr", "td", "th", "thead", "tbody" -> true;
            default -> false;
        };
    }
}
