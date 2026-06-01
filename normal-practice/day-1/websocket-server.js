// WebSocket server
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  ws.on('message', function incoming(data) {
    console.log('Received:', data.toString());
    // Echo back to client
    ws.send(`Echo: ${data}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('Server error:', err);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
