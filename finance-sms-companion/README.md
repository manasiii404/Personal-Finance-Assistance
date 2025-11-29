# Finance SMS Companion App - Complete Setup Guide

## Overview
Lightweight Android companion app that automatically forwards bank transaction SMS to your Finance Management backend for automatic transaction import.

## Features
- ✅ One-time QR code setup
- ✅ Background SMS monitoring
- ✅ Intelligent bank SMS detection
- ✅ Auto-forwards to backend API
- ✅ Minimal battery usage (~10 MB RAM)
- ✅ Small APK size (~5-8 MB)

## Prerequisites
- Node.js 18+ installed
- Android Studio (for building APK) OR Expo EAS CLI
- Windows/Mac/Linux development machine

## Quick Start

### Option 1: Build with Expo EAS (Recommended - Cloud Build)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
cd finance-sms-companion
eas login
```

3. **Configure Build**
```bash
eas build:configure
```

4. **Build APK**
```bash
eas build --platform android --profile preview
```

5. **Download APK**
- Build will run in cloud
- You'll get a download link when complete
- Download and share the APK

### Option 2: Build Locally with Android Studio

1. **Generate Native Code**
```bash
cd finance-sms-companion
npx expo prebuild
```

2. **Open in Android Studio**
- Open `android/` folder in Android Studio
- Wait for Gradle sync to complete

3. **Build APK**
```bash
cd android
./gradlew assembleRelease
```

4. **Find APK**
```
android/app/build/outputs/apk/release/app-release.apk
```

## Configuration

### Update Backend URL

Edit `App.js` line 9:
```javascript
const API_URL = 'https://your-backend-url.com/api'; // Change this!
```

### Update APK Download Link

Edit `src/components/SMSSetupModal.tsx` line 27:
```typescript
const apkDownloadUrl = 'https://your-server.com/downloads/finance-sms-companion.apk';
```

## Deployment Steps

### 1. Build the APK
```bash
cd finance-sms-companion
eas build --platform android --profile preview
```

### 2. Upload APK to Your Server
```bash
# Upload to your web server's public folder
scp app-release.apk user@yourserver.com:/var/www/html/downloads/
```

### 3. Update Web App
The QR code modal is already integrated in the signup flow!

### 4. Test the Flow
1. Sign up on web app
2. QR code modal appears
3. Download companion app
4. Scan QR code
5. Grant SMS permission
6. Done! SMS auto-sync is active

## How It Works

### SMS Detection
The app filters SMS using these patterns:
- Keywords: credited, debited, withdrawn, deposited
- Currency: INR, Rs., ₹
- Account: A/c, account, card
- Balance: balance, available

### SMS Parsing
Backend extracts:
- **Amount**: From currency patterns
- **Type**: Income (credited) or Expense (debited)
- **Category**: Based on keywords (food, transport, etc.)
- **Description**: Auto-generated from SMS text

### Background Service
- Runs as foreground service (persistent notification)
- Minimal battery impact
- Auto-retries failed sends
- Queues SMS when offline

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd finance-sms-companion
rm -rf node_modules
npm install
npx expo prebuild --clean
```

### APK Not Installing
- Enable "Install from Unknown Sources" in Android settings
- Check minimum Android version (6.0+)

### SMS Not Syncing
1. Check SMS permission granted
2. Verify backend URL is correct
3. Check internet connection
4. View app logs: `adb logcat | grep SMS`

### QR Code Not Scanning
- Ensure good lighting
- Hold phone steady
- Try manual login option

## Security

### Data Protection
- ✅ Only bank SMS are forwarded (filtered by patterns)
- ✅ End-to-end HTTPS encryption
- ✅ No SMS stored on device
- ✅ Token-based authentication
- ✅ User can revoke device access anytime

### Permissions
- `RECEIVE_SMS`: Read incoming SMS
- `INTERNET`: Send to backend
- `CAMERA`: QR code scanning
- `FOREGROUND_SERVICE`: Background operation

## Maintenance

### Update App
1. Increment version in `app.json`
2. Rebuild APK
3. Upload new version
4. Users download and reinstall

### Monitor Usage
Check backend logs for:
- SMS webhook calls
- Parsing errors
- Failed authentications

## Support

### Common Issues

**Q: App stops working after phone restart?**
A: Android may kill background services. User needs to disable battery optimization for the app.

**Q: Some SMS not detected?**
A: Add more patterns in `SMSReceiver.java` or backend `smsController.ts`

**Q: How to unlink device?**
A: Open app → "Unlink Device" button

## Development

### Run in Development
```bash
cd finance-sms-companion
npm start
# Scan QR with Expo Go app
```

### Test SMS Parsing
```bash
# Send test SMS to backend
curl -X POST http://localhost:3000/api/sms/sms-webhook \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"smsText": "Rs.500 debited from A/c XX1234 on 29-Nov-25", "sender": "TESTBANK"}'
```

### View Logs
```bash
# Android device logs
adb logcat | grep "Finance"
```

## File Structure
```
finance-sms-companion/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── NATIVE_SETUP.md       # Native module guide
└── README.md             # This file
```

## Backend Integration

### Required Endpoints
- `POST /api/sms/sms-webhook` - Receive SMS
- `GET /api/sms/sms-history` - View history

### SMS Webhook Payload
```json
{
  "smsText": "Rs.500 debited from A/c XX1234",
  "sender": "AXBANK"
}
```

### Response
```json
{
  "success": true,
  "message": "SMS processed successfully",
  "data": {
    "id": "trans_123",
    "amount": 500,
    "type": "expense",
    "category": "Other"
  }
}
```

## License
MIT

## Credits
Built with Expo, React Native, and ❤️
