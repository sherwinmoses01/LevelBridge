# LevelBridge: Automated Ollama & Gemma Setup Script
# Downloads and installs Ollama for Windows, starts the service, and pulls Gemma 2B.

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  LevelBridge: Open-Source AI Setup    " -ForegroundColor Cyan
Write-Host "  Model: Gemma 2B (Google Open Weights)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
$localOllama = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (-not $ollamaCmd -and -not (Test-Path $localOllama)) {
    Write-Host "`n[1/3] Downloading Ollama installer for Windows..." -ForegroundColor Yellow
    $installerPath = "$PSScriptRoot\..\OllamaSetup.exe"
    
    curl.exe -L -# -o $installerPath "https://ollama.com/download/OllamaSetup.exe"
    
    if (Test-Path $installerPath) {
        Write-Host "`n[2/3] Installing Ollama (interactive installer)..." -ForegroundColor Yellow
        Start-Process -FilePath $installerPath -Wait
        Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "Download failed. Please visit https://ollama.com to install manually." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[1/3] Ollama is already installed on this machine! ✔" -ForegroundColor Green
}

# Update PATH for this session if installed in default local location
if (Test-Path "$env:LOCALAPPDATA\Programs\Ollama") {
    $env:PATH += ";$env:LOCALAPPDATA\Programs\Ollama"
}

Write-Host "`n[3/3] Pulling Gemma 2B model..." -ForegroundColor Yellow
Write-Host "Running: ollama pull gemma:2b" -ForegroundColor Cyan

try {
    ollama pull gemma:2b
    Write-Host "`n✔ Gemma 2B installed successfully!" -ForegroundColor Green
    Write-Host "LevelBridge will automatically detect Ollama at http://localhost:11434" -ForegroundColor Green
} catch {
    Write-Host "Could not run ollama command directly. Open a new terminal and run: ollama run gemma:2b" -ForegroundColor Yellow
}
