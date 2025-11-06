# Initialize Nuraly Stack on Windows
# Usage: .\scripts\windows\init.ps1

Write-Host "🚀 Initializing Nuraly Stack..." -ForegroundColor Cyan

Write-Host "📥 Initializing git submodules..." -ForegroundColor Green
try {
    git submodule update --init --recursive
    if ($LASTEXITCODE -ne 0) {
        throw "Git submodule initialization failed"
    }
    Write-Host "✅ Submodules initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to initialize submodules: $_" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Copying environment files..." -ForegroundColor Green
if (!(Test-Path "config\dev.env")) { 
    Copy-Item "config\dev.env.example" "config\dev.env" 
    Write-Host "✅ Created config\dev.env" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  config\dev.env already exists" -ForegroundColor Blue
}

if (!(Test-Path "config\prod.env")) { 
    Copy-Item "config\prod.env.example" "config\prod.env" 
    Write-Host "✅ Created config\prod.env" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  config\prod.env already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎉 Project initialized successfully!" -ForegroundColor Green
Write-Host "📝 Please update config\dev.env and config\prod.env with your settings." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  .\scripts\windows\dev.ps1     # Start development environment" -ForegroundColor White
Write-Host "  .\scripts\windows\prod.ps1    # Start production environment" -ForegroundColor White