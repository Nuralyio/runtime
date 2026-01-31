#!/usr/bin/env python3
"""
Crawler Service - Consumes crawl requests from RabbitMQ and processes them.
"""
import asyncio
import json
import logging
import os
import signal
import sys
from datetime import datetime

import aio_pika
from aio_pika import Message, DeliveryMode

from crawler import Crawler
from models import CrawlRequest, CrawlResponse, CrawledPage

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration from environment
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'crawl-requests')
BROWSERLESS_URL = os.getenv('BROWSERLESS_URL', None)  # Optional: for JS rendering

# Graceful shutdown
shutdown_event = asyncio.Event()


def signal_handler():
    logger.info("Received shutdown signal")
    shutdown_event.set()


async def process_message(message: aio_pika.IncomingMessage, crawler: Crawler, channel: aio_pika.Channel):
    """Process a single crawl request message."""
    async with message.process():
        try:
            body = json.loads(message.body.decode())
            logger.info(f"Received crawl request: {body.get('requestId', 'unknown')}")

            # Parse the nested payload
            payload = json.loads(body.get('payload', '{}'))

            # Build crawl request
            request = CrawlRequest(
                request_id=body.get('requestId'),
                urls=payload.get('urls', []),
                max_depth=payload.get('max_depth', 1),
                max_pages=payload.get('max_pages', 10),
                same_domain_only=payload.get('same_domain_only', True),
                render_js=payload.get('render_js', False),
                include_patterns=payload.get('include_patterns'),
                exclude_patterns=payload.get('exclude_patterns'),
                extract_selectors=payload.get('extract_selectors'),
                remove_selectors=payload.get('remove_selectors'),
                workflow_id=body.get('workflowId'),
                user_id=body.get('userId'),
                isolation_key=body.get('isolationKey')
            )

            # Perform crawl
            result = await crawler.crawl(request)

            # Build response
            response = CrawlResponse(
                request_id=request.request_id,
                service_type='crawl',
                success=True,
                payload=json.dumps({
                    'pages': [page.dict() for page in result.pages],
                    'total_pages': result.total_pages,
                    'total_characters': result.total_characters,
                    'errors': result.errors
                }),
                processed_at=datetime.utcnow().isoformat()
            )

            logger.info(f"Crawl completed: {request.request_id}, pages={result.total_pages}")

        except Exception as e:
            logger.error(f"Error processing crawl request: {e}", exc_info=True)
            response = CrawlResponse(
                request_id=body.get('requestId') if 'body' in dir() else None,
                service_type='crawl',
                success=False,
                error_message=str(e),
                processed_at=datetime.utcnow().isoformat()
            )

        # Send reply if replyTo is specified
        reply_to = message.reply_to
        correlation_id = message.correlation_id

        if reply_to:
            try:
                response_body = json.dumps(response.dict()).encode()

                await channel.default_exchange.publish(
                    Message(
                        body=response_body,
                        content_type='application/json',
                        correlation_id=correlation_id,
                        delivery_mode=DeliveryMode.PERSISTENT
                    ),
                    routing_key=reply_to
                )
                logger.info(f"Sent reply to {reply_to}, correlationId={correlation_id}")
            except Exception as e:
                logger.error(f"Failed to send reply: {e}")


async def main():
    """Main entry point."""
    logger.info("Starting Crawler Service...")

    # Setup signal handlers
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)

    # Initialize crawler
    crawler = Crawler(browserless_url=BROWSERLESS_URL)

    # Connect to RabbitMQ
    connection = None
    try:
        connection = await aio_pika.connect_robust(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT,
            login=RABBITMQ_USER,
            password=RABBITMQ_PASS
        )
        logger.info(f"Connected to RabbitMQ at {RABBITMQ_HOST}:{RABBITMQ_PORT}")

        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)  # Process one at a time

        # Declare queue (should already exist, but ensure)
        queue = await channel.declare_queue(RABBITMQ_QUEUE, durable=True)
        logger.info(f"Listening on queue: {RABBITMQ_QUEUE}")

        # Start consuming
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                if shutdown_event.is_set():
                    break
                await process_message(message, crawler, channel)

    except asyncio.CancelledError:
        logger.info("Consumer cancelled")
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
    finally:
        if connection:
            await connection.close()
        await crawler.close()
        logger.info("Crawler Service stopped")


if __name__ == '__main__':
    try:
        import uvloop
        uvloop.install()
    except ImportError:
        pass

    asyncio.run(main())
