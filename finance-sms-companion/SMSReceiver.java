package com.finance.smscompanion;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;
import java.util.regex.Pattern;

public class SMSReceiver extends BroadcastReceiver {
    private static final String TAG = "SMSReceiver";
    
    // Patterns to identify bank/financial SMS
    private static final Pattern[] BANK_PATTERNS = {
        Pattern.compile("credited|debited|withdrawn|deposited|paid|received", Pattern.CASE_INSENSITIVE),
        Pattern.compile("INR|Rs\\.?|₹|USD|\\$"),
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
                    
                    // Check if this is a financial/bank SMS
                    if (isBankSMS(body)) {
                        Log.d(TAG, "Bank SMS detected! Forwarding to service...");
                        
                        // Forward to service for processing
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
    
    /**
     * Check if SMS matches bank/financial transaction patterns
     * Returns true if at least 2 patterns match
     */
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
