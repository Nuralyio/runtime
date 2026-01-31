package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * WEB_SEARCH Node Executor - Search the web using multiple providers.
 *
 * <p>Supports multiple search providers:</p>
 * <ul>
 *   <li>google - Google Custom Search API</li>
 *   <li>bing - Bing Web Search API</li>
 *   <li>serpapi - SerpAPI (supports Google, Bing, DuckDuckGo)</li>
 *   <li>brave - Brave Search API</li>
 *   <li>duckduckgo - DuckDuckGo Instant Answer API (free, limited)</li>
 * </ul>
 *
 * <p>API keys are fetched from KV store using pattern: search/{provider}/api_key</p>
 */
@ApplicationScoped
public class WebSearchNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(WebSearchNodeExecutor.class);
    private static final int DEFAULT_NUM_RESULTS = 10;
    private static final int DEFAULT_TIMEOUT_MS = 30000;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Inject
    Configuration configuration;

    @Override
    public NodeType getType() {
        return NodeType.WEB_SEARCH;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("WEB_SEARCH node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);
        JsonNode input = context.getInput();

        // Get search query
        String queryField = config.has("queryField") ? config.get("queryField").asText() : "query";
        String query = null;

        if (config.has("query")) {
            query = config.get("query").asText();
        } else if (input.has(queryField)) {
            query = input.get(queryField).asText();
        }

        if (query == null || query.isBlank()) {
            return NodeExecutionResult.failure("No search query provided");
        }

        // Get provider and settings
        String provider = config.has("provider") ? config.get("provider").asText() : "google";
        int numResults = config.has("numResults") ? config.get("numResults").asInt() : DEFAULT_NUM_RESULTS;
        int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;
        String region = config.has("region") ? config.get("region").asText() : null;
        String language = config.has("language") ? config.get("language").asText() : null;
        boolean safeSearch = !config.has("safeSearch") || config.get("safeSearch").asBoolean();

        LOG.infof("Executing web search: provider=%s, query='%s', numResults=%d",
                provider, query, numResults);

        try {
            List<SearchResult> results = switch (provider.toLowerCase()) {
                case "google" -> searchGoogle(query, numResults, region, language, safeSearch, timeout, context);
                case "bing" -> searchBing(query, numResults, region, language, safeSearch, timeout, context);
                case "serpapi" -> searchSerpApi(query, numResults, region, language, safeSearch, timeout, context);
                case "brave" -> searchBrave(query, numResults, region, language, safeSearch, timeout, context);
                case "duckduckgo" -> searchDuckDuckGo(query, numResults, timeout);
                default -> throw new IllegalArgumentException("Unknown search provider: " + provider);
            };

            // Build output
            ObjectNode output = objectMapper.createObjectNode();
            output.put("query", query);
            output.put("provider", provider);
            output.put("totalResults", results.size());

            ArrayNode resultsArray = objectMapper.createArrayNode();
            for (SearchResult result : results) {
                ObjectNode resultNode = objectMapper.createObjectNode();
                resultNode.put("title", result.title);
                resultNode.put("url", result.url);
                resultNode.put("snippet", result.snippet);
                if (result.displayUrl != null) {
                    resultNode.put("displayUrl", result.displayUrl);
                }
                if (result.datePublished != null) {
                    resultNode.put("datePublished", result.datePublished);
                }
                resultsArray.add(resultNode);
            }
            output.set("results", resultsArray);

            // Extract just URLs for easy piping to WEB_CRAWL
            ArrayNode urlsArray = objectMapper.createArrayNode();
            results.forEach(r -> urlsArray.add(r.url));
            output.set("urls", urlsArray);

            // Pass through isolationKey
            if (input.has("isolationKey")) {
                output.put("isolationKey", input.get("isolationKey").asText());
            }

            LOG.infof("Web search completed: provider=%s, results=%d", provider, results.size());
            return NodeExecutionResult.success(output);

        } catch (Exception e) {
            LOG.errorf(e, "Web search failed: provider=%s, query='%s'", provider, query);
            boolean retryable = e.getMessage() != null &&
                    (e.getMessage().contains("timeout") || e.getMessage().contains("connection"));
            return NodeExecutionResult.failure("Search failed: " + e.getMessage(), retryable);
        }
    }

    private List<SearchResult> searchGoogle(String query, int numResults, String region,
                                            String language, boolean safeSearch, int timeout,
                                            ExecutionContext context) throws Exception {
        // Get API key and Search Engine ID from KV store
        String apiKey = getApiKey("google", context);
        String searchEngineId = getConfigValue("google", "search_engine_id", context);

        if (apiKey == null || searchEngineId == null) {
            throw new IllegalStateException("Google API key or Search Engine ID not configured. " +
                    "Set search/google/api_key and search/google/search_engine_id in KV store.");
        }

        StringBuilder url = new StringBuilder("https://www.googleapis.com/customsearch/v1");
        url.append("?key=").append(URLEncoder.encode(apiKey, StandardCharsets.UTF_8));
        url.append("&cx=").append(URLEncoder.encode(searchEngineId, StandardCharsets.UTF_8));
        url.append("&q=").append(URLEncoder.encode(query, StandardCharsets.UTF_8));
        url.append("&num=").append(Math.min(numResults, 10)); // Google max is 10 per request

        if (region != null) {
            url.append("&gl=").append(region);
        }
        if (language != null) {
            url.append("&lr=lang_").append(language);
        }
        if (safeSearch) {
            url.append("&safe=active");
        }

        JsonNode response = executeRequest(url.toString(), null, timeout);
        List<SearchResult> results = new ArrayList<>();

        if (response.has("items")) {
            for (JsonNode item : response.get("items")) {
                results.add(new SearchResult(
                        item.path("title").asText(""),
                        item.path("link").asText(""),
                        item.path("snippet").asText(""),
                        item.path("displayLink").asText(null),
                        null
                ));
            }
        }

        return results;
    }

    private List<SearchResult> searchBing(String query, int numResults, String region,
                                          String language, boolean safeSearch, int timeout,
                                          ExecutionContext context) throws Exception {
        String apiKey = getApiKey("bing", context);

        if (apiKey == null) {
            throw new IllegalStateException("Bing API key not configured. Set search/bing/api_key in KV store.");
        }

        StringBuilder url = new StringBuilder("https://api.bing.microsoft.com/v7.0/search");
        url.append("?q=").append(URLEncoder.encode(query, StandardCharsets.UTF_8));
        url.append("&count=").append(Math.min(numResults, 50)); // Bing max is 50

        if (region != null) {
            url.append("&mkt=").append(region);
        }
        if (safeSearch) {
            url.append("&safeSearch=Strict");
        }

        JsonNode response = executeRequest(url.toString(), "Ocp-Apim-Subscription-Key: " + apiKey, timeout);
        List<SearchResult> results = new ArrayList<>();

        if (response.has("webPages") && response.get("webPages").has("value")) {
            for (JsonNode item : response.get("webPages").get("value")) {
                results.add(new SearchResult(
                        item.path("name").asText(""),
                        item.path("url").asText(""),
                        item.path("snippet").asText(""),
                        item.path("displayUrl").asText(null),
                        item.path("dateLastCrawled").asText(null)
                ));
            }
        }

        return results;
    }

    private List<SearchResult> searchSerpApi(String query, int numResults, String region,
                                             String language, boolean safeSearch, int timeout,
                                             ExecutionContext context) throws Exception {
        String apiKey = getApiKey("serpapi", context);

        if (apiKey == null) {
            throw new IllegalStateException("SerpAPI key not configured. Set search/serpapi/api_key in KV store.");
        }

        StringBuilder url = new StringBuilder("https://serpapi.com/search.json");
        url.append("?api_key=").append(URLEncoder.encode(apiKey, StandardCharsets.UTF_8));
        url.append("&q=").append(URLEncoder.encode(query, StandardCharsets.UTF_8));
        url.append("&num=").append(numResults);
        url.append("&engine=google");

        if (region != null) {
            url.append("&gl=").append(region);
        }
        if (language != null) {
            url.append("&hl=").append(language);
        }
        if (safeSearch) {
            url.append("&safe=active");
        }

        JsonNode response = executeRequest(url.toString(), null, timeout);
        List<SearchResult> results = new ArrayList<>();

        if (response.has("organic_results")) {
            for (JsonNode item : response.get("organic_results")) {
                results.add(new SearchResult(
                        item.path("title").asText(""),
                        item.path("link").asText(""),
                        item.path("snippet").asText(""),
                        item.path("displayed_link").asText(null),
                        item.path("date").asText(null)
                ));
            }
        }

        return results;
    }

    private List<SearchResult> searchBrave(String query, int numResults, String region,
                                           String language, boolean safeSearch, int timeout,
                                           ExecutionContext context) throws Exception {
        String apiKey = getApiKey("brave", context);

        if (apiKey == null) {
            throw new IllegalStateException("Brave API key not configured. Set search/brave/api_key in KV store.");
        }

        StringBuilder url = new StringBuilder("https://api.search.brave.com/res/v1/web/search");
        url.append("?q=").append(URLEncoder.encode(query, StandardCharsets.UTF_8));
        url.append("&count=").append(Math.min(numResults, 20)); // Brave max is 20

        if (region != null) {
            url.append("&country=").append(region);
        }
        if (language != null) {
            url.append("&search_lang=").append(language);
        }
        if (safeSearch) {
            url.append("&safesearch=strict");
        }

        JsonNode response = executeRequest(url.toString(), "X-Subscription-Token: " + apiKey, timeout);
        List<SearchResult> results = new ArrayList<>();

        if (response.has("web") && response.get("web").has("results")) {
            for (JsonNode item : response.get("web").get("results")) {
                results.add(new SearchResult(
                        item.path("title").asText(""),
                        item.path("url").asText(""),
                        item.path("description").asText(""),
                        null,
                        item.path("age").asText(null)
                ));
            }
        }

        return results;
    }

    private List<SearchResult> searchDuckDuckGo(String query, int numResults, int timeout) throws Exception {
        // DuckDuckGo Instant Answer API (limited but free, no API key)
        String url = "https://api.duckduckgo.com/?q=" +
                URLEncoder.encode(query, StandardCharsets.UTF_8) +
                "&format=json&no_html=1&skip_disambig=1";

        JsonNode response = executeRequest(url, null, timeout);
        List<SearchResult> results = new ArrayList<>();

        // DuckDuckGo returns different structure - RelatedTopics contain links
        if (response.has("RelatedTopics")) {
            for (JsonNode topic : response.get("RelatedTopics")) {
                if (topic.has("FirstURL") && results.size() < numResults) {
                    results.add(new SearchResult(
                            topic.path("Text").asText("").split(" - ")[0],
                            topic.path("FirstURL").asText(""),
                            topic.path("Text").asText(""),
                            null,
                            null
                    ));
                }
                // Handle nested topics
                if (topic.has("Topics")) {
                    for (JsonNode subTopic : topic.get("Topics")) {
                        if (subTopic.has("FirstURL") && results.size() < numResults) {
                            results.add(new SearchResult(
                                    subTopic.path("Text").asText("").split(" - ")[0],
                                    subTopic.path("FirstURL").asText(""),
                                    subTopic.path("Text").asText(""),
                                    null,
                                    null
                            ));
                        }
                    }
                }
            }
        }

        // Also include AbstractURL if available
        if (response.has("AbstractURL") && !response.get("AbstractURL").asText().isEmpty()) {
            results.add(0, new SearchResult(
                    response.path("Heading").asText(""),
                    response.path("AbstractURL").asText(""),
                    response.path("Abstract").asText(""),
                    null,
                    null
            ));
        }

        return results;
    }

    private JsonNode executeRequest(String url, String authHeader, int timeout) throws Exception {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(timeout))
                .header("Accept", "application/json")
                .header("User-Agent", "NuralyWorkflow/1.0")
                .GET();

        if (authHeader != null && authHeader.contains(":")) {
            String[] parts = authHeader.split(":", 2);
            requestBuilder.header(parts[0].trim(), parts[1].trim());
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(),
                HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Search API returned error: " + response.statusCode() +
                    " - " + response.body());
        }

        return objectMapper.readTree(response.body());
    }

    private String getApiKey(String provider, ExecutionContext context) {
        return fetchFromKvStore("search/" + provider + "/api_key", context);
    }

    private String getConfigValue(String provider, String configKey, ExecutionContext context) {
        return fetchFromKvStore("search/" + provider + "/" + configKey, context);
    }

    /**
     * Fetch a value from the KV store.
     */
    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId != null ?
                        context.getExecution().workflow.applicationId.toString() : null;
            }

            if (appId == null) {
                return null;
            }

            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    URLEncoder.encode(keyPath, StandardCharsets.UTF_8) +
                    "?applicationId=" + appId;

            try (CloseableHttpClient kvHttpClient = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(kvServiceUrl);
                request.addHeader("Content-Type", "application/json");

                var response = kvHttpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode >= 200 && statusCode < 300) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    JsonNode kvEntry = objectMapper.readTree(responseBody);
                    if (kvEntry.has("value")) {
                        return kvEntry.get("value").asText();
                    }
                }
            }

            return null;
        } catch (Exception e) {
            LOG.debugf("Failed to fetch from KV store %s: %s", keyPath, e.getMessage());
            return null;
        }
    }

    private record SearchResult(String title, String url, String snippet, String displayUrl, String datePublished) {}
}
