package com.nuraly.functions.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Invokes functions via WASM runtime.
 */
@ApplicationScoped
@Transactional
public class FunctionInvoker {

    @Inject
    WasmRuntimeService wasmRuntime;

    @Inject
    EventService eventService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Invoke function via WASM runtime
     */
    public String invoke(FunctionEntity function, InvokeRequest payload) throws Exception {
        String functionId = function.getId().toString();

        // Check if deployed
        if (!wasmRuntime.isDeployed(functionId)) {
            throw new RuntimeException("Function not deployed. Please build first.");
        }

        // Log pending event
        eventService.logEvent(
            EventType.FUNCTION_INVOCATION,
            function.getLabel(),
            EventStatus.PENDING,
            payload.getData()
        );

        try {
            // Prepare input
            Map<String, Object> input = Map.of(
                "body", payload.getData(),
                "context", Map.of(
                    "functionId", functionId,
                    "functionName", function.getLabel(),
                    "invocationId", UUID.randomUUID().toString()
                )
            );
            String inputJson = objectMapper.writeValueAsString(input);

            // Execute via WASM
            String result = wasmRuntime.invokeSync(functionId, inputJson);

            // Log success
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                function.getLabel(),
                EventStatus.SUCCESS,
                payload.getData()
            );

            return result;

        } catch (Exception e) {
            // Log failure
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                function.getLabel(),
                EventStatus.FAILURE,
                payload.getData()
            );
            throw e;
        }
    }
}
