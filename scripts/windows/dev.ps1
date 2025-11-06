# Start development environment on Windows
# Usage: .\scripts\windows\dev.ps1

Write-Host "🚀 Starting development environment..." -ForegroundColor Cyan

# Check if Docker is running
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker is not running"
    }
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if config files exist
if (!(Test-Path "config\dev.env")) {
    Write-Host "⚠️  Development environment file not found. Running initialization..." -ForegroundColor Yellow
    .\scripts\windows\init.ps1
}

Write-Host "🏗️  Building and starting services..." -ForegroundColor Green
try {
    docker-compose -f docker-compose.dev.yml up --build
} catch {
    Write-Host "❌ Failed to start development environment: $_" -ForegroundColor Red
    Write-Host "💡 Try running: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow
    exit 1
}