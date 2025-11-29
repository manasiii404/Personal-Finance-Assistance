import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Testing HTTP Endpoint...');

    // 1. Login to get token
    console.log('Logging in...');
    const loginResponse = await fetch('http://127.0.0.1:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@example.com', password: 'demo123' })
    });

    if (!loginResponse.ok) {
        console.error('Login failed:', await loginResponse.text());
        return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token received');

    // 2. Fetch Income Breakdown
    console.log('Fetching Income Breakdown...');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);

    const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        type: 'income'
    });

    const url = `http://127.0.0.1:5001/api/analytics/category-breakdown?${params.toString()}`;
    console.log(`Request URL: ${url}`);

    const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        console.error('Request failed:', await response.text());
        return;
    }

    const data = await response.json();
    console.log('✅ Response received');
    console.log('Data:', JSON.stringify(data, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
