const http = require('http');
const key = '3261069b-e576-40d9-9641-82a62f70fe49';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/cart/' + key,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Body:', JSON.stringify(JSON.parse(body), null, 2)); }
    catch(e){ console.log('Raw body:', body); }
  });
});
req.on('error', e => console.error('Request error:', e));
req.end();
