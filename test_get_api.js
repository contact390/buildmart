const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products?limit=10',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log('API response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (e) => console.error('Request error:', e));
req.end();
