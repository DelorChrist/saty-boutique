async function testLogin() {
    try {
        console.log('Testing login with:');
        console.log('Email: admin@satyboutique.com');
        console.log('Password: admin123');
        console.log('\nSending request to http://localhost:3000/api/auth/login...\n');
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@satyboutique.com',
                password: 'admin123'
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
