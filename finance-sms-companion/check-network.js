const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('🔍 Network Configuration Check\n');
console.log('='.repeat(50));

// Get all network interfaces
const interfaces = os.networkInterfaces();

console.log('\n📡 Available Network Interfaces:\n');
for (const name of Object.keys(interfaces)) {
    console.log(`\n${name}:`);
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4') {
            const isLAN = iface.address.startsWith('192.168') ||
                iface.address.startsWith('172.') ||
                iface.address.startsWith('10.');
            const marker = isLAN && !iface.internal ? '✅ [LAN IP]' : '';
            console.log(`  - ${iface.address} ${marker}`);
        }
    }
}

// Check .env file
console.log('\n' + '='.repeat(50));
console.log('\n📄 .env File Status:\n');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file exists');
    console.log('Content:');
    console.log(envContent);
} else {
    console.log('❌ .env file not found');
}

// Check app.json
console.log('='.repeat(50));
console.log('\n📱 app.json Configuration:\n');
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    console.log(`hostType: ${appJson.expo?.hostType || 'not set'}`);
} else {
    console.log('❌ app.json not found');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Recommendations:\n');
console.log('1. Ensure your PC and Android device are on the same WiFi');
console.log('2. Run: npm start');
console.log('3. The QR code should show your LAN IP (172.x.x.x)');
console.log('4. If not, try: npx expo start --clear --lan');
console.log('\n' + '='.repeat(50) + '\n');
