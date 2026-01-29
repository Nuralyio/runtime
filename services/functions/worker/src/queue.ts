/**
 * RabbitMQ queue connection and helpers
 */

import { connect } from "amqp";
import type { AmqpConnection, AmqpChannel } from "https://deno.land/x/amqp@v0.24.0/mod.ts";
import type { WorkerConfig } from "./types.ts";

export interface QueueConnection {
  connection: AmqpConnection;
  channel: AmqpChannel;
}

/**
 * Connect to RabbitMQ with retry logic
 */
export async function connectToRabbitMQ(
  config: WorkerConfig,
  maxRetries = 10,
  retryDelayMs = 5000
): Promise<QueueConnection> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Connecting to RabbitMQ (attempt ${attempt}/${maxRetries})...`
      );
      const connection = await connect(config.rabbitmqUrl);
      const channel = await connection.openChannel();

      // Set prefetch for fair dispatch
      await channel.qos({ prefetchCount: config.prefetchCount });

      // Declare queues
      await declareQueues(channel, config);

      console.log("Connected to RabbitMQ successfully");
      return { connection, channel };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `Failed to connect to RabbitMQ (attempt ${attempt}/${maxRetries}):`,
        lastError.message
      );

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelayMs / 1000} seconds...`);
        await delay(retryDelayMs);
      }
    }
  }

  throw new Error(
    `Failed to connect to RabbitMQ after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Declare required queues
 */
async function declareQueues(
  channel: AmqpChannel,
  config: WorkerConfig
): Promise<void> {
  // Declare execute queue (durable)
  await channel.declareQueue({
    queue: config.executeQueue,
    durable: true,
    arguments: {
      // Send to DLQ on rejection
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": config.dlqQueue,
    },
  });

  // Declare results queue (durable)
  await channel.declareQueue({
    queue: config.resultsQueue,
    durable: true,
  });

  // Declare dead letter queue (durable)
  await channel.declareQueue({
    queue: config.dlqQueue,
    durable: true,
  });

  console.log(
    `Declared queues: ${config.executeQueue}, ${config.resultsQueue}, ${config.dlqQueue}`
  );
}

/**
 * Publish a message to a queue
 */
export async function publishMessage(
  channel: AmqpChannel,
  queue: string,
  message: unknown,
  correlationId?: string
): Promise<void> {
  const body = new TextEncoder().encode(JSON.stringify(message));

  await channel.publish(
    { routingKey: queue },
    {
      contentType: "application/json",
      correlationId,
      deliveryMode: 2, // Persistent
    },
    body
  );
}

/**
 * Simple delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Graceful shutdown handler
 */
export function setupShutdownHandler(
  connection: AmqpConnection,
  onShutdown?: () => void
): void {
  const shutdown = async () => {
    console.log("\nShutting down gracefully...");

    if (onShutdown) {
      onShutdown();
    }

    try {
      await connection.close();
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Error closing connection:", error);
    }

    Deno.exit(0);
  };

  // Handle SIGINT and SIGTERM
  Deno.addSignalListener("SIGINT", shutdown);
  Deno.addSignalListener("SIGTERM", shutdown);
}
