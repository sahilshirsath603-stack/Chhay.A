const http = require('http');

const loginData = JSON.stringify({ email: 'testuser@test.com', password: 'password' });

const req1 = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
}, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const data = JSON.parse(body);
        const token = data.token;
        if (!token) {
            console.error('No token, body:', body);
            return;
        }
        const req2 = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/users/search?username=ras',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, res2 => {
            let body2 = '';
            res2.on('data', d => body2 += d);
            res2.on('end', () => console.log('STATUS:', res2.statusCode, 'BODY:', body2));
        });
        req2.end();
    });
});
req1.write(loginData);
req1.end();
