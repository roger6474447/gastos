
const API_URL = 'http://localhost:3000/api';

async function testIncome() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful');

        console.log('\n2. Testing GET /incomes...');
        const getRes = await fetch(`${API_URL}/incomes`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!getRes.ok) throw new Error(`GET failed: ${getRes.statusText}`);
        const incomes = await getRes.json();
        console.log(`✅ GET /incomes successful. Count: ${incomes.length}`);

        console.log('\n3. Testing POST /incomes...');
        const postRes = await fetch(`${API_URL}/incomes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                source: 'Test Income Fetch',
                amount: 500.00,
                income_date: new Date().toISOString().split('T')[0],
                description: 'Automated test fetch'
            })
        });

        if (!postRes.ok) {
            const err = await postRes.text();
            throw new Error(`POST failed: ${postRes.status} ${err}`);
        }
        const newIncome = await postRes.json();
        console.log('✅ POST /incomes successful:', newIncome);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testIncome();
