require('dotenv').config();

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
}

async function testLogin() {
    try {
        console.log('Testing login with:');
        console.log('Email:', EMAIL);
        console.log('Password: [hidden]');
        console.log('\nSending request to http://localhost:3000/api/auth/login...\n');
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: EMAIL,
                password: PASSWORD
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login SUCCESSFUL!');
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Login FAILED!');
            console.log('Status:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ Connection error!');
        console.log('Error:', error.message);
    }
}

testLogin();
