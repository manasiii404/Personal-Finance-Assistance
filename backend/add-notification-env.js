/**
 * Script to add notification settings to .env
 * Run this with: node add-notification-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

const notificationEnvVars = `
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Finance Companion <your-email@gmail.com>

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Feature Flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true

# Notification Settings
BUDGET_ALERT_THRESHOLD_1=75
BUDGET_ALERT_THRESHOLD_2=90
BUDGET_ALERT_THRESHOLD_3=100
`;

try {
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
        console.log('❌ .env file not found!');
        console.log('Creating new .env file...');
        fs.writeFileSync(envPath, notificationEnvVars.trim());
        console.log('✅ .env file created with notification settings!');
        process.exit(0);
    }

    // Read existing .env
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if notification settings already exist
    if (envContent.includes('SMTP_HOST') || envContent.includes('TWILIO_ACCOUNT_SID')) {
        console.log('⚠️ Notification settings already exist in .env');
        console.log('Please update them manually or remove them first.');
        process.exit(0);
    }

    // Append notification settings
    envContent += '\n' + notificationEnvVars;
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Notification settings added to .env successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update SMTP_USER and SMTP_PASS with your Gmail credentials');
    console.log('2. Update TWILIO credentials if you want SMS notifications');
    console.log('3. Restart your backend server');
    console.log('\n📖 See NOTIFICATION_SETUP.md for detailed setup instructions');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
