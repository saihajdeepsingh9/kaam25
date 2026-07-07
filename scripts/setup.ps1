#Requires -Version 5.1
<#
  .SYNOPSIS
  Checks prerequisites and installs dependencies for Kaam 25.
  Run from the repo root: .\scripts\setup.ps1
#>

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "Checking prerequisites..." -ForegroundColor Cyan

if (-not (Test-Command "node")) {
    Write-Host "  Node.js not found. Install from https://nodejs.org (v20+)." -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $(node -v)" -ForegroundColor Green

if (-not (Test-Command "pnpm")) {
    Write-Host "  pnpm not found - enabling via Corepack..." -ForegroundColor Yellow
    corepack enable
    corepack prepare pnpm@9 --activate
}
Write-Host "  pnpm: $(pnpm -v)" -ForegroundColor Green

if (-not (Test-Command "docker")) {
    Write-Host "  Docker not found. Install Docker Desktop to run Postgres locally." -ForegroundColor Yellow
} else {
    Write-Host "  Docker: $(docker -v)" -ForegroundColor Green
}

if (-not (Test-Command "cargo")) {
    Write-Host "  Rust not found. Only required if you're working on apps/desktop." -ForegroundColor Yellow
    Write-Host "  See docs/setup.md for install instructions." -ForegroundColor Yellow
} else {
    Write-Host "  Rust: $(cargo -V)" -ForegroundColor Green
}

Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "`nSetting up env files (skipped if they already exist)..." -ForegroundColor Cyan
if (-not (Test-Path "apps/web/.env.local")) {
    Copy-Item "apps/web/.env.example" "apps/web/.env.local"
    Write-Host "  Created apps/web/.env.local" -ForegroundColor Green
}
if (-not (Test-Path "apps/server/.env")) {
    Copy-Item "apps/server/.env.example" "apps/server/.env"
    Write-Host "  Created apps/server/.env" -ForegroundColor Green
}

Write-Host "`nDone. Next: docker compose up -d, then pnpm dev. See docs/setup.md." -ForegroundColor Cyan
