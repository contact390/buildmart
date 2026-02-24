const http = require('http');

const data = JSON.stringify({
  name: 'test-small',
  category: 'test',
  price: 1,
  discount: 0,
  rating: 0,
  image: 'data:,'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (e) => console.error('Request error:', e));
req.write(data);
req.end();
