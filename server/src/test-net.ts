import http from 'http';

console.log('Testing outbound connection to google.com...');

const req = http.get('http://www.google.com', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log('Outbound connection successful.');
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
