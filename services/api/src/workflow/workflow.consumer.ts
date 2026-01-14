import amqp, { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'tslog';
import { WorkflowEvent } from './interfaces/workflow.interface';

const logger = new Logger({ name: 'WorkflowConsumer' });

export type WorkflowEventHandler = (event: WorkflowEvent) => void;

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;

export class WorkflowConsumer {
  private connection: AmqpConnection | null = null;
  private channel: Channel | null = null;
  private eventHandler: WorkflowEventHandler | null = null;

  private readonly exchangeName = 'workflows-exchange';
  private readonly queueName = 'api-workflow-events';
  private readonly routingKey = 'workflow.event';

  private readonly rabbitMQUrl: string;

  constructor() {
    const host = process.env.RABBITMQ_HOST || 'rabbitmq';
    const port = process.env.RABBITMQ_PORT || '5672';
    const username = process.env.RABBITMQ_USERNAME || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';

    this.rabbitMQUrl = `amqp://${username}:${password}@${host}:${port}`;
  }

  setEventHandler(handler: WorkflowEventHandler): void {
    this.eventHandler = handler;
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to RabbitMQ...');
      const connection = await amqp.connect(this.rabbitMQUrl);
      this.connection = connection;

      connection.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error:', err);
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed, attempting to reconnect...');
        setTimeout(() => this.connect(), 5000);
      });

      const channel = await connection.createChannel();
      this.channel = channel;

      // Declare exchange (should already exist from workflow service)
      await channel.assertExchange(this.exchangeName, 'direct', { durable: true });

      // Declare a queue for this consumer
      await channel.assertQueue(this.queueName, { durable: true });

      // Bind queue to exchange with routing key
      await channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

      // Start consuming
      await channel.consume(this.queueName, (msg: ConsumeMessage | null) => {
        if (msg) {
          this.handleMessage(msg);
          this.channel?.ack(msg);
        }
      });

      logger.info(`Connected to RabbitMQ, consuming from queue: ${this.queueName}`);
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  private handleMessage(msg: ConsumeMessage): void {
    try {
      const content = msg.content.toString();
      const event: WorkflowEvent = JSON.parse(content);

      logger.debug(`Received workflow event: ${event.type} for execution ${event.executionId}`);

      if (this.eventHandler) {
        this.eventHandler(event);
      }
    } catch (error) {
      logger.error('Failed to process message:', error);
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
      logger.info('Disconnected from RabbitMQ');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }
}
