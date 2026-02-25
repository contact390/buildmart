const http = require('http');
const key = '3261069b-e576-40d9-9641-82a62f70fe49';
const data = JSON.stringify({ cart_key: key, customer_name: 'Test User', email: 'a@b.com', address: 'Somewhere' });

const options = {
  hostname: 'localhost', port: 5000, path: '/api/checkout', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', body); });
});
req.on('error', e => console.error('Request error:', e));
req.write(data); req.end();
