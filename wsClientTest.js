const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:5000');

ws.on('open', () => {
    console.log('Connected to WebSocket server');
});

ws.on('message', (data) => {
    console.log('Received message:', data);
    const message = JSON.parse(data);
    if (message.type === 'NEWEST_NEWS') {
        // console.log('Newest News:', message.data);
    }
});

ws.on('close', () => {
    console.log('Connection to WebSocket server closed');
});
