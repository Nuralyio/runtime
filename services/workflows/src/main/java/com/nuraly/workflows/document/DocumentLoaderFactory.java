package com.nuraly.workflows.document;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.HashMap;
import java.util.Map;

/**
 * Factory for obtaining the appropriate document loader based on file type.
 */
@ApplicationScoped
public class DocumentLoaderFactory {

    private static final Logger LOG = Logger.getLogger(DocumentLoaderFactory.class);

    private final Map<String, DocumentLoader> loadersByExtension = new HashMap<>();

    @Inject
    public DocumentLoaderFactory(Instance<DocumentLoader> loaders) {
        for (DocumentLoader loader : loaders) {
            for (String ext : loader.getSupportedExtensions()) {
                loadersByExtension.put(ext.toLowerCase(), loader);
                LOG.debugf("Registered document loader for extension '%s': %s",
                          ext, loader.getClass().getSimpleName());
            }
        }
        LOG.infof("DocumentLoaderFactory initialized with %d loaders supporting %d extensions",
                  loaders.stream().count(), loadersByExtension.size());
    }

    /**
     * Get a loader for the given filename.
     *
     * @param filename The filename to find a loader for
     * @return The appropriate DocumentLoader, or null if none found
     */
    public DocumentLoader getLoader(String filename) {
        if (filename == null) return null;

        String lower = filename.toLowerCase();
        for (Map.Entry<String, DocumentLoader> entry : loadersByExtension.entrySet()) {
            if (lower.endsWith(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    /**
     * Get a loader for the given file extension.
     *
     * @param extension The file extension (e.g., ".pdf", "pdf")
     * @return The appropriate DocumentLoader, or null if none found
     */
    public DocumentLoader getLoaderByExtension(String extension) {
        if (extension == null) return null;

        String ext = extension.toLowerCase();
        if (!ext.startsWith(".")) {
            ext = "." + ext;
        }
        return loadersByExtension.get(ext);
    }

    /**
     * Check if a loader exists for the given filename.
     */
    public boolean canLoad(String filename) {
        return getLoader(filename) != null;
    }

    /**
     * Get all supported extensions.
     */
    public String[] getSupportedExtensions() {
        return loadersByExtension.keySet().toArray(new String[0]);
    }
}
