const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const form = new FormData();
form.append('name', 'Test');
form.append('username', 'testuser_12345');
form.append('email', 'test5@example.com');
form.append('password', 'Password123');

axios.post('http://localhost:5000/api/auth/signup', form, {
  headers: form.getHeaders()
}).then(res => {
  fs.writeFileSync('result.txt', 'success: ' + JSON.stringify(res.data));
}).catch(err => {
  fs.writeFileSync('result.txt', 'Error: ' + JSON.stringify(err.response ? err.response.data : err.message));
});
