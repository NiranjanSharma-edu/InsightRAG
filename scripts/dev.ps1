# InsightRAG Development Environment Startup Script for PowerShell
# Usage: .\scripts\dev.ps1 [-Build]

param (
    [switch]$Build
)

# Set working directory to the root of the project
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot\..

# Ensure local .env exists to prevent startup failures
if (-not (Test-Path ".env")) {
    Write-Host "[Info] Local .env file not found. Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Construct docker compose dev command
$cmd = "docker compose -f docker-compose.dev.yml up"
if ($Build) {
    Write-Host "[Info] Rebuilding development container images..." -ForegroundColor Cyan
    $cmd += " --build"
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Starting InsightRAG Development Environment..." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "• Frontend will be accessible at: http://localhost:3000" -ForegroundColor Green
Write-Host "• Backend docs will be accessible at: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

Invoke-Expression $cmd
