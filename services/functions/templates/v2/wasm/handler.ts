/**
 * WASM Function Template
 *
 * Write your handler function - no server needed!
 *
 * Network: External APIs allowed, localhost blocked (security)
 */

interface Context {
    functionId: string;
    functionName: string;
    invocationId: string;
}

export async function handler(input: any, context: Context) {
    return {
        message: `Hello from ${context.functionName}!`,
        input: input
    };
}
