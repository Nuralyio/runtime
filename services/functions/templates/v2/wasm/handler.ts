/**
 * WASM Function Handler Template
 *
 * This function runs directly in the WASM runtime - no server needed!
 * Just export a 'handler' function that takes input and returns output.
 *
 * Benefits over container-based functions:
 * - No HTTP server overhead
 * - <1ms cold start (vs 2-5 seconds with containers)
 * - ~1MB memory (vs 50-100MB with containers)
 * - Stronger security isolation (WASM sandbox)
 */

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

interface Response {
    statusCode?: number;
    body: any;
    headers?: Record<string, string>;
}

/**
 * Main handler function
 * @param input - The request body (parsed JSON)
 * @param context - Execution context with metadata
 * @returns Response object or any JSON-serializable value
 */
export function handler(input: any, context: Context): Response | any {
    // Your function logic here
    return {
        message: `Hello from ${context.functionName}!`,
        input: input
    };
}
