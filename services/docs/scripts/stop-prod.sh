#!/bin/bash

# Stop production container for Nuraly Documentation

set -e

CONTAINER_NAME="nuraly-docs-prod"

echo "Stopping $CONTAINER_NAME..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

echo "✓ Container stopped and removed"
