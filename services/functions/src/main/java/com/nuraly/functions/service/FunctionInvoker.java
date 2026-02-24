package com.nuraly.functions.service;

import com.nuraly.functions.dto.InvokeRequest;
import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import com.nuraly.functions.messaging.FunctionExecutionService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Invokes functions via Deno workers (RabbitMQ).
 */
@ApplicationScoped
@Transactional
public class FunctionInvoker {

    private static final Logger LOG = Logger.getLogger(FunctionInvoker.class);

    @Inject
    FunctionExecutionService executionService;

    @Inject
    EventService eventService;

    /**
     * Invoke function via Deno workers.
     */
    public String invoke(FunctionEntity function, InvokeRequest payload) throws Exception {
        String functionId = function.getId().toString();
        String functionName = function.getLabel();
        String handler = function.getHandler();

        // Log pending event
        eventService.logEvent(
            EventType.FUNCTION_INVOCATION,
            functionName,
            EventStatus.PENDING,
            payload.getData()
        );

        try {
            // Execute via Deno workers
            String result = executionService.executeSync(
                functionId,
                functionName,
                handler,
                payload.getData()
            );

            // Log success
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                functionName,
                EventStatus.SUCCESS,
                payload.getData()
            );

            LOG.debugf("Function %s executed successfully", functionId);
            return result;

        } catch (Exception e) {
            // Log failure
            eventService.logEvent(
                EventType.FUNCTION_INVOCATION,
                functionName,
                EventStatus.FAILURE,
                payload.getData()
            );
            throw e;
        }
    }
}
