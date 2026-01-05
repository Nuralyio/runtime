# Nuraly Stack Makefile

# Minikube configuration
MINIKUBE_MEMORY ?= 4096
MINIKUBE_CPUS ?= 2
MINIKUBE_DRIVER ?= docker
MINIKUBE_K8S_VERSION ?= stable

# Knative version
KNATIVE_VERSION ?= 1.12.0

.PHONY: help init init-dev dev prod stop clean logs shell test build deploy update status
.PHONY: redeploy-studio redeploy-api redeploy-functions redeploy-gateway
.PHONY: minikube-start minikube-stop minikube-delete minikube-status minikube-dashboard
.PHONY: knative-install knative-install-serving knative-install-eventing knative-status knative-uninstall
.PHONY: knative-configure-domain knative-expose-kourier
.PHONY: k8s-init k8s-clean k8s-setup-functions k8s-update-functions-config k8s-refresh

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
	@echo "  make shell      - Open shell in a service (usage: make shell SERVICE=api)"
	@echo "  make test       - Run tests for all services"
	@echo "  make build      - Build all services"
	@echo "  make deploy     - Deploy to production"
	@echo "  make update     - Update git submodules"
	@echo "  make status     - Check submodule status"
	@echo ""
	@echo "Service Redeploy:"
	@echo "  make redeploy-studio    - Pull, rebuild and restart studio"
	@echo "  make redeploy-api       - Pull, rebuild and restart api"
	@echo "  make redeploy-functions - Pull, rebuild and restart functions"
	@echo "  make redeploy-gateway   - Pull, rebuild and restart gateway"
	@echo ""
	@echo "Kubernetes (Minikube):"
	@echo "  make minikube-start     - Start minikube cluster"
	@echo "  make minikube-stop      - Stop minikube cluster"
	@echo "  make minikube-delete    - Delete minikube cluster"
	@echo "  make minikube-status    - Check minikube status"
	@echo "  make minikube-dashboard - Open Kubernetes dashboard"
	@echo ""
	@echo "Knative:"
	@echo "  make knative-install          - Install Knative Serving + Eventing with Kourier"
	@echo "  make knative-install-serving  - Install Knative Serving only"
	@echo "  make knative-install-eventing - Install Knative Eventing only"
	@echo "  make knative-status           - Check Knative component status"
	@echo "  make knative-uninstall        - Remove Knative components"
	@echo ""
	@echo "Combined K8s Setup:"
	@echo "  make k8s-init            - Full setup: minikube + Knative + functions config"
	@echo "  make k8s-clean           - Clean teardown of K8s environment"
	@echo "  make k8s-setup-functions - Setup functions service access to minikube"
	@echo "  make k8s-refresh         - Refresh configs when minikube IP changes"
	@echo ""
	@echo "Knative Configuration:"
	@echo "  make knative-configure-domain   - Configure sslip.io domain for external access"
	@echo "  make knative-expose-kourier     - Expose Kourier via NodePort"
	@echo "  make k8s-update-functions-config - Update functions app config with minikube settings"
	@echo ""

# Initialize submodules
init:
	@echo "Initializing git submodules..."
	@if [ ! -d "services/studio" ]; then \
		echo "Adding submodules for the first time..."; \
		git submodule add https://github.com/Nuralyio/studio.git services/studio || true; \
		git submodule add https://github.com/Nuralyio/api.git services/api || true; \
		git submodule add https://github.com/Nuralyio/functions.git services/functions || true; \
		git submodule add https://github.com/Nuralyio/gateway.git services/gateway || true; \
		git submodule add https://github.com/Nuralyio/docs.git services/docs || true; \
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
	docker compose -f docker-compose.dev.yml up --build

dev-detached:
	@echo "Starting development environment in detached mode..."
	docker compose -f docker-compose.dev.yml up -d --build

# Production environment
prod:
	@echo "Starting production environment..."
	docker compose -f docker-compose.prod.yml --env-file config/prod.env up -d --build

# Stop all services
stop:
	@echo "Stopping all services..."
	docker compose -f docker-compose.dev.yml down
	docker compose -f docker-compose.prod.yml down

# Clean up containers and volumes (keeps images)
clean:
	@echo "Cleaning up containers and volumes..."
	docker compose -f docker-compose.dev.yml down -v --remove-orphans
	docker compose -f docker-compose.prod.yml down -v --remove-orphans
	docker container prune -f
	docker volume prune -f

# View logs
logs:
	docker compose -f docker-compose.dev.yml logs -f

logs-prod:
	docker compose -f docker-compose.prod.yml --env-file config/prod.env logs -f

