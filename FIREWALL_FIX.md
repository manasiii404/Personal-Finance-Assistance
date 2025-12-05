# Windows Firewall Configuration for Backend API

## Problem
The backend server is running on port 3000 and listening on all network interfaces (0.0.0.0), but Windows Firewall is blocking incoming connections from your LAN IP (172.28.132.56).

## Solution

### Option 1: Add Firewall Rule via PowerShell (Recommended)

**Run PowerShell as Administrator** and execute:

```powershell
New-NetFirewallRule -DisplayName "Backend API Port 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### Option 2: Add Firewall Rule via Windows Defender Firewall GUI

1. Press `Win + R` and type `wf.msc`, then press Enter
2. Click on **Inbound Rules** in the left panel
3. Click **New Rule...** in the right panel
4. Select **Port** and click Next
5. Select **TCP** and enter `3000` in Specific local ports
6. Click Next
7. Select **Allow the connection**
8. Click Next
9. Check all profiles (Domain, Private, Public)
10. Click Next
11. Name it "Backend API Port 3000"
12. Click Finish

### Option 3: Add Firewall Rule for Expo Metro (Port 8081)

If you also need to fix the Expo Metro bundler issue, run as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
```

## Verification

After adding the firewall rule, test the connection:

```powershell
# Test from localhost
curl http://localhost:3000/api/health

# Test from LAN IP
curl http://172.28.132.56:3000/api/health
```

Both should return a successful response.

## Current Status

✅ Backend server is running on port 3000
✅ Server is listening on 0.0.0.0 (all interfaces)
✅ MongoDB is connected
❌ Windows Firewall is blocking LAN connections

## Next Steps

1. **Add the firewall rule** using one of the options above
2. **Restart your frontend** to ensure it picks up the connection
3. **Test the login** from your frontend application

## Alternative: Temporary Firewall Disable (NOT RECOMMENDED)

If you need to test quickly, you can temporarily disable the firewall:

```powershell
# Disable (Run as Administrator)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Re-enable (Run as Administrator)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

**WARNING**: Only use this for testing. Always re-enable the firewall afterward!
