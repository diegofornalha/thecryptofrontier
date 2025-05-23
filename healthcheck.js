const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3200,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.abort();
  process.exit(1);
});

req.end();