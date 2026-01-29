/**
 * Shared types for Deno worker service
 */

/**
 * Permissions for subprocess execution
 */
export interface Permissions {
  /** Allowed network hosts for URL imports */
  allowNet: string[];
  /** Allowed environment variables (empty = none) */
  allowEnv: string[];
}

/**
 * Message received from RabbitMQ functions.execute queue
 */
export interface ExecuteMessage {
  /** Unique correlation ID for matching results */
  correlationId: string;
  /** Function UUID */
  functionId: string;
  /** Invocation UUID */
  invocationId: string;
  /** The JavaScript/TypeScript handler code */
  handler: string;
  /** Input data for the function */
  input: {
    body: unknown;
    context: {
      functionId: string;
      functionName: string;
      invocationId: string;
    };
  };
  /** Execution timeout in milliseconds */
  timeout: number;
  /** Deno permissions for the subprocess */
  permissions: Permissions;
}

/**
 * Result published to RabbitMQ functions.results queue
 */
export interface ExecutionResult {
  /** Correlation ID matching the original request */
  correlationId: string;
  /** Whether execution succeeded */
  success: boolean;
  /** Result value if successful */
  result: unknown;
  /** Error message if failed */
  error: string | null;
  /** Stack trace if failed */
  stack?: string;
  /** Execution time in milliseconds */
  executionTime: number;
}

/**
 * Internal result from subprocess execution
 */
export interface SubprocessResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stack?: string;
}

/**
 * Configuration for the worker
 */
export interface WorkerConfig {
  rabbitmqUrl: string;
  executeQueue: string;
  resultsQueue: string;
  dlqQueue: string;
  prefetchCount: number;
  defaultTimeout: number;
  defaultAllowedHosts: string[];
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: WorkerConfig = {
  rabbitmqUrl: "amqp://guest:guest@localhost:5672",
  executeQueue: "functions.execute",
  resultsQueue: "functions.results",
  dlqQueue: "functions.dlq",
  prefetchCount: 5,
  defaultTimeout: 30000,
  defaultAllowedHosts: [
    "esm.sh",
    "cdn.jsdelivr.net",
    "cdn.skypack.dev",
    "unpkg.com",
    "esm.run",
  ],
};
