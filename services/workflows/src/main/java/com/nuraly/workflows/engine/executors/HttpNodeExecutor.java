package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.http.HttpClientManager;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.*;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.eclipse.microprofile.faulttolerance.CircuitBreaker;
import org.eclipse.microprofile.faulttolerance.Timeout;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.time.temporal.ChronoUnit;

/**
 * HTTP Node Executor with:
 * - Connection pooling (via HttpClientManager)
 * - Circuit breaker (prevents cascading failures)
 * - Timeout protection (prevents hung requests)
 * - Metrics tracking (request count, duration, errors)
 */
@ApplicationScoped
public class HttpNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(HttpNodeExecutor.class);

    @Inject
    HttpClientManager httpClientManager;

    @Inject
    MeterRegistry meterRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public NodeType getType() {
        return NodeType.HTTP;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("HTTP node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        String method = config.has("method") ? config.get("method").asText().toUpperCase() : "GET";
        String url = config.has("url") ? context.resolveExpression(config.get("url").asText()) : null;

        if (url == null) {
            return NodeExecutionResult.failure("url is required in configuration");
        }

        // Execute with circuit breaker and timeout protection
        return executeWithResilience(context, node, config, method, url);
    }

    /**
     * Execute HTTP request with circuit breaker and timeout.
     * Circuit breaker will open after 5 failures in 10 requests (50% threshold).
     * Timeout set to 30 seconds to prevent hung requests.
     */
    @CircuitBreaker(
            requestVolumeThreshold = 10,
            failureRatio = 0.5,
            delay = 60000,
            successThreshold = 3,
            failOn = {IOException.class, SocketTimeoutException.class}
    )
    @Timeout(value = 30, unit = ChronoUnit.SECONDS)
    public NodeExecutionResult executeWithResilience(
            ExecutionContext context,
            WorkflowNodeEntity node,
            JsonNode config,
            String method,
            String url) throws Exception {

        Timer.Sample timerSample = Timer.start(meterRegistry);
        String status = "success";

        try {
            var httpClient = httpClientManager.getClient();
            HttpUriRequestBase request = createRequest(method, url);

            // Add headers
            if (config.has("headers")) {
                config.get("headers").fields().forEachRemaining(entry -> {
                    String headerValue = context.resolveExpression(entry.getValue().asText());
                    request.addHeader(entry.getKey(), headerValue);
                });
            }

            // Add body for POST/PUT/PATCH
            if (config.has("body") && (method.equals("POST") || method.equals("PUT") || method.equals("PATCH"))) {
                String body;
                JsonNode bodyConfig = config.get("body");
                if (bodyConfig.isTextual()) {
                    body = context.resolveExpression(bodyConfig.asText());
                } else {
                    ObjectNode resolvedBody = objectMapper.createObjectNode();
                    bodyConfig.fields().forEachRemaining(entry -> {
                        if (entry.getValue().isTextual()) {
                            resolvedBody.put(entry.getKey(), context.resolveExpression(entry.getValue().asText()));
                        } else {
                            resolvedBody.set(entry.getKey(), entry.getValue());
                        }
                    });
                    body = objectMapper.writeValueAsString(resolvedBody);
                }
                request.setEntity(new StringEntity(body, ContentType.APPLICATION_JSON));
            }

            var response = httpClient.execute(request);
            int statusCode = response.getCode();
            String responseBody = response.getEntity() != null ? EntityUtils.toString(response.getEntity()) : "";

            ObjectNode output = objectMapper.createObjectNode();
            output.put("statusCode", statusCode);
            output.put("body", responseBody);

            try {
                JsonNode jsonBody = objectMapper.readTree(responseBody);
                output.set("jsonBody", jsonBody);
            } catch (Exception e) {
                // Not JSON, that's fine
            }

            // Map output to variables
            if (config.has("outputMapping")) {
                JsonNode outputMapping = config.get("outputMapping");
                outputMapping.fields().forEachRemaining(entry -> {
                    String variablePath = entry.getKey();
                    if (variablePath.startsWith("$.variables.")) {
                        String varName = variablePath.substring(12);
                        context.setVariable(varName, output);
                    }
                });
            }

            if (statusCode >= 200 && statusCode < 300) {
                return NodeExecutionResult.success(output);
            } else if (statusCode >= 500) {
                status = "error_5xx";
                return NodeExecutionResult.failure("HTTP request failed with status " + statusCode, true);
            } else {
                status = "error_4xx";
                return NodeExecutionResult.failure("HTTP request failed with status " + statusCode);
            }

        } catch (Exception e) {
            status = "error_exception";
            LOG.errorf(e, "HTTP request failed for URL: %s", url);
            throw e;
        } finally {
            // Record metrics
            timerSample.stop(Timer.builder("workflow.http.request")
                    .tag("method", method)
                    .tag("status", status)
                    .register(meterRegistry));

            meterRegistry.counter("workflow.http.requests.total",
                    "method", method,
                    "status", status).increment();
        }
    }

    private HttpUriRequestBase createRequest(String method, String url) {
        return switch (method) {
            case "POST" -> new HttpPost(url);
            case "PUT" -> new HttpPut(url);
            case "DELETE" -> new HttpDelete(url);
            case "PATCH" -> new HttpPatch(url);
            default -> new HttpGet(url);
        };
    }
}
