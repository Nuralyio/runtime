package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.apache.hc.client5.http.HttpResponseException;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;

import java.io.IOException;

/**
 * Service for invoking functions by sending HTTP requests to localhost:8080 with a custom Host header.
 */
@ApplicationScoped
@Transactional
public class FunctionInvoker {

    @Inject
    Configuration configuration;
    @Inject
    EventService eventService;

    private static final int MAX_RETRIES = 1;

    /**
     * Invokes a function with the given payload by making an HTTP request to localhost:8080 with a custom Host header.
     *
     * @param functionEntity The function entity containing function metadata.
     * @param payload The payload as a JsonNode to pass to the function.
     * @return The result of the function execution.
     * @throws Exception If an error occurs during invocation.
     */
    public String invoke(FunctionEntity functionEntity, InvokeRequest payload) throws Exception {
        String hostHeader = buildHostHeader(functionEntity);

        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // Log event before invoking the function
            eventService.logEvent(EventType.FUNCTION_INVOCATION, functionEntity.getLabel(), EventStatus.PENDING, payload.getData());

            // Execute the request with retry logic
            String response = executeRequestWithRetry(httpClient, hostHeader, payload);

            // Log the event as SUCCESS after successful invocation
            eventService.logEvent(EventType.FUNCTION_INVOCATION, functionEntity.getLabel(), EventStatus.SUCCESS, payload.getData());

            return response;
        } catch (Exception e) {
            // Log the event as FAILURE if an error occurs
            eventService.logEvent(EventType.FUNCTION_INVOCATION, functionEntity.getLabel(), EventStatus.FAILURE, payload.getData());

            // Rethrow the exception after logging the failure event
            throw e;
        }
    }

    /**
     * Builds the Host header for invoking the function.
     *
     * @param functionEntity The function entity containing function metadata.
     * @return The constructed Host header value.
     */
    private String buildHostHeader(FunctionEntity functionEntity) {
        return functionEntity.getLabel() + "-" + functionEntity.id + "." + configuration.FunctionsDomain;
    }

    /**
     * Executes the HTTP request and retries in case of a 502 status code.
     *
     * @param httpClient The HttpClient used to send the request.
     * @param hostHeader The Host header value.
     * @param payload The payload as a JsonNode.
     * @return The response body as a string.
     * @throws Exception If an error occurs during the request.
     */
    private String executeRequestWithRetry(CloseableHttpClient httpClient, String hostHeader, InvokeRequest payload) throws Exception {
        int attempt = 0;
        CloseableHttpResponse response = null;

        while (attempt <= MAX_RETRIES) {
            attempt++;
            HttpPost request = createHttpRequest(hostHeader, payload);

            try {
                response = httpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode == 502 && attempt <= MAX_RETRIES) {
                    System.out.println("Received 502 Bad Gateway, retrying...");
                    Thread.sleep(1000);
                    continue;
                }

                if (statusCode != 200) {
                    throw new HttpResponseException(statusCode, "Failed to invoke function. HTTP status: " + statusCode);
                }

                // Extract and return the response body as a string
                HttpEntity entity = response.getEntity();
                String responseBody = entity != null ? EntityUtils.toString(entity) : null;

                // Log the response for debugging
                System.out.println("Response Body: " + responseBody);
                return responseBody;

            } catch (IOException e) {
                if (attempt >= MAX_RETRIES) {
                    throw e;
                }
                System.out.println("Retrying after failure: " + e.getMessage());
            } finally {
                if (response != null) {
                    response.close();
                }
            }
        }

        throw new RuntimeException("Maximum retries reached without success.");
    }

    /**
     * Creates the HTTP POST request to invoke the function.
     *
     * @param hostHeader The Host header value.
     * @param payload The payload as a JsonNode.
     * @return The created HTTP POST request.
     */
    private HttpPost createHttpRequest(String hostHeader, InvokeRequest payload) {
        HttpPost request = new HttpPost("http://localhost:8080");
        request.addHeader("Host", hostHeader);
        request.addHeader("Content-Type", "application/json");
        request.setEntity(new StringEntity(payload.getData().toString(), ContentType.parse("UTF-8")));
        return request;
    }
}