# Open shell in a service
shell:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Usage: make shell SERVICE=<service-name>"; \
		echo "Available services: studio, api, functions, gateway, docs"; \
	else \
		docker compose -f docker-compose.dev.yml exec $(SERVICE) /bin/sh; \
	fi

# Run tests
test:
	@echo "Running tests for all services..."
	docker compose -f docker-compose.dev.yml exec studio npm test
	docker compose -f docker-compose.dev.yml exec api npm test
	docker compose -f docker-compose.dev.yml exec functions npm test
	docker compose -f docker-compose.dev.yml exec gateway npm test

# Build all services
build:
	@echo "Building all services..."
	docker compose -f docker-compose.dev.yml build

build-prod:
	@echo "Building production images..."
	docker compose -f docker-compose.prod.yml --env-file config/prod.env build

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

# =============================================================================
# Service Redeploy Targets
# =============================================================================

redeploy-studio:
	@cd services/studio && git pull --rebase && cd ../.. && \
	docker compose -f docker-compose.dev.yml build --no-cache studio && \
	docker compose -f docker-compose.dev.yml up -d studio

redeploy-api:
	@cd services/api && git pull --rebase && cd ../.. && \
	docker compose -f docker-compose.dev.yml build --no-cache api && \
	docker compose -f docker-compose.dev.yml up -d api

redeploy-functions:
	@cd services/functions && git pull --rebase && cd ../.. && \
	docker compose -f docker-compose.dev.yml build --no-cache functions && \
	docker compose -f docker-compose.dev.yml up -d functions

redeploy-gateway:
	@cd services/gateway && git pull --rebase && cd ../.. && \
	docker compose -f docker-compose.dev.yml build --no-cache gateway && \
	docker compose -f docker-compose.dev.yml up -d gateway

# Check submodule status
status:
	@echo "Checking submodule status..."
	@git submodule status
	@echo ""
	@echo "Submodule directories:"
	@for dir in services/studio services/api services/functions services/gateway services/docs; do \
		if [ -d "$$dir" ]; then \
			echo "✅ $$dir: exists"; \
		else \
			echo "❌ $$dir: missing"; \
		fi; \
	done

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker compose -f docker-compose.dev.yml exec api npm run migrate

db-reset:
	@echo "Resetting database..."
	docker compose -f docker-compose.dev.yml exec api npm run db:reset

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

# =============================================================================
# Minikube Targets
# =============================================================================

minikube-start:
	@echo "Starting minikube cluster..."
	@echo "  Memory: $(MINIKUBE_MEMORY)MB"
	@echo "  CPUs: $(MINIKUBE_CPUS)"
	@echo "  Driver: $(MINIKUBE_DRIVER)"
	@minikube start \
		--memory=$(MINIKUBE_MEMORY) \
		--cpus=$(MINIKUBE_CPUS) \
		--driver=$(MINIKUBE_DRIVER) \
		--kubernetes-version=$(MINIKUBE_K8S_VERSION)
	@echo "✅ Minikube cluster started!"
	@echo "Run 'make minikube-status' to verify"

minikube-stop:
	@echo "Stopping minikube cluster..."
	@minikube stop
	@echo "✅ Minikube cluster stopped"

minikube-delete:
	@echo "Deleting minikube cluster..."
	@minikube delete
	@echo "✅ Minikube cluster deleted"

minikube-status:
	@echo "Minikube Status:"
	@minikube status || true
	@echo ""
	@echo "Kubectl cluster info:"
	@kubectl cluster-info || true

minikube-dashboard:
	@echo "Opening Kubernetes dashboard..."
	@minikube dashboard

# =============================================================================
# Knative Targets
# =============================================================================

knative-install-serving:
	@echo "Installing Knative Serving v$(KNATIVE_VERSION)..."
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v$(KNATIVE_VERSION)/serving-crds.yaml
	@kubectl apply -f https://github.com/knative/serving/releases/download/knative-v$(KNATIVE_VERSION)/serving-core.yaml
	@echo "Installing Kourier networking layer..."
	@kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v$(KNATIVE_VERSION)/kourier.yaml
	@echo "Configuring Kourier as default ingress..."
	@kubectl patch configmap/config-network \
		--namespace knative-serving \
		--type merge \
		--patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'
	@echo "Waiting for Knative Serving to be ready..."
	@kubectl wait --for=condition=Ready pods --all -n knative-serving --timeout=300s || true
	@echo "✅ Knative Serving installed with Kourier!"

