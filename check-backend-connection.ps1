# Network Connectivity Diagnostic Script
# Run this to check if your backend is accessible

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Backend Network Connectivity Check" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get LAN IP
$lanIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "172.*" -or $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}).IPAddress

Write-Host "Your LAN IP: $lanIP`n" -ForegroundColor Green

# Check if port 3000 is listening
Write-Host "Checking if port 3000 is listening..." -ForegroundColor Yellow
$listening = netstat -ano | findstr ":3000"
if ($listening) {
    Write-Host "✅ Port 3000 is LISTENING`n" -ForegroundColor Green
    Write-Host $listening
} else {
    Write-Host "❌ Port 3000 is NOT listening" -ForegroundColor Red
    Write-Host "   Please start the backend server with: npm run dev`n" -ForegroundColor Yellow
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Test localhost connection
Write-Host "Testing localhost connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Localhost connection: SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Localhost connection: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test LAN IP connection
Write-Host "Testing LAN IP connection ($lanIP)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${lanIP}:3000/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ LAN IP connection: SUCCESS" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)`n" -ForegroundColor Green
} catch {
    Write-Host "❌ LAN IP connection: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   This is likely a FIREWALL issue!" -ForegroundColor Yellow
    Write-Host "   Solution: Add a firewall rule for port 3000`n" -ForegroundColor Yellow
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Check firewall rules
Write-Host "Checking existing firewall rules for port 3000..." -ForegroundColor Yellow
$firewallRules = Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3000*" -or $_.DisplayName -like "*Backend*"}
if ($firewallRules) {
    Write-Host "✅ Found firewall rules:`n" -ForegroundColor Green
    $firewallRules | Select-Object DisplayName, Enabled, Direction, Action | Format-Table
} else {
    Write-Host "❌ No firewall rules found for port 3000`n" -ForegroundColor Red
}

Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Recommendations:" -ForegroundColor Cyan
Write-Host "1. If LAN IP connection failed, run PowerShell as Administrator" -ForegroundColor White
Write-Host "2. Execute: New-NetFirewallRule -DisplayName 'Backend API Port 3000' -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow" -ForegroundColor White
Write-Host "3. Re-run this script to verify the fix`n" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
