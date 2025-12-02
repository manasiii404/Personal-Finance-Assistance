package com.finance.smscompanion;

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
            
            // Forward to backend in a new thread
            new Thread(() -> {
                forwardSMSToBackend(sender, body, timestamp);
                stopSelf(startId);
            }).start();
        }
        
        return START_NOT_STICKY;
    }
    
    private void forwardSMSToBackend(String sender, String body, long timestamp) {
        try {
            // Get auth token from AsyncStorage
            SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
            String authToken = prefs.getString("authToken", null);
            
            if (authToken == null) {
                Log.e(TAG, "No auth token found. User must link device first.");
                return;
            }
            
            // Remove quotes if present
            authToken = authToken.replace("\"", "");
            
            Log.d(TAG, "Forwarding SMS to backend...");
            Log.d(TAG, "API URL: " + API_URL);
            
            // Create JSON payload
            JSONObject payload = new JSONObject();
            payload.put("smsText", body);
            payload.put("sender", sender);
            
            // Make HTTP request
            URL url = new URL(API_URL);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + authToken);
            conn.setDoOutput(true);
            
            // Send request
            OutputStream os = conn.getOutputStream();
            os.write(payload.toString().getBytes("UTF-8"));
            os.close();
            
            // Get response
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
