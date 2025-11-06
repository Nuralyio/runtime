# Start production environment on Windows
# Usage: .\scripts\windows\prod.ps1

Write-Host "🚀 Starting production environment..." -ForegroundColor Cyan

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
if (!(Test-Path "config\prod.env")) {
    Write-Host "⚠️  Production environment file not found. Running initialization..." -ForegroundColor Yellow
    .\scripts\windows\init.ps1
}

Write-Host "🏗️  Building and starting production services..." -ForegroundColor Green
try {
    docker-compose -f docker-compose.prod.yml up -d --build
    Write-Host "✅ Production environment started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Services running:" -ForegroundColor Cyan
    docker-compose -f docker-compose.prod.yml ps
} catch {
    Write-Host "❌ Failed to start production environment: $_" -ForegroundColor Red
    Write-Host "💡 Try running: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
    exit 1
}