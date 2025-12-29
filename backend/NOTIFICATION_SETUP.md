# 📧 EMAIL & SMS NOTIFICATION SETUP GUIDE

## 🎯 Quick Setup

You need to add these variables to your `.env` file in the backend directory:

### 📧 SMTP Email Configuration (Gmail Example)

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Finance Companion <your-email@gmail.com>
```

### 📱 Twilio SMS Configuration

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📧 SMTP Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Finance Companion"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update .env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char password from step 2
SMTP_FROM=Finance Companion <youremail@gmail.com>
```

---

## 📱 Twilio SMS Setup

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Verify your phone number

### Step 2: Get Credentials
1. Go to Twilio Console: https://console.twilio.com/
2. Copy your **Account SID**
3. Copy your **Auth Token**

### Step 3: Get Phone Number
1. In Twilio Console, go to Phone Numbers
2. Get a free trial number (or buy one)
3. Copy the phone number (format: +1234567890)

### Step 4: Update .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 🧪 Testing

### Test Email:
```bash
POST http://localhost:3000/api/notifications/test-email
Authorization: Bearer YOUR_TOKEN
```

### Test SMS:
```bash
POST http://localhost:3000/api/notifications/test-sms
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

---

## 💡 Alternative SMTP Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

---

## ⚠️ Important Notes

1. **Gmail App Passwords**: Regular Gmail password won't work. You MUST use App Password.
2. **Twilio Trial**: Free trial has limitations:
   - Can only send to verified numbers
   - Messages include "Sent from a Twilio trial account"
3. **Phone Format**: Always use international format (+919876543210)
4. **Security**: Never commit .env file to git!

---

## 🔍 Troubleshooting

### Email not sending?
- ✅ Check SMTP credentials
- ✅ Verify 2FA is enabled (Gmail)
- ✅ Use App Password, not regular password
- ✅ Check firewall/antivirus blocking port 587

### SMS not sending?
- ✅ Verify phone number in Twilio (trial accounts)
- ✅ Check Twilio balance
- ✅ Ensure phone number format is correct (+country code)
- ✅ Check Twilio logs for errors

---

## 📝 Quick Copy-Paste Template

Add this to your `backend/.env` file:

```env
# Email Notifications (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Finance Companion <your-email@gmail.com>

# SMS Notifications (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Enable/Disable
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
```

Just fill in the blank values!

---

## ✅ Verification

After adding credentials, restart your backend and check logs:

```
✅ Email service initialized successfully
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   From: your-email@gmail.com

✅ Twilio SMS service initialized successfully
   From Number: +1234567890
```

If you see these messages, you're all set! 🎉
