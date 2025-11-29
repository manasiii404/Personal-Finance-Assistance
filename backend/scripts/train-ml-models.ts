import axios from 'axios';
import { config } from 'dotenv';
config();

const API_URL = 'http://localhost:3000/api';

async function loginAndTrainModels() {
    try {
        console.log('🔐 Logging in as demo user...');

        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'demo@example.com',
            password: 'demo123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful!');
        console.log(`🎫 Token: ${token.substring(0, 20)}...`);

        console.log('\n🤖 Training ML models...');
        console.log('This may take 30-60 seconds...\n');

        const trainResponse = await axios.post(
            `${API_URL}/ml/train/all`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ ML Models Trained Successfully!\n');
        console.log('📊 Training Results:');
        console.log(JSON.stringify(trainResponse.data.data, null, 2));

        console.log('\n🎉 All done! Your ML models are ready to use!');
        console.log('\n💡 What you can do now:');
        console.log('   1. Create transactions without categories - they will auto-categorize!');
        console.log('   2. View expense forecasts: GET /api/ml/forecast/next-month');
        console.log('   3. Check model status: GET /api/ml/status');

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);

        if (error.response?.status === 401) {
            console.log('\n⚠️  Authentication failed.');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  Backend server is not running. Please start it with: npm run dev');
        }
    }
}

loginAndTrainModels();
