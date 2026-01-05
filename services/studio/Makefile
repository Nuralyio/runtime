# Studio Service Makefile

# Docker Compose settings
COMPOSE_FILE := docker-compose.yml
CONTAINER_NAME := veeapp-frontends
IMAGE_NAME := nuraly/frontend

.PHONY: help pull build rebuild deploy redeploy dev start stop restart logs shell clean status

# Default target
help:
	@echo "Studio Service - Available commands:"
	@echo ""
	@echo "  make pull      - Pull latest changes from git"
	@echo "  make build     - Build Docker image"
	@echo "  make rebuild   - Force rebuild Docker image (no cache)"
	@echo "  make deploy    - Build and start the service"
	@echo "  make redeploy  - Pull, rebuild and restart the service"
	@echo ""
	@echo "  make dev       - Start development environment"
	@echo "  make start     - Start the service (detached)"
	@echo "  make stop      - Stop the service"
	@echo "  make restart   - Restart the service"
	@echo ""
	@echo "  make logs      - View service logs"
	@echo "  make shell     - Open shell in container"
	@echo "  make status    - Show container status"
	@echo "  make clean     - Remove containers and volumes"
	@echo ""

# Pull latest changes from git
pull:
	@echo "Pulling latest changes..."
	git pull --rebase
	@echo "Pull complete!"

# Build Docker image using docker-compose
build:
	@echo "Building Docker image..."
	docker-compose -f $(COMPOSE_FILE) build
	@echo "Build complete!"

# Force rebuild without cache
rebuild:
	@echo "Rebuilding Docker image (no cache)..."
	docker-compose -f $(COMPOSE_FILE) build --no-cache
	@echo "Rebuild complete!"

# Build standalone image (using build-image.sh)
build-image:
	@echo "Building standalone Docker image..."
	docker build . -t $(IMAGE_NAME)
	@echo "Build complete!"

# Deploy: build and start
deploy: build start
	@echo "Deploy complete!"

# Redeploy: pull, rebuild and restart
redeploy: pull rebuild restart
	@echo "Redeploy complete!"

# Start development environment (attached)
dev:
	@echo "Starting development environment..."
	docker-compose -f $(COMPOSE_FILE) up --build

# Start service (detached)
start:
	@echo "Starting service..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "Service started!"

# Stop service
stop:
	@echo "Stopping service..."
	docker-compose -f $(COMPOSE_FILE) down
	@echo "Service stopped!"

# Restart service
restart:
	@echo "Restarting service..."
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "Service restarted!"

# View logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

# Open shell in container
shell:
	docker-compose -f $(COMPOSE_FILE) exec $(CONTAINER_NAME) /bin/sh

# Show container status
status:
	@echo "Container status:"
	@docker-compose -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "Docker image:"
	@docker images | grep -E "$(IMAGE_NAME)|veeapp" || echo "No images found"

# Clean up containers and volumes
clean:
	@echo "Cleaning up..."
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@echo "Cleanup complete!"

# Quick redeploy (without pulling - useful for local changes)
quick-redeploy: rebuild restart
	@echo "Quick redeploy complete!"
