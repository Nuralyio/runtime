/**
 * Isolated subprocess executor for Deno functions
 *
 * Each function execution runs in a separate Deno subprocess with
 * restricted permissions for security isolation.
 */

import type { Permissions, SubprocessResult } from "./types.ts";

/**
 * Execute a handler function in an isolated Deno subprocess.
 *
 * @param handler - The JavaScript/TypeScript handler code
 * @param input - Input data (body + context) for the handler
 * @param permissions - Deno permissions for the subprocess
 * @param timeout - Execution timeout in milliseconds
 * @returns Execution result with success/error status
 */
export async function executeIsolated(
  handler: string,
  input: unknown,
  permissions: Permissions,
  timeout: number
): Promise<SubprocessResult> {
  // Create temp file for the handler
  const tempFile = await Deno.makeTempFile({ suffix: ".ts" });

  try {
    // Write handler with execution wrapper
    const wrappedHandler = createWrappedHandler(handler, input);
    await Deno.writeTextFile(tempFile, wrappedHandler);

    // Build permission args
    const args = buildPermissionArgs(tempFile, permissions);

    // Build a clean env without LD_LIBRARY_PATH to avoid
    // Deno requiring --allow-run permissions for the subprocess
    const cleanEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(Deno.env.toObject())) {
      if (key !== "LD_LIBRARY_PATH") {
        cleanEnv[key] = value;
      }
    }

    // Spawn subprocess
    const command = new Deno.Command("deno", {
      args,
      stdout: "piped",
      stderr: "piped",
      env: cleanEnv,
    });

    const process = command.spawn();

    // Set up timeout handling
    const timeoutId = setTimeout(() => {
      try {
        process.kill("SIGKILL");
      } catch {
        // Process may have already exited
      }
    }, timeout);

    // Wait for process to complete
    const { stdout, stderr, code } = await process.output();
    clearTimeout(timeoutId);

    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);

    // Check for timeout (SIGKILL results in specific exit codes)
    if (code === 137 || code === 143) {
      return {
        success: false,
        error: `Execution timed out after ${timeout}ms`,
      };
    }

    // Try to parse the JSON result from stdout
    // The last line should be our JSON result
    const lines = stdoutText.trim().split("\n");
    const lastLine = lines[lines.length - 1];

    try {
      const result = JSON.parse(lastLine) as SubprocessResult;
      return result;
    } catch {
      // If we can't parse JSON, something went wrong
      if (stderrText) {
        return {
          success: false,
          error: stderrText || "Unknown error",
          stack: stderrText,
        };
      }

      if (code !== 0) {
        return {
          success: false,
          error: `Process exited with code ${code}`,
          stack: stdoutText || stderrText,
        };
      }

      // Return raw output if no JSON
      return {
        success: false,
        error: "Handler did not return valid JSON result",
        stack: stdoutText,
      };
    }
  } finally {
    // Clean up temp file
    try {
      await Deno.remove(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Create wrapped handler code that executes and outputs JSON result.
 */
function createWrappedHandler(handler: string, input: unknown): string {
  const inputJson = JSON.stringify(input);

  return `
// User handler code
${handler}

// Execution wrapper
const __input = ${inputJson};

async function __execute() {
  try {
    // Check if handler is defined
    if (typeof handler !== "function") {
      throw new Error("Handler must define a 'handler' function");
    }

    // Call the handler
    const result = await handler(__input.body, __input.context);

    // Output success result
    console.log(JSON.stringify({ success: true, result }));
  } catch (error) {
    // Output error result
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.log(JSON.stringify({
      success: false,
      error: errorMessage,
      stack: errorStack,
    }));
  }
}

__execute();
`;
}

/**
 * Build Deno permission arguments for the subprocess.
 */
function buildPermissionArgs(
  tempFile: string,
  permissions: Permissions
): string[] {
  const args: string[] = ["run", "--no-prompt"];

  // Network permissions - allow specified hosts
  if (permissions.allowNet.length > 0) {
    args.push(`--allow-net=${permissions.allowNet.join(",")}`);
  } else {
    args.push("--deny-net");
  }

  // Environment permissions
  if (permissions.allowEnv.length > 0) {
    args.push(`--allow-env=${permissions.allowEnv.join(",")}`);
  } else {
    args.push("--deny-env");
  }

  // Allow read/write to Deno cache dir for URL import resolution
  const denoDir = Deno.env.get("DENO_DIR") || "/deno-dir";
  args.push(`--allow-read=${denoDir},${tempFile}`);
  args.push(`--allow-write=${denoDir}`);

  // Deny remaining permissions for security
  args.push("--deny-run");
  args.push("--deny-ffi");
  args.push("--deny-sys");

  // Add the temp file path
  args.push(tempFile);

  return args;
}
