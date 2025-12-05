// Test the API response structure
// Run: node test-api-response.js

const axios = require('axios');

async function testFamilyAPI() {
    console.log('Testing Family API Response Structure\n');
    console.log('='.repeat(60));

    // You need to get a real JWT token from logging in
    const token = process.argv[2];
    
    if (!token) {
        console.log('❌ Please provide JWT token as argument:');
        console.log('   node test-api-response.js YOUR_JWT_TOKEN');
        process.exit(1);
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test /api/family/my-family endpoint
        console.log('\n📡 Testing GET /api/family/my-family');
        console.log('-'.repeat(60));
        
        const response = await axios.get('http://localhost:3000/api/family/my-family', { headers });
        
        console.log('\n✅ Response Status:', response.status);
        console.log('\n📦 Response Data Structure:');
        console.log(JSON.stringify(response.data, null, 2));

        // Analyze the structure
        console.log('\n🔍 Analysis:');
        if (response.data.success) {
            console.log('  ✓ Success: true');
        }
        
        if (response.data.data) {
            console.log('  ✓ Has data property');
            
            if (response.data.data.family) {
                console.log('  ✓ Has data.family property');
                console.log(`    - Family Name: ${response.data.data.family.name}`);
                console.log(`    - Room Code: ${response.data.data.family.roomCode}`);
                console.log(`    - Members: ${response.data.data.family.members?.length || 0}`);
            } else if (Array.isArray(response.data.data)) {
                console.log('  ⚠️  data is an array (unexpected)');
            } else if (response.data.data === null) {
                console.log('  ⚠️  data is null (no family membership)');
            } else {
                console.log('  ⚠️  Unexpected data structure');
                console.log('    Type:', typeof response.data.data);
                console.log('    Keys:', Object.keys(response.data.data));
            }
        } else {
            console.log('  ❌ No data property');
        }

    } catch (error) {
        console.log('\n❌ Error:', error.message);
        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }

    console.log('\n' + '='.repeat(60));
}

testFamilyAPI();
