package com.nuraly.functions.service;

import com.nuraly.functions.entity.FunctionEntity;
import com.nuraly.functions.exception.ImageBuildError;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

/**
 * Builds functions - compiles to WASM instead of Docker containers.
 */
@ApplicationScoped
@Transactional
public class ContainerManager {

    @Inject
    WasmCompilerService wasmCompiler;

    @Inject
    WasmRuntimeService wasmRuntime;

    /**
     * Build function - compiles to WASM and deploys to runtime
     */
    public String buildDockerImage(FunctionEntity functionEntity) throws ImageBuildError {
        try {
            String functionId = functionEntity.getId().toString();

            // Compile TypeScript/JavaScript to WASM
            byte[] wasmBytes = wasmCompiler.compileToWasm(functionEntity);

            // Deploy to WASM runtime
            wasmRuntime.deploy(functionId, wasmBytes);

            System.out.println("Function compiled and deployed: " + functionEntity.getLabel());

            return "wasm:" + functionId;

        } catch (Exception e) {
            throw new ImageBuildError("Failed to compile function: " + e.getMessage());
        }
    }
}
