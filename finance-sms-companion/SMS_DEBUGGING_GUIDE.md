# SMS Not Capturing - Debugging & Fix Guide

## ✅ **Fix Applied**

I've updated `App.js` to request SMS permissions at runtime. The app will now:
1. Request SMS permissions when it launches
2. Show permission status on the setup screen
3. Allow you to re-request permissions if denied

---

## 🔧 **Steps to Test the Fix**

### **1. The App is Already Running**

Since `npm start` is running, the changes should hot-reload automatically. Just:
1. Shake your phone or press `R` in the terminal to reload
2. You should see the SMS permission dialog

### **2. Grant SMS Permission**

1. When prompted, tap **"Allow"** for SMS permissions
2. Check that "SMS Permission: ✅ Granted" shows on screen

### **3. Test SMS Capture**

Have your friend send you a bank transaction SMS like:
```
Your A/c XX1234 is debited with INR 500.00 on 02-Dec-24. 
Available balance: INR 5000.00
```

**Expected Result:** Transaction should appear in your web app immediately!

---

## 🐛 **Debugging Steps**

### **Check 1: Verify SMS Permission**

On your phone:
1. Settings → Apps → Expo Go (or Finance SMS Companion) → Permissions
2. Check if "SMS" is enabled
3. If not, enable it manually

### **Check 2: Check Console Logs**

In the terminal where `npm start` is running, look for:
- ✅ `SMS Permission granted: true` - Permission was granted
- ❌ `SMS Permission granted: false` - Permission was denied

### **Check 3: Check Android Logs (Advanced)**

Connect your phone via USB and run:
```bash
adb logcat | findstr "SMSReceiver"
```

**What to look for:**
- ✅ `SMS Received!` - BroadcastReceiver is working
- ✅ `SMS from: <sender>` - SMS is being captured
- ✅ `Bank SMS detected!` - Pattern matching works
- ✅ `SMS forwarded successfully!` - Backend received it

---

## 🔍 **Common Issues & Solutions**

### **Issue 1: "SMS Permission: ❌ Not Granted"**

**Solution:**
- Click "Grant SMS Permissions" button in the app
- OR go to Settings → Apps → Expo Go → Permissions → Enable SMS

### **Issue 2: SMS Received but Not Forwarded**

**Possible causes:**
1. **Pattern doesn't match** - SMS must have:
   - Transaction keyword (debited, credited, paid, etc.)
   - Currency (INR, Rs., ₹, USD, $)
   - Account keyword (A/c, account, card, bank, wallet)
   
2. **No auth token** - Make sure you scanned the QR code

3. **Backend not reachable** - Check:
   - Backend is running (`npm run dev` in backend folder)
   - IP address is correct (currently: `192.168.114.211`)
   - Phone is on same WiFi network

### **Issue 3: Permission Dialog Doesn't Appear**

If you don't see the permission dialog:
1. Reload the app (shake phone → Reload)
2. Or manually enable in Settings → Apps → Expo Go → Permissions

---

## 📱 **Real-time Detection Explained**

The SMS capture works in **REAL-TIME**:

1. **SMS arrives** on your phone
2. **Android BroadcastReceiver** (`SMSReceiver.java`) detects it instantly
3. **Pattern matching** checks if it's a bank SMS
4. **Forwarded to backend** via HTTP POST
5. **Transaction created** in database
6. **Appears in web app** immediately

**No polling, no delays** - it's event-driven!

---

## 🎯 **Quick Test**

1. Reload the app on your phone
2. Grant SMS permission when prompted
3. Have friend send test SMS: "Your account is debited with Rs. 100"
4. Check web app → Transaction should appear!
