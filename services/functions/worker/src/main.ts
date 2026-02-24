/**
 * Deno Worker Service - Entry Point
 *
 * Consumes function execution requests from RabbitMQ,
 * executes them in isolated Deno subprocesses, and
 * publishes results back to the results queue.
 */

import {
  connectToRabbitMQ,
  publishMessage,
  setupShutdownHandler,
} from "./queue.ts";
import { executeIsolated } from "./executor.ts";
import {
  type ExecuteMessage,
  type ExecutionResult,
  type WorkerConfig,
  DEFAULT_CONFIG,
} from "./types.ts";

/**
 * Load configuration from environment variables
 */
function loadConfig(): WorkerConfig {
  const defaults = DEFAULT_CONFIG;

  return {
    rabbitmqUrl: Deno.env.get("RABBITMQ_URL") || defaults.rabbitmqUrl,
    executeQueue: Deno.env.get("EXECUTE_QUEUE") || defaults.executeQueue,
    resultsQueue: Deno.env.get("RESULTS_QUEUE") || defaults.resultsQueue,
    dlqQueue: Deno.env.get("DLQ_QUEUE") || defaults.dlqQueue,
    prefetchCount: parseInt(
      Deno.env.get("PREFETCH_COUNT") || String(defaults.prefetchCount)
    ),
    defaultTimeout: parseInt(
      Deno.env.get("DEFAULT_TIMEOUT") || String(defaults.defaultTimeout)
    ),
    defaultAllowedHosts: Deno.env.get("ALLOWED_HOSTS")
      ?.split(",")
      .map((h) => h.trim()) || defaults.defaultAllowedHosts,
  };
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log("Deno Worker Service starting...");

  const config = loadConfig();
  console.log("Configuration:", {
    executeQueue: config.executeQueue,
    resultsQueue: config.resultsQueue,
    prefetchCount: config.prefetchCount,
    defaultTimeout: config.defaultTimeout,
  });

  // Connect to RabbitMQ with retry
  const { connection, channel } = await connectToRabbitMQ(config);

  // Set up graceful shutdown
  let isShuttingDown = false;
  setupShutdownHandler(connection, () => {
    isShuttingDown = true;
  });

  console.log(
    `Worker started, consuming from queue: ${config.executeQueue}`
  );

  // Consume execution requests
  await channel.consume(
    { queue: config.executeQueue },
    async (args, props, data) => {
      if (isShuttingDown) {
        // Requeue message if shutting down
        await channel.nack({ deliveryTag: args.deliveryTag, requeue: true });
        return;
      }

      const startTime = Date.now();
      let message: ExecuteMessage;

      try {
        // Parse message
        const messageText = new TextDecoder().decode(data);
        message = JSON.parse(messageText) as ExecuteMessage;

        console.log(
          `Received execution request: functionId=${message.functionId}, correlationId=${message.correlationId}`
        );
      } catch (error) {
        console.error("Failed to parse message:", error);
        // Reject malformed messages (send to DLQ)
        await channel.nack({ deliveryTag: args.deliveryTag, requeue: false });
        return;
      }

      try {
        // Build permissions - merge defaults with message permissions
        const permissions = {
          allowNet: message.permissions?.allowNet?.length
            ? message.permissions.allowNet
            : config.defaultAllowedHosts,
          allowEnv: message.permissions?.allowEnv || [],
        };

        // Execute in isolated subprocess
        const result = await executeIsolated(
          message.handler,
          message.input,
          permissions,
          message.timeout || config.defaultTimeout
        );

        const executionTime = Date.now() - startTime;

        // Build response
        const response: ExecutionResult = {
          correlationId: message.correlationId,
          success: result.success,
          result: result.result,
          error: result.error || null,
          stack: result.stack,
          executionTime,
        };

        // Publish result
        await publishMessage(
          channel,
          config.resultsQueue,
          response,
          message.correlationId
        );

        console.log(
          `Execution completed: functionId=${message.functionId}, success=${result.success}, time=${executionTime}ms`
        );

        // Acknowledge message
        await channel.ack({ deliveryTag: args.deliveryTag });
      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(
          `Execution failed: functionId=${message.functionId}, error=${error}`
        );

        // Try to publish error result
        try {
          const errorResponse: ExecutionResult = {
            correlationId: message.correlationId,
            success: false,
            result: null,
            error:
              error instanceof Error ? error.message : "Internal worker error",
            stack: error instanceof Error ? error.stack : undefined,
            executionTime,
          };

          await publishMessage(
            channel,
            config.resultsQueue,
            errorResponse,
            message.correlationId
          );
        } catch (publishError) {
          console.error("Failed to publish error result:", publishError);
        }

        // Nack without requeue (send to DLQ)
        await channel.nack({ deliveryTag: args.deliveryTag, requeue: false });
      }
    }
  );

  // Keep the process running
  console.log("Worker is running. Press Ctrl+C to stop.");
  await new Promise(() => {}); // Block forever
}

// Run main
main().catch((error) => {
  console.error("Fatal error:", error);
  Deno.exit(1);
});
