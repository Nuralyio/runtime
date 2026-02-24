package com.nuraly.workflows.engine;

import com.nuraly.workflows.engine.executors.*;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;

import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class NodeExecutorFactory {

    @Inject
    Instance<NodeExecutor> executors;

    private Map<NodeType, NodeExecutor> executorMap;

    @PostConstruct
    void init() {
        executorMap = new HashMap<>();
        for (NodeExecutor executor : executors) {
            executorMap.put(executor.getType(), executor);
        }
    }

    public NodeExecutor getExecutor(NodeType type) {
        NodeExecutor executor = executorMap.get(type);
        if (executor == null) {
            throw new IllegalArgumentException("No executor found for node type: " + type);
        }
        return executor;
    }

    public boolean hasExecutor(NodeType type) {
        return executorMap.containsKey(type);
    }
}