knative-install-eventing:
	@echo "Installing Knative Eventing v$(KNATIVE_VERSION)..."
	@kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/eventing-crds.yaml
	@kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/eventing-core.yaml
	@echo "Installing in-memory channel..."
	@kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/in-memory-channel.yaml
	@echo "Installing MT-Channel-based broker..."
	@kubectl apply -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/mt-channel-broker.yaml
	@echo "Waiting for Knative Eventing to be ready..."
	@kubectl wait --for=condition=Ready pods --all -n knative-eventing --timeout=300s || true
	@echo "✅ Knative Eventing installed!"

knative-install: knative-install-serving knative-install-eventing
	@echo ""
	@echo "✅ Knative Serving + Eventing installed successfully!"
	@echo "Run 'make knative-status' to verify"

knative-status:
	@echo "=== Knative Serving Status ==="
	@kubectl get pods -n knative-serving 2>/dev/null || echo "Knative Serving not installed"
	@echo ""
	@echo "=== Knative Eventing Status ==="
	@kubectl get pods -n knative-eventing 2>/dev/null || echo "Knative Eventing not installed"
	@echo ""
	@echo "=== Kourier Status ==="
	@kubectl get pods -n kourier-system 2>/dev/null || echo "Kourier not installed"
	@echo ""
	@echo "=== Kourier External IP ==="
	@kubectl get svc kourier -n kourier-system 2>/dev/null || echo "Kourier service not found"

knative-uninstall:
	@echo "Uninstalling Knative components..."
	@kubectl delete -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/mt-channel-broker.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/in-memory-channel.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/eventing-core.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/eventing/releases/download/knative-v$(KNATIVE_VERSION)/eventing-crds.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/net-kourier/releases/download/knative-v$(KNATIVE_VERSION)/kourier.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/serving/releases/download/knative-v$(KNATIVE_VERSION)/serving-core.yaml 2>/dev/null || true
	@kubectl delete -f https://github.com/knative/serving/releases/download/knative-v$(KNATIVE_VERSION)/serving-crds.yaml 2>/dev/null || true
	@echo "✅ Knative uninstalled"

# Configure Knative domain for external access using sslip.io
knative-configure-domain:
	@echo "Configuring Knative domain for external access..."
	@MINIKUBE_IP=$$(minikube ip) && \
	kubectl patch configmap/config-domain \
		--namespace knative-serving \
		--type merge \
		--patch "{\"data\":{\"$$MINIKUBE_IP.sslip.io\":\"\",\"sslip.io\":\"\"}}"
	@echo "✅ Knative domain configured with sslip.io"
	@echo "Functions will be accessible at: <function-name>.<namespace>.<minikube-ip>.sslip.io"

# Expose Kourier via NodePort for external access from Docker containers
knative-expose-kourier:
	@echo "Exposing Kourier via NodePort..."
	@kubectl patch svc kourier -n kourier-system \
		--type='json' \
		-p='[{"op": "replace", "path": "/spec/type", "value": "NodePort"}, {"op": "add", "path": "/spec/ports/0/nodePort", "value": 32437}]' 2>/dev/null || \
	kubectl patch svc kourier -n kourier-system \
		--type='json' \
		-p='[{"op": "replace", "path": "/spec/type", "value": "NodePort"}]'
	@echo "✅ Kourier exposed via NodePort"
	@echo "Kourier NodePort:"
	@kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}'
	@echo ""

# =============================================================================
# Functions Service K8s Integration
# =============================================================================

# Generate kubeconfig for functions service to access minikube
k8s-setup-functions:
	@echo "Setting up functions service access to minikube..."
	@mkdir -p services/functions/.kube
	@MINIKUBE_IP=$$(minikube ip) && \
	MINIKUBE_CA=$$(cat ~/.minikube/ca.crt | base64 | tr -d '\n') && \
	MINIKUBE_CERT=$$(cat ~/.minikube/profiles/minikube/client.crt | base64 | tr -d '\n') && \
	MINIKUBE_KEY=$$(cat ~/.minikube/profiles/minikube/client.key | base64 | tr -d '\n') && \
	echo "apiVersion: v1" > services/functions/.kube/config && \
	echo "kind: Config" >> services/functions/.kube/config && \
	echo "clusters:" >> services/functions/.kube/config && \
	echo "- cluster:" >> services/functions/.kube/config && \
	echo "    certificate-authority-data: $$MINIKUBE_CA" >> services/functions/.kube/config && \
	echo "    server: https://$$MINIKUBE_IP:8443" >> services/functions/.kube/config && \
	echo "  name: minikube" >> services/functions/.kube/config && \
	echo "contexts:" >> services/functions/.kube/config && \
	echo "- context:" >> services/functions/.kube/config && \
	echo "    cluster: minikube" >> services/functions/.kube/config && \
	echo "    user: minikube" >> services/functions/.kube/config && \
	echo "  name: minikube" >> services/functions/.kube/config && \
	echo "current-context: minikube" >> services/functions/.kube/config && \
	echo "users:" >> services/functions/.kube/config && \
	echo "- name: minikube" >> services/functions/.kube/config && \
	echo "  user:" >> services/functions/.kube/config && \
	echo "    client-certificate-data: $$MINIKUBE_CERT" >> services/functions/.kube/config && \
	echo "    client-key-data: $$MINIKUBE_KEY" >> services/functions/.kube/config
	@echo "✅ Kubeconfig generated at services/functions/.kube/config"
	@echo ""
	@echo "Ensuring minikube Docker network exists..."
	@docker network inspect minikube >/dev/null 2>&1 || docker network create minikube
	@echo "Connecting minikube container to minikube network..."
	@docker network connect minikube minikube 2>/dev/null || echo "Minikube already connected to network"
	@echo "✅ Functions service can now access minikube"
	@echo ""
	@echo "Minikube IP: $$(minikube ip)"
	@echo "Kourier Port: $$(kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo 'Not exposed yet')"

