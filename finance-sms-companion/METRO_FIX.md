# Metro Bundler Configuration Fix

## Issue
Metro bundler shows "waiting on localhost:8081" even when using `--lan` flag, causing QR codes to point to localhost instead of the LAN IP address.

## Solution

### Step 1: Clear Expo Cache
```bash
cd finance-sms-companion
npx expo start --clear
```

### Step 2: Verify Network Configuration
Make sure your PC and Android device are on the same WiFi network.

Current PC IP: `172.28.132.56`

### Step 3: Manual URL Entry (Alternative)
If the QR code still doesn't work, you can manually enter the URL in Expo Go:

1. Open Expo Go on your Android device
2. Tap "Enter URL manually"
3. Enter: `exp://172.28.132.56:8081`

### Step 4: Check Firewall
Ensure Windows Firewall allows connections on port 8081:
```powershell
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
```

## Verification
After starting the server with `npm start`, the QR code should contain your LAN IP (172.28.132.56) instead of localhost.

The console message "Metro waiting on http://localhost:8081" is just for local reference - the actual QR code should use the LAN IP when using `--lan` flag.
