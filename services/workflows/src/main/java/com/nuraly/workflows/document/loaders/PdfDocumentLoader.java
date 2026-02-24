package com.nuraly.workflows.document.loaders;

import com.nuraly.workflows.document.DocumentLoader;
import jakarta.enterprise.context.ApplicationScoped;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentInformation;
import org.apache.pdfbox.text.PDFTextStripper;
import org.jboss.logging.Logger;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Document loader for PDF files using Apache PDFBox.
 */
@ApplicationScoped
public class PdfDocumentLoader implements DocumentLoader {

    private static final Logger LOG = Logger.getLogger(PdfDocumentLoader.class);
    private static final String[] SUPPORTED_EXTENSIONS = {".pdf"};

    @Override
    public String[] getSupportedExtensions() {
        return SUPPORTED_EXTENSIONS;
    }

    @Override
    public LoadedDocument load(InputStream inputStream, String filename, Map<String, Object> metadata) throws Exception {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String content = stripper.getText(document);

            Map<String, Object> docMetadata = new HashMap<>();
            if (metadata != null) {
                docMetadata.putAll(metadata);
            }

            // Extract PDF metadata
            PDDocumentInformation info = document.getDocumentInformation();
            if (info != null) {
                if (info.getTitle() != null) docMetadata.put("title", info.getTitle());
                if (info.getAuthor() != null) docMetadata.put("author", info.getAuthor());
                if (info.getSubject() != null) docMetadata.put("subject", info.getSubject());
                if (info.getKeywords() != null) docMetadata.put("keywords", info.getKeywords());
                if (info.getCreator() != null) docMetadata.put("creator", info.getCreator());
                if (info.getProducer() != null) docMetadata.put("producer", info.getProducer());
                if (info.getCreationDate() != null) {
                    docMetadata.put("creationDate", info.getCreationDate().getTime().toString());
                }
                if (info.getModificationDate() != null) {
                    docMetadata.put("modificationDate", info.getModificationDate().getTime().toString());
                }
            }

            int pageCount = document.getNumberOfPages();
            docMetadata.put("pageCount", pageCount);
            docMetadata.put("filename", filename);
            docMetadata.put("format", "pdf");

            LoadedDocument doc = new LoadedDocument();
            doc.setContent(content);
            doc.setSourceId(filename);
            doc.setSourceType("pdf");
            doc.setMetadata(docMetadata);
            doc.setPageCount(pageCount);

            LOG.debugf("Loaded PDF '%s': %d pages, %d characters", filename, pageCount, content.length());

            return doc;
        }
    }
}
