package com.nuraly.functions.service;

import com.nuraly.functions.entity.FunctionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

/**
 * Manages function builds.
 *
 * With Deno workers, there is no compilation step - handlers are sent
 * directly to workers at invocation time. This class exists for API
 * compatibility and validates the function is ready for execution.
 */
@ApplicationScoped
@Transactional
public class ContainerManager {

    private static final Logger LOG = Logger.getLogger(ContainerManager.class);

    /**
     * Build function - validates function is ready for execution.
     * With Deno workers, no actual compilation is needed.
     */
    public String buildDockerImage(FunctionEntity functionEntity) {
        String functionId = functionEntity.getId().toString();

        // Validate handler exists
        if (functionEntity.getHandler() == null || functionEntity.getHandler().isBlank()) {
            throw new IllegalArgumentException("Function handler is empty");
        }

        LOG.infof("Function %s validated and ready for execution", functionEntity.getLabel());

        return "deno:" + functionId;
    }
}
