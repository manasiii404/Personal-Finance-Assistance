# Automatically detect the WiFi IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "172.*" -or $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "Could not detect LAN IP address. Using localhost." -ForegroundColor Yellow
    npx expo start
    exit
}

Write-Host "Starting Expo with hostname: $ip" -ForegroundColor Green

# Set environment variable for this process
[System.Environment]::SetEnvironmentVariable('REACT_NATIVE_PACKAGER_HOSTNAME', $ip, 'Process')

# Start Expo with LAN mode
npx expo start --lan
