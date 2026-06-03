const http = require('http');

const data = JSON.stringify({
  day: 1,
  topic: 'REST API Best Practices',
  phase: 'Backend & Cloud',
  description: 'Pagination'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/guide',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  
  let body = '';
  res.on('data', d => {
    body += d;
  });
  
  res.on('end', () => {
    console.log('Body:', body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
