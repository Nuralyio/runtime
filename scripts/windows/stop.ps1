# Stop all services on Windows
# Usage: .\scripts\windows\stop.ps1

Write-Host "⏹️  Stopping all services..." -ForegroundColor Cyan

Write-Host "🛑 Stopping development services..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.dev.yml down
    Write-Host "✅ Development services stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Development services were not running" -ForegroundColor Blue
}

Write-Host "🛑 Stopping production services..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml down
    Write-Host "✅ Production services stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Production services were not running" -ForegroundColor Blue
}

Write-Host "✅ All services stopped successfully!" -ForegroundColor Green