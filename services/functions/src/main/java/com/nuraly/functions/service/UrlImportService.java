package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.exception.ImportResolutionException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Resolves URL imports by fetching modules from CDNs at deploy time.
 *
 * Supports imports like:
 *   import _ from 'https://esm.sh/lodash@4.17.21';
 *   import { sortBy } from 'https://esm.sh/lodash@4.17.21';
 *   import * as R from 'https://esm.sh/ramda@0.29.1';
 *
 * Features:
 * - In-memory caching with configurable TTL
 * - Domain allowlist for security
 * - Size limits to prevent abuse
 * - ESM to CommonJS transformation
 * - Line number tracking for error translation
 */
@ApplicationScoped
public class UrlImportService {

    private static final Logger LOG = Logger.getLogger(UrlImportService.class);

    // Regex patterns for different import syntaxes
    private static final Pattern IMPORT_PATTERN = Pattern.compile(
        "import\\s+" +
        "(?:" +
            "([\\w$]+)" +                           // Group 1: default import (import X)
            "|" +
            "\\*\\s+as\\s+([\\w$]+)" +              // Group 2: namespace import (import * as X)
            "|" +
            "\\{([^}]+)\\}" +                       // Group 3: named imports (import { a, b })
            "|" +
            "([\\w$]+)\\s*,\\s*\\{([^}]+)\\}" +    // Group 4,5: default + named (import X, { a, b })
        ")" +
        "\\s+from\\s+['\"]" +
        "(https?://[^'\"]+)" +                      // Group 6: URL
        "['\"];?",
        Pattern.MULTILINE
    );

    // Pattern for side-effect imports: import 'https://...';
    private static final Pattern SIDE_EFFECT_IMPORT = Pattern.compile(
        "import\\s+['\"]" +
        "(https?://[^'\"]+)" +
        "['\"];?",
        Pattern.MULTILINE
    );

    // Default allowed domains
    private static final List<String> DEFAULT_ALLOWED_DOMAINS = List.of(
        "esm.sh",
        "cdn.skypack.dev",
        "unpkg.com",
        "esm.run",
        "cdn.jsdelivr.net"
    );

    @Inject
    Configuration configuration;

    // Module cache: URL -> CachedModule
    private final ConcurrentHashMap<String, CachedModule> moduleCache = new ConcurrentHashMap<>();

    private final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    /**
     * Check if handler contains URL imports that need resolution.
     */
    public boolean hasUrlImports(String handler) {
        if (handler == null || handler.isEmpty()) {
            return false;
        }
        return IMPORT_PATTERN.matcher(handler).find() ||
               SIDE_EFFECT_IMPORT.matcher(handler).find();
    }

    /**
     * Resolve all URL imports in the handler code.
     * Fetches modules from CDNs and inlines them into the code.
     *
     * @param handler The original handler code with URL imports
     * @return ResolvedHandler with inlined code and metadata
     * @throws ImportResolutionException if resolution fails
     */
    public ResolvedHandler resolveImports(String handler) throws ImportResolutionException {
        List<UrlImport> imports = parseImports(handler);

        if (imports.isEmpty()) {
            return new ResolvedHandler(handler, List.of(), handler, 0);
        }

        // Check max imports limit
        int maxImports = configuration.UrlImportMaxImports;
        if (imports.size() > maxImports) {
            throw new ImportResolutionException(
                "Too many imports: " + imports.size() + " (max: " + maxImports + ")"
            );
        }

        LOG.infof("Resolving %d URL imports", imports.size());

        // Fetch all unique modules
        Map<String, FetchedModule> fetchedModules = new LinkedHashMap<>();
        for (UrlImport imp : imports) {
            if (!fetchedModules.containsKey(imp.url())) {
                FetchedModule module = fetchModule(imp.url());
                fetchedModules.put(imp.url(), module);
            }
        }

        // Build the resolved code with preamble
        ResolvedCode resolved = buildResolvedCode(handler, imports, fetchedModules);

        LOG.infof("Resolved %d imports, preamble: %d lines",
            fetchedModules.size(), resolved.preambleLineCount());

        return new ResolvedHandler(
            resolved.code(),
            new ArrayList<>(fetchedModules.keySet()),
            handler,
            resolved.preambleLineCount()
        );
    }

