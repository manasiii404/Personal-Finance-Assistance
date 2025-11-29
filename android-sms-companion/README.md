# Finance SMS Companion App

Lightweight Android app for automatic SMS transaction parsing.

## Features
- One-time QR code setup
- Background SMS monitoring
- Auto-forwards bank SMS to backend
- Minimal battery usage

## Setup
1. Build APK: `./gradlew assembleRelease`
2. Install on device
3. Scan QR code from web signup
4. Grant SMS permission

## Size
- APK: ~2-3 MB
- RAM: ~10 MB

## Permissions
- `RECEIVE_SMS`: Read incoming SMS
- `INTERNET`: Send to backend
- `FOREGROUND_SERVICE`: Background operation
