# Clean up containers and volumes on Windows
# Usage: .\scripts\windows\clean.ps1

Write-Host "🧹 Cleaning up containers and volumes..." -ForegroundColor Cyan

Write-Host "🛑 Stopping and removing development containers..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    Write-Host "✅ Development containers cleaned" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No development containers to clean" -ForegroundColor Blue
}

Write-Host "🛑 Stopping and removing production containers..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans
    Write-Host "✅ Production containers cleaned" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No production containers to clean" -ForegroundColor Blue
}

Write-Host "🗑️  Pruning Docker system..." -ForegroundColor Yellow
try {
    docker system prune -f
    Write-Host "✅ Docker system pruned" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Failed to prune Docker system" -ForegroundColor Yellow
}

Write-Host "✅ Cleanup completed!" -ForegroundColor Green