    /**
     * Parse all URL imports from the handler code.
     */
    List<UrlImport> parseImports(String handler) {
        List<UrlImport> imports = new ArrayList<>();
        Set<String> matchedUrls = new HashSet<>();

        // Parse regular imports
        Matcher matcher = IMPORT_PATTERN.matcher(handler);
        while (matcher.find()) {
            String defaultImport = matcher.group(1);
            String namespaceImport = matcher.group(2);
            String namedImports = matcher.group(3);
            String defaultWithNamed = matcher.group(4);
            String namedWithDefault = matcher.group(5);
            String url = matcher.group(6);

            ImportType type;
            String identifier;
            List<String> named = List.of();

            if (defaultImport != null) {
                type = ImportType.DEFAULT;
                identifier = defaultImport;
            } else if (namespaceImport != null) {
                type = ImportType.NAMESPACE;
                identifier = namespaceImport;
            } else if (namedImports != null) {
                type = ImportType.NAMED;
                identifier = null;
                named = parseNamedImports(namedImports);
            } else if (defaultWithNamed != null) {
                type = ImportType.DEFAULT_AND_NAMED;
                identifier = defaultWithNamed;
                named = parseNamedImports(namedWithDefault);
            } else {
                continue;
            }

            imports.add(new UrlImport(
                matcher.group(0),  // full match for replacement
                url,
                type,
                identifier,
                named
            ));
            matchedUrls.add(url);
        }

        // Parse side-effect imports
        Matcher sideEffectMatcher = SIDE_EFFECT_IMPORT.matcher(handler);
        while (sideEffectMatcher.find()) {
            String url = sideEffectMatcher.group(1);

            // Skip if already matched as regular import
            if (matchedUrls.contains(url)) {
                continue;
            }

            imports.add(new UrlImport(
                sideEffectMatcher.group(0),
                url,
                ImportType.SIDE_EFFECT,
                null,
                List.of()
            ));
        }

        return imports;
    }

    private List<String> parseNamedImports(String namedImports) {
        return Arrays.stream(namedImports.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> {
                // Handle "original as alias" syntax - keep the alias
                if (s.contains(" as ")) {
                    String[] parts = s.split("\\s+as\\s+");
                    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
                }
                return s;
            })
            .toList();
    }

