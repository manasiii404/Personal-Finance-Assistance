const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const SMSReceiverCode = `package com.finance.smscompanion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import java.util.regex.Pattern;

public class SMSReceiver extends BroadcastReceiver {
    private static final String TAG = "SMSReceiver";
    
    private static final Pattern[] BANK_PATTERNS = {
        Pattern.compile("credited|debited|withdrawn|deposited|paid|received", Pattern.CASE_INSENSITIVE),
        Pattern.compile("INR|Rs\\\\.?|₹|USD|\\\\$"),
        Pattern.compile("A/c|account|card|bank|wallet", Pattern.CASE_INSENSITIVE)
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "SMS Received!");
        
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            Object[] pdus = (Object[]) bundle.get("pdus");
            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                    String sender = smsMessage.getDisplayOriginatingAddress();
                    String body = smsMessage.getMessageBody();
                    
                    Log.d(TAG, "SMS from: " + sender);
                    Log.d(TAG, "SMS body: " + body);
                    
                    if (isBankSMS(body)) {
                        Log.d(TAG, "Bank SMS detected! Forwarding to service...");
                        
                        Intent serviceIntent = new Intent(context, SMSForwardService.class);
                        serviceIntent.putExtra("sender", sender);
                        serviceIntent.putExtra("body", body);
                        serviceIntent.putExtra("timestamp", System.currentTimeMillis());
                        context.startService(serviceIntent);
                    } else {
                        Log.d(TAG, "Not a bank SMS, ignoring.");
                    }
                }
            }
        }
    }
    
    private boolean isBankSMS(String message) {
        int matches = 0;
        for (Pattern pattern : BANK_PATTERNS) {
            if (pattern.matcher(message).find()) {
                matches++;
            }
        }
        boolean isBank = matches >= 2;
        Log.d(TAG, "Pattern matches: " + matches + ", Is bank SMS: " + isBank);
        return isBank;
    }
}
`;

const SMSForwardServiceCode = `package com.finance.smscompanion;

import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class SMSForwardService extends Service {
    private static final String TAG = "SMSForwardService";
    private static final String API_URL = "http://192.168.114.211:3000/api/sms/sms-webhook";
    private static final String PREFS_NAME = "RCTAsyncLocalStorage_V1";
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String sender = intent.getStringExtra("sender");
            String body = intent.getStringExtra("body");
            long timestamp = intent.getLongExtra("timestamp", System.currentTimeMillis());
            
            Log.d(TAG, "Service started for SMS from: " + sender);
            
            new Thread(() -> {
                forwardSMSToBackend(sender, body, timestamp);
                stopSelf(startId);
            }).start();
        }
        
        return START_NOT_STICKY;
    }
    
    private void forwardSMSToBackend(String sender, String body, long timestamp) {
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String authToken = prefs.getString("authToken", null);
            
            if (authToken == null) {
                Log.e(TAG, "No auth token found. User must link device first.");
                return;
            }
            
            authToken = authToken.replace("\\"", "");
            
            Log.d(TAG, "Forwarding SMS to backend...");
            Log.d(TAG, "API URL: " + API_URL);
            
            JSONObject payload = new JSONObject();
            payload.put("smsText", body);
            payload.put("sender", sender);
            
            URL url = new URL(API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + authToken);
            conn.setDoOutput(true);
            
            OutputStream os = conn.getOutputStream();
            os.write(payload.toString().getBytes("UTF-8"));
            os.close();
            
            int responseCode = conn.getResponseCode();
            Log.d(TAG, "Response code: " + responseCode);
            
            if (responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED) {
                Log.d(TAG, "SMS forwarded successfully!");
            } else {
                Log.e(TAG, "Failed to forward SMS. Response code: " + responseCode);
            }
            
            conn.disconnect();
            
        } catch (Exception e) {
            Log.e(TAG, "Error forwarding SMS: " + e.getMessage(), e);
        }
    }
    
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
`;

const withSMSTracking = (config) => {
  // Add manifest configuration
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];
    
    // Add SMS Receiver
    if (!application.receiver) {
      application.receiver = [];
    }
    
    application.receiver.push({
      '$': {
        'android:name': '.SMSReceiver',
        'android:exported': 'true',
        'android:permission': 'android.permission.BROADCAST_SMS'
      },
      'intent-filter': [{
        '$': { 'android:priority': '999' },
        'action': [{ '$': { 'android:name': 'android.provider.Telephony.SMS_RECEIVED' } }]
      }]
    });

    // Add SMS Forward Service
    if (!application.service) {
      application.service = [];
    }
    
    application.service.push({
      '$': {
        'android:name': '.SMSForwardService',
        'android:exported': 'false'
      }
    });

    return config;
  });

  // Add Java source files
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectRoot = config.modRequest.platformProjectRoot;
      
      const javaDir = path.join(
        androidProjectRoot,
        'app',
        'src',
        'main',
        'java',
        'com',
        'finance',
        'smscompanion'
      );

      // Ensure directory exists
      fs.mkdirSync(javaDir, { recursive: true });

      // Write SMSReceiver.java
      fs.writeFileSync(
        path.join(javaDir, 'SMSReceiver.java'),
        SMSReceiverCode
      );

      // Write SMSForwardService.java
      fs.writeFileSync(
        path.join(javaDir, 'SMSForwardService.java'),
        SMSForwardServiceCode
      );

      console.log('✅ SMS tracking Java files created successfully');

      return config;
    },
  ]);

  return config;
};

module.exports = withSMSTracking;
