const { execSync, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Load .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
}

// Get the LAN IP address
function getLanIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168') ||
                    iface.address.startsWith('172.') ||
                    iface.address.startsWith('10.')) {
                    return iface.address;
                }
            }
        }
    }
    return null;
}

const ip = getLanIp();

if (!ip) {
    console.error('❌ Could not detect LAN IP address');
    process.exit(1);
}

console.log(`\n🌐 Starting Expo with IP: ${ip}\n`);
console.log(`📝 Setting REACT_NATIVE_PACKAGER_HOSTNAME=${ip}\n`);

// Update .env file with current IP
fs.writeFileSync(envPath, `REACT_NATIVE_PACKAGER_HOSTNAME=${ip}\n`);

// Set environment variable
process.env.REACT_NATIVE_PACKAGER_HOSTNAME = ip;

// Start Expo with spawn to maintain proper environment
console.log('🚀 Starting Metro bundler...\n');

const expoProcess = spawn('npx', ['expo', 'start', '--lan'], {
    stdio: 'inherit',
    env: {
        ...process.env,
        REACT_NATIVE_PACKAGER_HOSTNAME: ip,
        EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0'
    },
    shell: true
});

expoProcess.on('error', (error) => {
    console.error('❌ Failed to start Expo:', error.message);
    process.exit(1);
});

expoProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
        console.error(`❌ Expo exited with code ${code}`);
        process.exit(code);
    }
});
