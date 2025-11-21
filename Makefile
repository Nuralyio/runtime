# Nuraly Stack Makefile

.PHONY: help init init-dev dev prod stop clean logs shell test build deploy update status

# Default target
help:
	@echo "Nuraly Stack - Available commands:"
	@echo ""
	@echo "  make init       - Initialize git submodules"
	@echo "  make init-dev   - Initialize development environment (Keycloak + Database)"
	@echo "  make dev        - Start development environment"
	@echo "  make prod       - Start production environment"
	@echo "  make stop       - Stop all services"
	@echo "  make clean      - Clean up containers and volumes"
	@echo "  make logs       - View logs for all services"
	@echo "  make shell      - Open shell in a service (usage: make shell SERVICE=foundation)"
	@echo "  make test       - Run tests for all services"
	@echo "  make build      - Build all services"
	@echo "  make deploy     - Deploy to production"
	@echo "  make update     - Update git submodules"
	@echo "  make status     - Check submodule status"
	@echo ""

# Initialize submodules
init:
	@echo "Initializing git submodules..."
	@if [ ! -d "services/studio" ]; then \
		echo "Adding submodules for the first time..."; \
		git submodule add https://github.com/Nuralyio/studio.git services/studio || true; \
		git submodule add https://github.com/Nuralyio/foundation.git services/foundation || true; \
		git submodule add https://github.com/Nuralyio/functions.git services/functions || true; \
		git submodule add https://github.com/Nuralyio/gateway.git services/gateway || true; \
	fi
	git submodule update --init --recursive
	@echo "Copying environment files..."
	@if [ ! -f config/dev.env ]; then cp config/dev.env.example config/dev.env; fi
	@if [ ! -f config/prod.env ]; then cp config/prod.env.example config/prod.env; fi
	@echo "✅ Project initialized! Please update config/dev.env and config/prod.env with your settings."

# Initialize development environment
init-dev:
	@echo "Initializing development environment..."
	@chmod +x scripts/init-dev.sh
	@./scripts/init-dev.sh

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-detached:
	@echo "Starting development environment in detached mode..."
	docker-compose -f docker-compose.dev.yml up -d --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d --build

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.prod.yml down

# Clean up containers and volumes
clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker-compose -f docker-compose.prod.yml down -v --remove-orphans
	docker system prune -f

# View logs
logs:
	docker-compose -f docker-compose.dev.yml logs -f

logs-prod:
	docker-compose -f docker-compose.prod.yml logs -f

# Open shell in a service
shell:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Usage: make shell SERVICE=<service-name>"; \
		echo "Available services: studio, foundation, functions, gateway"; \
	else \
		docker-compose -f docker-compose.dev.yml exec $(SERVICE) /bin/sh; \
	fi

# Run tests
test:
	@echo "Running tests for all services..."
	docker-compose -f docker-compose.dev.yml exec studio npm test
	docker-compose -f docker-compose.dev.yml exec foundation npm test
	docker-compose -f docker-compose.dev.yml exec functions npm test
	docker-compose -f docker-compose.dev.yml exec gateway npm test

# Build all services
build:
	@echo "Building all services..."
	docker-compose -f docker-compose.dev.yml build

build-prod:
	@echo "Building production images..."
	docker-compose -f docker-compose.prod.yml build

# Deploy to production
deploy:
	@echo "Deploying to production..."
	./scripts/deploy.sh

# Update submodules
update:
	@echo "Updating git submodules..."
	@echo "Initializing submodules if they don't exist..."
	git submodule update --init --recursive
	@echo "Updating to latest remote changes..."
	git submodule update --remote --merge
	@echo "✅ Submodules updated!"

# Check submodule status
status:
	@echo "Checking submodule status..."
	@git submodule status
	@echo ""
	@echo "Submodule directories:"
	@for dir in services/studio services/foundation services/functions services/gateway; do \
		if [ -d "$$dir" ]; then \
			echo "✅ $$dir: exists"; \
		else \
			echo "❌ $$dir: missing"; \
		fi; \
	done

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker-compose -f docker-compose.dev.yml exec foundation npm run migrate

db-reset:
	@echo "Resetting database..."
	docker-compose -f docker-compose.dev.yml exec foundation npm run db:reset

# Backup operations
backup:
	@echo "Creating backup..."
	./scripts/backup.sh

restore:
	@echo "Restoring from backup..."
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "Usage: make restore BACKUP_FILE=<backup-file>"; \
	else \
		./scripts/restore.sh $(BACKUP_FILE); \
	fi

# SSL certificate generation
ssl-cert:
	@echo "Generating SSL certificates..."
	./scripts/generate-ssl.sh