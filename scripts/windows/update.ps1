# Update submodules on Windows
# Usage: .\scripts\windows\update.ps1

Write-Host "🔄 Updating git submodules..." -ForegroundColor Cyan

Write-Host "📥 Initializing submodules if they don't exist..." -ForegroundColor Green
try {
    git submodule update --init --recursive
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize submodules"
    }
} catch {
    Write-Host "❌ Failed to initialize submodules: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Updating to latest remote changes..." -ForegroundColor Green
try {
    git submodule update --remote --merge
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to update submodules"
    }
    Write-Host "✅ Submodules updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update submodules: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Submodule status:" -ForegroundColor Cyan
git submodule status