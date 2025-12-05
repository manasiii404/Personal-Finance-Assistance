# SMS Companion App - Network Configuration Fixed

## Problem
The QR code was generating `localhost` URLs which don't work when scanning from a mobile device using Expo Go.

## Solution
I've updated the system to dynamically configure the backend URL based on your network IP address.

## Changes Made

### 1. **Mobile App (finance-sms-companion/App.js)**
- Updated hardcoded IP from `192.168.114.211` to `172.28.132.56` (your current IP)
- Modified QR code scanning to save the `backendUrl` from the QR code
- Updated all API calls to use the stored `backendUrl` from AsyncStorage
- Background task now also uses the dynamic backend URL

### 2. **Frontend (src/components/SMSSetupModal.tsx)**
- Updated QR code generation to include the `backendUrl` field
- The QR code now contains: `{ token, userId, backendUrl, timestamp }`

### 3. **Backend (backend/src/server.ts)**
- Updated CORS to accept connections from any origin in development mode
- Changed server to listen on `0.0.0.0` (all network interfaces) instead of just localhost
- This allows mobile devices on your local network to connect

## How to Use

### Step 1: Set the Frontend Environment Variable
Create a file `.env` in the root directory with:
```
VITE_API_URL=http://172.28.132.56:3000/api
```

### Step 2: Restart the Servers
The backend needs to be restarted to listen on all network interfaces:
1. Stop the backend server (Ctrl+C in the terminal)
2. Restart it with `npm run dev`

The frontend also needs to be restarted to pick up the new environment variable:
1. Stop the frontend server (Ctrl+C in the terminal)
2. Restart it with `npm run dev`

### Step 3: Restart Expo
The mobile app needs to reload with the new code:
1. Stop the Expo server (Ctrl+C in the terminal)
2. Restart it with `npm start`

### Step 4: Test the QR Code
1. Open your web app in the browser
2. Go to the SMS setup modal
3. The QR code should now contain the network IP address
4. Scan it with the Expo Go app
5. The mobile app will automatically configure itself with the correct backend URL

## Important Notes

### IP Address Changes
If your computer's IP address changes (e.g., you connect to a different network), you need to:
1. Update the `.env` file with the new IP
2. Update `App.js` line 10 with the new IP (fallback)
3. Restart all servers

### Finding Your IP Address
Run this command in PowerShell:
```powershell
ipconfig | findstr IPv4
```

### Network Requirements
- Your computer and phone must be on the same WiFi network
- Make sure your firewall allows connections on port 3000
- Some corporate/university networks may block this

## Testing
1. After scanning the QR code, the mobile app should show "Setup Complete"
2. Send a test SMS to your phone from a bank
3. Check the web app to see if the transaction appears
4. Check the mobile app logs to verify the SMS was forwarded

## Troubleshooting

### "Network request failed" error
- Check that both devices are on the same WiFi
- Verify the IP address is correct
- Check Windows Firewall settings

### QR code still shows localhost
- Make sure you created the `.env` file
- Restart the frontend server
- Clear browser cache and reload

### Mobile app can't connect
- Verify the backend is running on `0.0.0.0:3000`
- Check the backend logs for incoming requests
- Try accessing `http://172.28.132.56:3000/health` from your phone's browser

### "It still accessing localhost:8081"
This means Expo is trying to load the app bundle from localhost, which your phone can't reach.
1. I have updated `package.json` to force LAN connection.
2. **Stop the `npm start` command** in the `finance-sms-companion` directory.
3. Run it again: `npm start`
   - This will now run `expo start --host lan`
   - The QR code in the terminal should now show `exp://172.28.132.56:8081`
4. If that still doesn't work (e.g., due to firewall), try:
   - `npm run start:tunnel`
   - This uses a tunnel (ngrok) to connect, which works across different networks.
