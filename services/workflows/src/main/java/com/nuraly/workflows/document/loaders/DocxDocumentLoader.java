package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.ooxml.POIXMLProperties;
import org.jboss.logging.Logger;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Document loader for Microsoft Word (.docx) files using Apache POI.
 */
@ApplicationScoped
public class DocxDocumentLoader implements DocumentLoader {

    private static final Logger LOG = Logger.getLogger(DocxDocumentLoader.class);
    private static final String[] SUPPORTED_EXTENSIONS = {".docx", ".doc"};

    @Override
    public String[] getSupportedExtensions() {
        return SUPPORTED_EXTENSIONS;
    }

    @Override
    public LoadedDocument load(InputStream inputStream, String filename, Map<String, Object> metadata) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            // Extract text content
            XWPFWordExtractor extractor = new XWPFWordExtractor(document);
            String content = extractor.getText();
            extractor.close();

            Map<String, Object> docMetadata = new HashMap<>();
            if (metadata != null) {
                docMetadata.putAll(metadata);
            }

            // Extract document metadata
            try {
                POIXMLProperties properties = document.getProperties();
                POIXMLProperties.CoreProperties coreProps = properties.getCoreProperties();

                if (coreProps.getTitle() != null && !coreProps.getTitle().isEmpty()) {
                    docMetadata.put("title", coreProps.getTitle());
                }
                if (coreProps.getCreator() != null && !coreProps.getCreator().isEmpty()) {
                    docMetadata.put("author", coreProps.getCreator());
                }
                if (coreProps.getSubject() != null && !coreProps.getSubject().isEmpty()) {
                    docMetadata.put("subject", coreProps.getSubject());
                }
                if (coreProps.getKeywords() != null && !coreProps.getKeywords().isEmpty()) {
                    docMetadata.put("keywords", coreProps.getKeywords());
                }
                if (coreProps.getDescription() != null && !coreProps.getDescription().isEmpty()) {
                    docMetadata.put("description", coreProps.getDescription());
                }
                if (coreProps.getCreated() != null) {
                    docMetadata.put("creationDate", coreProps.getCreated().toString());
                }
                if (coreProps.getModified() != null) {
                    docMetadata.put("modificationDate", coreProps.getModified().toString());
                }
            } catch (Exception e) {
                LOG.debugf("Could not extract document properties: %s", e.getMessage());
            }

            // Count paragraphs as a rough "page" equivalent
            int paragraphCount = document.getParagraphs().size();
            docMetadata.put("paragraphCount", paragraphCount);
            docMetadata.put("filename", filename);
            docMetadata.put("format", "docx");

            LoadedDocument doc = new LoadedDocument();
            doc.setContent(content);
            doc.setSourceId(filename);
            doc.setSourceType("docx");
            doc.setMetadata(docMetadata);
            doc.setPageCount(Math.max(1, paragraphCount / 20)); // Rough estimate: ~20 paragraphs per page

            LOG.debugf("Loaded Word document '%s': %d paragraphs, %d characters",
                    filename, paragraphCount, content.length());

            return doc;
        }
    }
}
