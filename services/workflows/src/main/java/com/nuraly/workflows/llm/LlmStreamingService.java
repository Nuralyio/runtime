package com.nuraly.workflows.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.llm.StreamingLlmProvider.StreamToken;
import com.nuraly.workflows.llm.dto.LlmRequest;
import com.nuraly.workflows.llm.dto.LlmResponse;
import io.micrometer.core.instrument.MeterRegistry;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.subscription.MultiEmitter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Service for streaming LLM responses.
 * Manages streaming sessions and provides Multi-based streams for SSE.
 *
 * Usage:
 * <pre>
 * Multi<StreamEvent> stream = streamingService.streamChat(request, "openai", apiKey);
 * stream.subscribe().with(
 *     event -> sendToClient(event),
 *     error -> handleError(error),
 *     () -> handleComplete()
 * );
 * </pre>
 */
@ApplicationScoped
public class LlmStreamingService {

    private static final Logger LOG = Logger.getLogger(LlmStreamingService.class);

    @Inject
    LlmProviderFactory providerFactory;

    @Inject
    MeterRegistry meterRegistry;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Track active streams for cancellation
    private final ConcurrentHashMap<String, AtomicBoolean> activeStreams = new ConcurrentHashMap<>();

    /**
     * Start a streaming LLM call and return a Multi of events.
     *
     * @param request The LLM request
     * @param providerName Provider name (openai, anthropic, etc.)
     * @param apiKey API key
     * @return Multi stream of events for SSE
     */
    public Multi<StreamEvent> streamChat(LlmRequest request, String providerName, String apiKey) {
        String streamId = UUID.randomUUID().toString();

        return Multi.createFrom().emitter(emitter -> {
            AtomicBoolean cancelled = new AtomicBoolean(false);
            activeStreams.put(streamId, cancelled);

            // Run in separate thread to not block
            Thread.startVirtualThread(() -> {
                try {
                    executeStreamingCall(emitter, request, providerName, apiKey, streamId, cancelled);
                } catch (Exception e) {
                    LOG.errorf(e, "Streaming error for stream %s", streamId);
                    emitter.emit(StreamEvent.error(e.getMessage()));
                    emitter.complete();
                } finally {
                    activeStreams.remove(streamId);
                }
            });
        });
    }

    /**
     * Cancel an active stream.
     */
    public void cancelStream(String streamId) {
        AtomicBoolean cancelled = activeStreams.get(streamId);
        if (cancelled != null) {
            cancelled.set(true);
            LOG.debugf("Stream %s cancelled", streamId);
        }
    }

    private void executeStreamingCall(
            MultiEmitter<? super StreamEvent> emitter,
            LlmRequest request,
            String providerName,
            String apiKey,
            String streamId,
            AtomicBoolean cancelled) {

        LlmProvider provider = providerFactory.getProvider(providerName);

        if (provider == null) {
            emitter.emit(StreamEvent.error("Unknown provider: " + providerName));
            emitter.complete();
            return;
        }

        // Check if provider supports streaming
        if (!(provider instanceof StreamingLlmProvider streamingProvider)) {
            // Fall back to non-streaming call
            LOG.debugf("Provider %s doesn't support streaming, falling back to non-streaming", providerName);
            LlmResponse response = provider.chat(request, apiKey);

            if (response.isSuccess()) {
                // Simulate streaming by sending content in chunks
                String content = response.getContent();
                if (content != null) {
                    emitter.emit(StreamEvent.content(content));
                }
                emitter.emit(StreamEvent.done(response));
            } else {
                emitter.emit(StreamEvent.error(response.getError()));
            }
            emitter.complete();
            return;
        }

        // Emit stream started event
        emitter.emit(StreamEvent.started(streamId));

        long startTime = System.currentTimeMillis();
        StringBuilder contentBuilder = new StringBuilder();

        // Execute streaming call
        LlmResponse finalResponse = streamingProvider.streamChat(request, apiKey, token -> {
            if (cancelled.get()) {
                return;
            }

            if (token.isContent() && token.getContent() != null) {
                contentBuilder.append(token.getContent());
                emitter.emit(StreamEvent.token(token.getContent()));
            } else if (token.isDone()) {
                // Don't emit here, we'll emit done event after getting final response
            } else if (token.isError()) {
                emitter.emit(StreamEvent.error(token.getContent()));
            }
        });

        // Record metrics
        long duration = System.currentTimeMillis() - startTime;
        meterRegistry.timer("llm.streaming.duration", "provider", providerName)
                .record(Duration.ofMillis(duration));

        if (cancelled.get()) {
            emitter.emit(StreamEvent.cancelled());
            emitter.complete();
            return;
        }

        // Emit final done event with complete response
        if (finalResponse != null && finalResponse.isSuccess()) {
            emitter.emit(StreamEvent.done(finalResponse));
        } else if (finalResponse != null) {
            emitter.emit(StreamEvent.error(finalResponse.getError()));
        }

        emitter.complete();
    }

    /**
     * Event emitted during streaming.
     */
    public static class StreamEvent {
        private final EventType type;
        private final String data;
        private final LlmResponse response;

        public enum EventType {
            STARTED,    // Stream started
            TOKEN,      // Content token received
            DONE,       // Stream completed with final response
            ERROR,      // Error occurred
            CANCELLED   // Stream was cancelled
        }

        private StreamEvent(EventType type, String data, LlmResponse response) {
            this.type = type;
            this.data = data;
            this.response = response;
        }

        public static StreamEvent started(String streamId) {
            return new StreamEvent(EventType.STARTED, streamId, null);
        }

        public static StreamEvent token(String content) {
            return new StreamEvent(EventType.TOKEN, content, null);
        }

        public static StreamEvent content(String content) {
            return new StreamEvent(EventType.TOKEN, content, null);
        }

        public static StreamEvent done(LlmResponse response) {
            return new StreamEvent(EventType.DONE, null, response);
        }

        public static StreamEvent error(String message) {
            return new StreamEvent(EventType.ERROR, message, null);
        }

        public static StreamEvent cancelled() {
            return new StreamEvent(EventType.CANCELLED, null, null);
        }

        public EventType getType() { return type; }
        public String getData() { return data; }
        public LlmResponse getResponse() { return response; }

        public boolean isToken() { return type == EventType.TOKEN; }
        public boolean isDone() { return type == EventType.DONE; }
        public boolean isError() { return type == EventType.ERROR; }

        /**
         * Format as SSE event string.
         */
        public String toSSE(ObjectMapper objectMapper) {
            try {
                ObjectNode json = objectMapper.createObjectNode();
                json.put("type", type.name().toLowerCase());

                switch (type) {
                    case STARTED -> json.put("streamId", data);
                    case TOKEN -> json.put("content", data);
                    case DONE -> {
                        if (response != null) {
                            json.put("content", response.getContent());
                            json.put("finishReason", response.getFinishReason().name());
                            if (response.getUsage() != null) {
                                ObjectNode usage = objectMapper.createObjectNode();
                                usage.put("promptTokens", response.getUsage().getPromptTokens());
                                usage.put("completionTokens", response.getUsage().getCompletionTokens());
                                usage.put("totalTokens", response.getUsage().getTotalTokens());
                                json.set("usage", usage);
                            }
                        }
                    }
                    case ERROR -> json.put("error", data);
                    case CANCELLED -> json.put("cancelled", true);
                }

                return "data: " + objectMapper.writeValueAsString(json) + "\n\n";
            } catch (Exception e) {
                return "data: {\"type\":\"error\",\"error\":\"" + e.getMessage() + "\"}\n\n";
            }
        }
    }
}
