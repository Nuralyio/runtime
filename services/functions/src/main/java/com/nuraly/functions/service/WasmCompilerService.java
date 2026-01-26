package com.nuraly.functions.service;

import com.nuraly.functions.configuration.Configuration;
import com.nuraly.functions.entity.FunctionEntity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Compiles TypeScript/JavaScript handlers to WebAssembly.
 * Pipeline: TypeScript -> JavaScript (esbuild) -> WASM (Javy)
 */
@ApplicationScoped
public class WasmCompilerService {

    @Inject
    Configuration configuration;

    /**
     * Compile function handler to WASM
     */
    public byte[] compileToWasm(FunctionEntity function) throws Exception {
        Path tempDir = Path.of(configuration.WasmTempDir, UUID.randomUUID().toString());
        Files.createDirectories(tempDir);

        try {
            Path tsFile = tempDir.resolve("handler.ts");
            Path jsFile = tempDir.resolve("handler.js");
            Path wasmFile = tempDir.resolve("handler.wasm");

            // Write handler with WASM wrapper
            String wrappedHandler = wrapHandler(function.getHandler());
            Files.writeString(tsFile, wrappedHandler);

            // TypeScript -> JavaScript (esbuild)
            runCommand(tempDir, "esbuild", tsFile.toString(),
                "--bundle", "--format=esm", "--target=es2020",
                "--outfile=" + jsFile.toString());

            // JavaScript -> WASM (Javy)
            runCommand(tempDir, "javy", "compile", jsFile.toString(),
                "-o", wasmFile.toString());

            return Files.readAllBytes(wasmFile);

        } finally {
            deleteDirectory(tempDir);
        }
    }

    /**
     * Wrap user handler with Javy-compatible entry point
     */
    private String wrapHandler(String userHandler) {
        return """
            %s

            // WASM entry point
            const inputBytes = Javy.IO.readSync(0);
            const inputStr = new TextDecoder().decode(inputBytes);
            const input = JSON.parse(inputStr);

            const result = handler(input.body, input.context);

            Promise.resolve(result).then(output => {
                const outputStr = JSON.stringify(output);
                const outputBytes = new TextEncoder().encode(outputStr);
                Javy.IO.writeSync(1, outputBytes);
            });
            """.formatted(userHandler);
    }

    private void runCommand(Path workDir, String... command) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workDir.toFile());
        pb.redirectErrorStream(true);

        Process process = pb.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        boolean finished = process.waitFor(60, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            throw new RuntimeException("Command timed out: " + String.join(" ", command));
        }

        if (process.exitValue() != 0) {
            throw new RuntimeException("Command failed: " + output);
        }
    }

    private void deleteDirectory(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException ignored) {
                        }
                    });
            }
        } catch (IOException ignored) {
        }
    }
}
