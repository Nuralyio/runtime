#!/bin/bash

# Production Docker run script for Nuraly Documentation
# Runs the documentation site on port 6009

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CONTAINER_NAME="nuraly-docs-prod"
IMAGE_NAME="nuraly-docs:prod"
PORT="6009"

echo -e "${BLUE}=== Nuraly Documentation - Production Runner ===${NC}"
echo ""

# Check if container is already running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo -e "${YELLOW}Container is already running. Stopping it first...${NC}"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check if old container exists (stopped)
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo -e "${YELLOW}Removing old container...${NC}"
    docker rm $CONTAINER_NAME
fi

# Build the Docker image
echo -e "${BLUE}Building Docker image...${NC}"
docker build -t $IMAGE_NAME -f Dockerfile .

# Run the container
echo -e "${BLUE}Starting container on port $PORT...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:80 \
  -e NODE_ENV=production \
  $IMAGE_NAME

echo ""
echo -e "${GREEN}✓ Documentation site is now running!${NC}"
echo -e "${GREEN}✓ Access it at: http://localhost:$PORT${NC}"
echo ""
echo "Useful commands:"
echo "  - View logs:    docker logs -f $CONTAINER_NAME"
echo "  - Stop:         docker stop $CONTAINER_NAME"
echo "  - Restart:      docker restart $CONTAINER_NAME"
echo "  - Remove:       docker rm -f $CONTAINER_NAME"
