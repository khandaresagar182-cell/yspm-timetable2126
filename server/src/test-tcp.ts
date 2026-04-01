import net from 'net';

const client = new net.Socket();
console.log('Attempting TCP connection to 127.0.0.1:3306...');

client.connect(3306, '127.0.0.1', () => {
    console.log('Connected to port 3306!');
    client.destroy(); // kill client after server's response
});

client.on('data', (data) => {
    console.log('Received: ' + data);
    client.destroy(); // kill client after server's response
});

client.on('error', (err) => {
    console.error('Connection Error: ' + err.message);
});

client.on('close', () => {
    console.log('Connection closed');
});