    /**
     * Fetch a module from a URL with caching.
     */
    FetchedModule fetchModule(String url) throws ImportResolutionException {
        // Check cache first
        CachedModule cached = moduleCache.get(url);
        long cacheTtlMs = configuration.UrlImportCacheTtlSeconds * 1000L;

        if (cached != null && !cached.isExpired(cacheTtlMs)) {
            LOG.debugf("Cache hit for %s", url);
            return new FetchedModule(url, cached.code(), true);
        }

        LOG.infof("Fetching module: %s", url);

        // Validate URL before fetching
        validateUrl(url);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/javascript, text/javascript, */*")
                .header("User-Agent", "NuralyFunctions/1.0")
                .timeout(Duration.ofSeconds(configuration.UrlImportTimeoutSeconds))
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                String suggestion = response.statusCode() == 404
                    ? "Check if the package name and version are correct at npmjs.com"
                    : "CDN returned HTTP " + response.statusCode();

                throw new ImportResolutionException(
                    "Failed to fetch module from " + url + ": HTTP " + response.statusCode(),
                    url,
                    suggestion
                );
            }

            String code = response.body();

            // Validate fetched code
            validateFetchedCode(url, code);

            // Cache the result
            moduleCache.put(url, new CachedModule(code, System.currentTimeMillis()));

            LOG.infof("Fetched module: %s (%d bytes)", url, code.length());

            return new FetchedModule(url, code, false);

        } catch (ImportResolutionException e) {
            throw e;
        } catch (java.net.http.HttpTimeoutException e) {
            throw new ImportResolutionException(
                "Timeout fetching " + url + ". The CDN may be slow or unreachable.",
                url,
                "Try again later or use a different CDN"
            );
        } catch (Exception e) {
            throw new ImportResolutionException(
                "Failed to fetch module from " + url + ": " + e.getMessage(),
                url
            );
        }
    }

    /**
     * Validate URL against security rules.
     */
    void validateUrl(String url) throws ImportResolutionException {
        URI uri;
        try {
            uri = URI.create(url);
        } catch (Exception e) {
            throw new ImportResolutionException("Invalid URL: " + url, url);
        }

        // Must be HTTPS (except for localhost in dev)
        String scheme = uri.getScheme();
        String host = uri.getHost();

        if (!"https".equals(scheme)) {
            boolean isLocalDev = "http".equals(scheme) &&
                (host.equals("localhost") || host.equals("127.0.0.1"));

            if (!isLocalDev) {
                throw new ImportResolutionException(
                    "URL must use HTTPS: " + url,
                    url,
                    "Change http:// to https://"
                );
            }
        }

        // Check allowed domains
        List<String> allowedDomains = configuration.UrlImportAllowedDomains
            .filter(list -> !list.isEmpty())
            .orElse(DEFAULT_ALLOWED_DOMAINS);

        boolean allowed = allowedDomains.stream().anyMatch(domain ->
            host.equals(domain) || host.endsWith("." + domain)
        );

        if (!allowed) {
            throw new ImportResolutionException(
                "Domain not allowed: " + host,
                url,
                "Allowed domains: " + String.join(", ", allowedDomains)
            );
        }

        // Check blocked patterns
        List<String> blockedPatterns = configuration.UrlImportBlockedPatterns
            .orElse(List.of());

        for (String pattern : blockedPatterns) {
            if (url.contains(pattern)) {
                throw new ImportResolutionException(
                    "Blocked import pattern: " + pattern,
                    url
                );
            }
        }
    }

    /**
     * Validate fetched code for security and size.
     */
    void validateFetchedCode(String url, String code) throws ImportResolutionException {
        // Check size limit
        int maxSize = configuration.UrlImportMaxSizeBytes;
        if (code.length() > maxSize) {
            throw new ImportResolutionException(
                "Module too large: " + (code.length() / 1024) + "KB (max: " + (maxSize / 1024) + "KB)",
                url
            );
        }

        // Warn about suspicious patterns (don't block - V8 sandbox handles security)
        List<String> suspiciousPatterns = List.of(
            "require('child_process')",
            "require(\"child_process\")",
            "process.exit(",
            "eval("
        );

        for (String pattern : suspiciousPatterns) {
            if (code.contains(pattern)) {
                LOG.warnf("Suspicious pattern in module %s: %s", url, pattern);
            }
        }
    }

    /**
     * Build the final resolved code with inlined modules.
     */
    ResolvedCode buildResolvedCode(String handler, List<UrlImport> imports,
                                    Map<String, FetchedModule> modules) {
        StringBuilder preamble = new StringBuilder();
        preamble.append("// === URL Imports (resolved at deploy time) ===\n\n");

        // Add each fetched module wrapped in IIFE
        int moduleIndex = 0;
        Map<String, String> urlToModuleVar = new HashMap<>();

        for (Map.Entry<String, FetchedModule> entry : modules.entrySet()) {
            String url = entry.getKey();
            String code = entry.getValue().code();
            String moduleVar = "__mod" + moduleIndex++;

            urlToModuleVar.put(url, moduleVar);

            // Wrap module in IIFE for scope isolation
            preamble.append("// Module: ").append(url).append("\n");
            preamble.append("const ").append(moduleVar).append(" = (() => {\n");
            preamble.append("  const exports = {};\n");
            preamble.append("  const module = { exports };\n");
            preamble.append("  let __default;\n");

            // Transform ESM to work in our wrapper
            String transformedCode = transformEsmToCommonJs(code);
            preamble.append(indent(transformedCode, "  "));
            preamble.append("\n");

            preamble.append("  return { default: __default, ...exports, ...module.exports };\n");
            preamble.append("})();\n\n");
        }

        preamble.append("// === End URL Imports ===\n\n");

        // Count preamble lines for error translation
        int preambleLineCount = preamble.toString().split("\n", -1).length;

        // Rewrite original imports to use our module variables
        String rewrittenHandler = handler;
        for (UrlImport imp : imports) {
            String moduleVar = urlToModuleVar.get(imp.url());
            String replacement = generateImportReplacement(imp, moduleVar);
            rewrittenHandler = rewrittenHandler.replace(imp.fullMatch(), replacement);
        }

        return new ResolvedCode(preamble + rewrittenHandler, preambleLineCount);
    }

    /**
     * Transform ESM syntax to work in our module wrapper.
     */
    String transformEsmToCommonJs(String code) {
        String result = code;

        // export default X  ->  __default = X
        result = result.replaceAll(
            "export\\s+default\\s+",
            "__default = "
        );

        // export { X, Y }  ->  Object.assign(exports, { X, Y })
        result = result.replaceAll(
            "export\\s+\\{([^}]+)\\}",
            "Object.assign(exports, {$1})"
        );

        // export const X = ...  ->  const X = exports.X = ...
        result = result.replaceAll(
            "export\\s+(const|let|var)\\s+(\\w+)\\s*=",
            "$1 $2 = exports.$2 ="
        );

        // export function X  ->  const X = exports.X = function
        result = result.replaceAll(
            "export\\s+function\\s+(\\w+)",
            "const $1 = exports.$1 = function $1"
        );

        // export class X  ->  const X = exports.X = class
        result = result.replaceAll(
            "export\\s+class\\s+(\\w+)",
            "const $1 = exports.$1 = class $1"
        );

        // Remove import statements (dependencies bundled by CDN like esm.sh)
        result = result.replaceAll(
            "import\\s+.*?from\\s+['\"][^'\"]+['\"];?\\n?",
            ""
        );
        result = result.replaceAll(
            "import\\s+['\"][^'\"]+['\"];?\\n?",
            ""
        );

        return result;
    }

    /**
     * Generate replacement code for an import statement.
     */
    String generateImportReplacement(UrlImport imp, String moduleVar) {
        return switch (imp.type()) {
            case DEFAULT -> "const " + imp.identifier() + " = " + moduleVar + ".default ?? " + moduleVar + ";";
            case NAMESPACE -> "const " + imp.identifier() + " = " + moduleVar + ";";
            case NAMED -> {
                StringBuilder sb = new StringBuilder("const { ");
                sb.append(String.join(", ", imp.namedImports()));
                sb.append(" } = ").append(moduleVar).append(";");
                yield sb.toString();
            }
            case DEFAULT_AND_NAMED -> {
                StringBuilder sb = new StringBuilder();
                sb.append("const ").append(imp.identifier())
                  .append(" = ").append(moduleVar).append(".default ?? ").append(moduleVar).append(";\n");
                sb.append("const { ").append(String.join(", ", imp.namedImports()))
                  .append(" } = ").append(moduleVar).append(";");
                yield sb.toString();
            }
            case SIDE_EFFECT -> "// Side effect import: " + imp.url() + "\n" + moduleVar + ";";
        };
    }

    private String indent(String code, String indentation) {
        return code.lines()
            .map(line -> indentation + line)
            .reduce((a, b) -> a + "\n" + b)
            .orElse("");
    }

    // === Cache Management ===

    /**
     * Clear the module cache.
     */
    public void clearCache() {
        int size = moduleCache.size();
        moduleCache.clear();
        LOG.infof("Module cache cleared (%d entries)", size);
    }

    /**
     * Remove expired entries from cache.
     */
    public int cleanupCache() {
        long cacheTtlMs = configuration.UrlImportCacheTtlSeconds * 1000L;
        int removed = 0;

        var iterator = moduleCache.entrySet().iterator();
        while (iterator.hasNext()) {
            var entry = iterator.next();
            if (entry.getValue().isExpired(cacheTtlMs)) {
                iterator.remove();
                removed++;
            }
        }

        if (removed > 0) {
            LOG.infof("Cleaned up %d expired cache entries", removed);
        }

        return removed;
    }

    /**
     * Get cache statistics.
     */
    public CacheStats getCacheStats() {
        long cacheTtlMs = configuration.UrlImportCacheTtlSeconds * 1000L;
        long totalSize = 0;
        long validEntries = 0;

        for (CachedModule module : moduleCache.values()) {
            totalSize += module.code().length();
            if (!module.isExpired(cacheTtlMs)) {
                validEntries++;
            }
        }

        return new CacheStats(
            moduleCache.size(),
            validEntries,
            totalSize,
            cacheTtlMs / 1000
        );
    }

    /**
     * Prefetch and cache a module URL (useful for warming cache).
     */
    public void prefetch(String url) throws ImportResolutionException {
        fetchModule(url);
    }

    // === Record Types ===

    public record UrlImport(
        String fullMatch,
        String url,
        ImportType type,
        String identifier,
        List<String> namedImports
    ) {}

    public enum ImportType {
        DEFAULT,           // import X from 'url'
        NAMESPACE,         // import * as X from 'url'
        NAMED,             // import { a, b } from 'url'
        DEFAULT_AND_NAMED, // import X, { a, b } from 'url'
        SIDE_EFFECT        // import 'url'
    }

    public record FetchedModule(String url, String code, boolean fromCache) {}

    public record ResolvedHandler(
        String code,
        List<String> resolvedUrls,
        String originalSource,
        int preambleLineCount
    ) {}

    record ResolvedCode(String code, int preambleLineCount) {}

    record CachedModule(String code, long timestamp) {
        boolean isExpired(long ttlMs) {
            return System.currentTimeMillis() - timestamp > ttlMs;
        }
    }

    public record CacheStats(
        long totalEntries,
        long validEntries,
        long totalSizeBytes,
        long ttlSeconds
    ) {}
}
