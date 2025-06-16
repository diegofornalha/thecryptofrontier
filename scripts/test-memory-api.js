#!/usr/bin/env node

const http = require('http');

const data = {
  content: "Test memory from Node.js",
  user_id: "strapi-specialist",
  category: "strapi-knowledge",
  tags: ["test", "nodejs"],
  metadata: JSON.stringify({ test: true })
};

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/mcp/add_memory',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(data))
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify(data));
req.end();