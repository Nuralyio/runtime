import amqp, { Channel } from 'amqplib';
import { Logger } from 'tslog';

const logger = new Logger({ name: 'JournalClient' });

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogMessage {
  timestamp: string;
  service: string;
  type: string;
  level: LogLevel;
  correlationId: string | null;
  data: Record<string, unknown>;
}

export class JournalClient {
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;
  private readonly queueName = 'journal-logs';
  private readonly serviceName = 'api';
  private readonly rabbitMQUrl: string;

  constructor() {
    const host = process.env.RABBITMQ_HOST || 'rabbitmq';
    const port = process.env.RABBITMQ_PORT || '5672';
    const username = process.env.RABBITMQ_USERNAME || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';

    this.rabbitMQUrl = `amqp://${username}:${password}@${host}:${port}`;
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ for journal logging...');
      const connection = await amqp.connect(this.rabbitMQUrl);
      this.connection = connection;

      connection.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error:', err);
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ journal connection closed, attempting to reconnect...');
        this.channel = null;
        this.connection = null;
        setTimeout(() => this.connect(), 5000);
      });

      const channel = await connection.createChannel();
      this.channel = channel;

      await channel.assertQueue(this.queueName, { durable: true });

      logger.info('Journal client connected to RabbitMQ');
    } catch (error) {
      logger.error('Failed to connect journal client to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      logger.info('Journal client disconnected from RabbitMQ');
    } catch (error) {
      logger.error('Error disconnecting journal client:', error);
    }
  }

  log(type: string, level: LogLevel, data: Record<string, unknown>, correlationId?: string): void {
    if (!this.channel) {
      logger.warn('Journal client not connected, skipping log');
      return;
    }

    const message: LogMessage = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      type,
      level,
      correlationId: correlationId || null,
      data,
    };

    try {
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(message)),
        { persistent: true, contentType: 'application/json' },
      );
    } catch (error) {
      logger.warn('Failed to publish journal log:', error);
    }
  }

  info(type: string, data: Record<string, unknown>, correlationId?: string): void {
    this.log(type, 'INFO', data, correlationId);
  }

  warn(type: string, data: Record<string, unknown>, correlationId?: string): void {
    this.log(type, 'WARN', data, correlationId);
  }

  error(type: string, data: Record<string, unknown>, correlationId?: string): void {
    this.log(type, 'ERROR', data, correlationId);
  }

  debug(type: string, data: Record<string, unknown>, correlationId?: string): void {
    this.log(type, 'DEBUG', data, correlationId);
  }

  logHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    userId?: string,
  ): void {
    this.log('http', statusCode >= 400 ? 'ERROR' : 'INFO', {
      method,
      path,
      statusCode,
      durationMs,
      userId: userId || null,
    });
  }
}

// Singleton instance
let instance: JournalClient | null = null;

export function getJournalClient(): JournalClient {
  if (!instance) {
    instance = new JournalClient();
  }
  return instance;
}
