# Nuraly Stack

A multi-service application stack consisting of:
- **Studio**: Frontend application
- **API**: Core backend services
- **Functions**: Serverless functions
- **Gateway**: API Gateway and routing

## Quick Start

### Development (Recommended)
```bash
# 1. Initialize git submodules
make init

# 2. Start all services
make dev-detached

# 3. Initialize development data (Keycloak + Database)
make init-dev
```

**Login**: dev@nuraly.io / dev123

See [Quick Start Guide](./docs/QUICK_START.md) for more details.

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d --build
```

## Project Structure

```
stack/
├── services/
│   ├── studio/          # Frontend submodule
│   ├── api/             # Backend core submodule
│   ├── functions/       # Functions submodule
│   └── gateway/         # Gateway submodule
├── docker/
│   ├── development/     # Development Docker configs
│   └── production/      # Production Docker configs
├── scripts/             # Utility scripts
├── config/              # Environment configurations
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .gitmodules
└── Makefile
```

## Services

### Studio
Frontend application built with modern web technologies.
- **Port**: 3000 (dev), 80 (prod)
- **Repository**: https://github.com/Nuralyio/studio

### API
Core backend services and APIs.
- **Port**: 8000 (dev), 8080 (prod)
- **Repository**: https://github.com/Nuralyio/api

### Functions
Serverless functions and microservices.
- **Port**: 9000 (dev), 9090 (prod)
- **Repository**: https://github.com/Nuralyio/functions

### Gateway
API Gateway, load balancer, and routing (includes Keycloak).
- **Port**: 4000 (dev), 443 (prod)
- **Repository**: https://github.com/Nuralyio/gateway

### Keycloak
Authentication and authorization server.
- **Port**: 8080 (dev)
- **Admin**: http://localhost:8080/auth/admin (admin/admin)

## Documentation

- [Quick Start Guide](./docs/QUICK_START.md) - Get started in 3 commands
- [Development Setup](./docs/DEVELOPMENT_SETUP.md) - Detailed development environment guide

## Environment Variables

Copy the example environment files and modify as needed:

```bash
cp config/dev.env.example config/dev.env
cp config/prod.env.example config/prod.env
```

The development environment includes pre-configured Keycloak settings and a default dev user.

## Development

### Prerequisites
- Docker & Docker Compose
- Git
- Make (see installation options below)

#### Installing Make

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# CentOS/RHEL
sudo yum install make
```

**macOS:**
```bash
# Using Homebrew
brew install make

# Or install Xcode Command Line Tools
xcode-select --install
```

**Windows:**
```powershell
# Option 1: Using Chocolatey (recommended)
choco install make

# Option 2: Using Scoop
scoop install make

# Option 3: Using winget
winget install GnuWin32.Make

# Option 4: WSL2 (recommended for development)
wsl --install
```

### Setup
```bash
# Clone the stack
git clone https://github.com/Nuralyio/stack.git
cd stack

# Initialize submodules
make init

# Start development environment
make dev
```

### Useful Commands

**With Make (Linux/Mac/WSL):**
```bash
make init       # Initialize submodules
make init-dev   # Initialize dev data (Keycloak + Database)
make dev        # Start development environment
make prod       # Start production environment
make stop       # Stop all services
make clean      # Clean up containers and volumes
make logs       # View logs
make shell      # Access service shell (e.g., make shell SERVICE=api)
make status     # Check submodule status
make update     # Update submodules
make db-seed    # Re-seed database
make db-migrate # Run database migrations
```

**Manual Commands (Windows without Make):**
```bash
# Initialize submodules
git submodule update --init --recursive
cp config/dev.env.example config/dev.env
cp config/prod.env.example config/prod.env

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# Stop all services
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# Clean up containers and volumes
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
docker-compose -f docker-compose.prod.yml down -v --remove-orphans

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Access service shell
docker-compose -f docker-compose.dev.yml exec <service-name> /bin/sh

# Update submodules
git submodule update --remote --merge

# Check submodule status
git submodule status
```

### Windows PowerShell Scripts

For Windows users who prefer PowerShell scripts instead of installing Make:

```powershell
# Initialize project
.\scripts\windows\init.ps1

# Start development environment
.\scripts\windows\dev.ps1

# Start production environment  
.\scripts\windows\prod.ps1

# Stop all services
.\scripts\windows\stop.ps1

# Update submodules
.\scripts\windows\update.ps1

# Clean up containers and volumes
.\scripts\windows\clean.ps1
```

## Production Deployment

The production setup includes:
- Nginx reverse proxy
- SSL/TLS termination
- Health checks
- Restart policies
- Volume mounts for persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both dev and prod environments
5. Submit a pull request

## License

GNU General Public License v2.0 or later (GPLv2+)