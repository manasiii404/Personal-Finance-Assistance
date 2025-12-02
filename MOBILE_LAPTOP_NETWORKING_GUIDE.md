# Mobile ↔ Laptop Communication Guide

## The Problem

- **Laptop backend:** Runs on `http://localhost:3000`
- **Web app:** Runs on `http://localhost:5173` (same laptop, works fine)
- **Mobile app:** Can't access `localhost` (localhost means the phone itself, not your laptop!)

## The Solution: Use Your Laptop's Local IP Address

Your laptop and phone need to be on the **same WiFi network**, then the phone can access your laptop using its **local IP address**.

---

## 🔧 Setup Steps

### Step 1: Find Your Laptop's Local IP Address

#### On Windows:
```powershell
ipconfig
```

Look for **"Wireless LAN adapter Wi-Fi"** section:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100  ← THIS IS YOUR IP
```

#### On Mac/Linux:
```bash
ifconfig | grep "inet "
```

Look for something like: `192.168.1.100` or `192.168.0.105`

**Your IP will be in one of these formats:**
- `192.168.x.x` (most common)
- `10.0.x.x`
- `172.16.x.x` to `172.31.x.x`

---

### Step 2: Update Backend to Accept Connections from Network

**File: `backend/src/server.ts`**

Change from:
```typescript
httpServer.listen(3000, () => {
  logger.info('Server running on port 3000');
});
```

To:
```typescript
httpServer.listen(3000, '0.0.0.0', () => {
  logger.info('Server running on port 3000');
  logger.info('Access from network: http://192.168.1.100:3000');  // Use your actual IP
});
```

**What `0.0.0.0` means:**
- Listen on **all network interfaces** (not just localhost)
- Allows connections from other devices on the same network

---

### Step 3: Update CORS to Allow Mobile App

**File: `backend/src/server.ts`**

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',           // Web app (laptop)
    'http://192.168.1.100:5173',       // Web app (from phone browser)
    'http://192.168.1.100:3000',       // Direct backend access
  ],
  credentials: true
}));
```

**For development, you can use:**
```typescript
app.use(cors({
  origin: true,  // Allow all origins (development only!)
  credentials: true
}));
```

---

### Step 4: Update Mobile App API URL

**File: `finance-sms-companion/App.js`**

Change from:
```javascript
const API_URL = 'http://localhost:3000/api';
```

To:
```javascript
// Use your laptop's IP address
const API_URL = 'http://192.168.1.100:3000/api';  // Replace with YOUR IP
```

**Better approach - Use environment variable:**

Create `.env` file:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

Then in `App.js`:
```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000/api';
```

---

### Step 5: Update Web App API URL (Optional)

**File: `src/services/api.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'http://192.168.1.100:3000');
```

Or create `.env`:
```env
VITE_API_BASE_URL=http://192.168.1.100:3000
```

---

### Step 6: Allow Firewall Access (Windows)

Windows Firewall might block incoming connections. You need to allow Node.js:

1. **Open Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Click **"Change settings"**
4. Find **"Node.js"** in the list
5. Check both **"Private"** and **"Public"** boxes
6. Click **OK**

**Or run this PowerShell command as Administrator:**
```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

## 🧪 Testing the Connection

### Test 1: Check if Backend is Accessible

**From your laptop browser:**
```
http://192.168.1.100:3000/api/health
```

**From your phone browser:**
```
http://192.168.1.100:3000/api/health
```

Both should return: `{"status":"ok"}` or similar

### Test 2: Test from Mobile App

Add this test in your mobile app:
```javascript
// App.js
useEffect(() => {
  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      console.log('✅ Backend connection successful:', response.data);
      Alert.alert('Success', 'Connected to backend!');
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      Alert.alert('Error', `Cannot connect to backend: ${error.message}`);
    }
  };
  
  testConnection();
}, []);
```

---

## 📱 Complete Network Setup

```
┌─────────────────────────────────────────────────────┐
│              WiFi Router (192.168.1.1)              │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Laptop         │     │  Mobile Phone   │
│  192.168.1.100  │     │  192.168.1.105  │
│                 │     │                 │
│ Backend:        │     │ Mobile App:     │
│ 0.0.0.0:3000    │◄────│ API_URL =       │
│                 │     │ 192.168.1.100   │
│ Web App:        │     │                 │
│ localhost:5173  │     │                 │
└─────────────────┘     └─────────────────┘
```

**Both devices must be on the SAME WiFi network!**

---

## 🔍 Troubleshooting

### Problem: "Network request failed"

**Causes:**
1. ❌ Phone and laptop on different WiFi networks
2. ❌ Firewall blocking port 3000
3. ❌ Wrong IP address in mobile app
4. ❌ Backend not listening on `0.0.0.0`

**Solutions:**
1. ✅ Connect both to same WiFi
2. ✅ Disable firewall temporarily to test
3. ✅ Double-check IP with `ipconfig`
4. ✅ Restart backend after changing to `0.0.0.0`

---

### Problem: "CORS error"

**Solution:**
```typescript
// backend/src/server.ts
app.use(cors({
  origin: true,  // Allow all (development only)
  credentials: true
}));
```

---

### Problem: IP address keeps changing

**Solution 1: Set Static IP on Laptop**

Windows:
1. Settings → Network & Internet → WiFi
2. Click your network → Properties
3. IP assignment → Edit → Manual
4. Set IP: `192.168.1.100`
5. Subnet: `255.255.255.0`
6. Gateway: `192.168.1.1`

**Solution 2: Use hostname instead**

Some routers allow accessing by hostname:
```javascript
const API_URL = 'http://YOUR-LAPTOP-NAME.local:3000/api';
```

---

## 🚀 Production Deployment

For production, you'll deploy to a real server:

### Option 1: Cloud Server (Recommended)
- Deploy backend to **Heroku**, **Railway**, **Render**, or **AWS**
- Get permanent URL: `https://your-app.herokuapp.com`
- Update mobile app to use this URL
- No network setup needed!

### Option 2: ngrok (Quick Testing)
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000
```

You'll get a public URL like: `https://abc123.ngrok.io`

Use this in your mobile app:
```javascript
const API_URL = 'https://abc123.ngrok.io/api';
```

---

## ✅ Quick Setup Checklist

- [ ] Find laptop IP address (`ipconfig`)
- [ ] Update backend to listen on `0.0.0.0`
- [ ] Update CORS to allow all origins (dev only)
- [ ] Update mobile app API_URL to laptop IP
- [ ] Allow Node.js through Windows Firewall
- [ ] Connect phone and laptop to same WiFi
- [ ] Test connection from phone browser
- [ ] Test from mobile app
- [ ] Verify WebSocket connection works

---

## 📝 Example Configuration

**Laptop IP:** `192.168.1.100`

**Backend (server.ts):**
```typescript
httpServer.listen(3000, '0.0.0.0', () => {
  console.log('Server: http://192.168.1.100:3000');
});

app.use(cors({ origin: true, credentials: true }));
```

**Mobile App (App.js):**
```javascript
const API_URL = 'http://192.168.1.100:3000/api';
```

**Web App (.env):**
```env
VITE_API_BASE_URL=http://192.168.1.100:3000
```

---

## 🎯 Summary

**For Development:**
- Use laptop's **local IP address** (192.168.x.x)
- Both devices on **same WiFi**
- Backend listens on **0.0.0.0** (all interfaces)
- CORS allows **all origins**

**For Production:**
- Deploy backend to **cloud server**
- Use **HTTPS** with real domain
- Proper CORS configuration
- No local network needed!

**This setup allows your mobile app to communicate with your laptop's backend during development!** 🎉
