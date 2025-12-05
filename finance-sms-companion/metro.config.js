const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

// Get the LAN IP address
function getLanIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                // Prefer addresses starting with 192.168, 172, or 10
                if (iface.address.startsWith('192.168') ||
                    iface.address.startsWith('172.') ||
                    iface.address.startsWith('10.')) {
                    return iface.address;
                }
            }
        }
    }
    return 'localhost';
}

const config = getDefaultConfig(__dirname);

// Set the server hostname
const lanIp = getLanIp();
console.log(`\n🌐 Metro will use IP: ${lanIp}\n`);

config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
            // Log the request host for debugging
            if (req.url === '/') {
                console.log(`Request from: ${req.headers.host}`);
            }
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
