#!/bin/bash

# View logs for production container

CONTAINER_NAME="nuraly-docs-prod"

if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Viewing logs for $CONTAINER_NAME (Ctrl+C to exit)..."
    docker logs -f $CONTAINER_NAME
else
    echo "Error: Container $CONTAINER_NAME is not running"
    exit 1
fi