# Update functions service application.properties with correct minikube settings
k8s-update-functions-config:
	@echo "Updating functions service configuration..."
	@MINIKUBE_IP=$$(minikube ip) && \
	KOURIER_PORT=$$(kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}') && \
	sed -i.bak "s|nuraly-functions.gateway-host=.*|nuraly-functions.gateway-host=$$MINIKUBE_IP|" services/functions/src/main/resources/application.properties && \
	sed -i.bak "s|nuraly-functions.port=.*|nuraly-functions.port=$$KOURIER_PORT|" services/functions/src/main/resources/application.properties && \
	sed -i.bak "s|nuraly-functions.domain=.*|nuraly-functions.domain=default.$$MINIKUBE_IP.sslip.io|" services/functions/src/main/resources/application.properties && \
	rm -f services/functions/src/main/resources/application.properties.bak
	@echo "✅ Functions configuration updated"
	@echo "  Gateway Host: $$(minikube ip)"
	@echo "  Kourier Port: $$(kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}')"
	@echo "  Domain: default.$$(minikube ip).sslip.io"

# Refresh all K8s-related configs when minikube IP changes
k8s-refresh:
	@echo "Refreshing K8s configuration for new minikube IP..."
	@$(MAKE) knative-configure-domain
	@$(MAKE) k8s-setup-functions
	@$(MAKE) k8s-update-functions-config
	@echo ""
	@echo "============================================"
	@echo "✅ K8s configuration refreshed!"
	@echo "============================================"
	@echo ""
	@echo "New Configuration:"
	@echo "  Minikube IP:    $$(minikube ip)"
	@echo "  Kourier Port:   $$(kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}')"
	@echo "  Domain:         default.$$(minikube ip).sslip.io"
	@echo ""
	@echo "IMPORTANT: Restart the functions service to apply changes:"
	@echo "  docker compose -f docker-compose.dev.yml restart functions"
	@echo ""
	@echo "NOTE: Existing deployed functions will need to be redeployed"
	@echo "      as their Knative services use the old domain."

# =============================================================================
# Combined K8s Targets
# =============================================================================

k8s-init: minikube-start
	@echo ""
	@echo "Waiting for minikube to be fully ready..."
	@sleep 10
	@$(MAKE) knative-install
	@echo ""
	@echo "Configuring Knative for external access..."
	@sleep 5
	@$(MAKE) knative-configure-domain
	@$(MAKE) knative-expose-kourier
	@echo ""
	@echo "Setting up functions service integration..."
	@$(MAKE) k8s-setup-functions
	@$(MAKE) k8s-update-functions-config
	@echo ""
	@echo "============================================"
	@echo "✅ Kubernetes environment ready!"
	@echo "============================================"
	@echo ""
	@echo "Configuration Summary:"
	@echo "  Minikube IP:    $$(minikube ip)"
	@echo "  Kourier Port:   $$(kubectl get svc kourier -n kourier-system -o jsonpath='{.spec.ports[0].nodePort}')"
	@echo "  Domain:         default.sslip.io"
	@echo ""
	@echo "Useful commands:"
	@echo "  make minikube-status    - Check cluster status"
	@echo "  make knative-status     - Check Knative status"
	@echo "  make minikube-dashboard - Open K8s dashboard"
	@echo "  make dev                - Start dev environment (functions will connect to minikube)"
	@echo ""

k8s-clean: knative-uninstall minikube-delete
	@echo "Cleaning up functions kubeconfig..."
	@rm -rf services/functions/.kube
	@echo "✅ Kubernetes environment cleaned up"