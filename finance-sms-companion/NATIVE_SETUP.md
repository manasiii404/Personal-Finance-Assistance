# SMS Receiver Implementation Guide

Since the `android/` folder is gitignored in Expo, you'll need to create a custom development build.

## Steps to Add Native SMS Receiver:

### 1. Create Development Build
```bash
cd finance-sms-companion
npx expo prebuild
```

This will generate the `android/` folder.

### 2. Add SMS Receiver

Create `android/app/src/main/java/com/finance/smscompanion/SMSReceiver.java`:

```java
package com.finance.smscompanion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import java.util.regex.Pattern;

public class SMSReceiver extends BroadcastReceiver {
    private static final Pattern[] BANK_PATTERNS = {
        Pattern.compile("credited|debited|withdrawn|deposited", Pattern.CASE_INSENSITIVE),
        Pattern.compile("INR|Rs\\\\.|₹"),
        Pattern.compile("A/c|account|card", Pattern.CASE_INSENSITIVE)
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            Object[] pdus = (Object[]) bundle.get("pdus");
            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                    String sender = smsMessage.getDisplayOriginatingAddress();
                    String body = smsMessage.getMessageBody();
                    
                    if (isBankSMS(body)) {
                        // Forward to backend
                        Intent serviceIntent = new Intent(context, SMSForwardService.class);
                        serviceIntent.putExtra("sender", sender);
                        serviceIntent.putExtra("body", body);
                        context.startService(serviceIntent);
                    }
                }
            }
        }
    }
    
    private boolean isBankSMS(String message) {
        int matches = 0;
        for (Pattern p : BANK_PATTERNS) {
            if (p.matcher(message).find()) matches++;
        }
        return matches >= 2;
    }
}
```

### 3. Register in AndroidManifest.xml

Add inside `<application>` tag:

```xml
<receiver android:name=".SMSReceiver" android:exported="true">
    <intent-filter android:priority="999">
        <action android:name="android.provider.Telephony.SMS_RECEIVED"/>
    </intent-filter>
</receiver>

<service android:name=".SMSForwardService" android:exported="false"/>
```

### 4. Build APK

```bash
cd android
./gradlew assembleRelease
```

APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

## Alternative: Use Expo EAS Build

```bash
npm install -g eas-cli
eas build --platform android
```

This builds in the cloud and gives you a downloadable APK.
