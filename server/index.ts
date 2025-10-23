
import express from 'express';
import http from 'http';
import { Server as WebSocketServer } from 'ws';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

app.post('/webhook', (req, res) => {
  // Log webhook event for debugging
  console.log('Webhook received:', req.body);
  // Broadcast webhook event to all connected clients
  broadcast({ type: 'webhook', payload: req.body });
  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Webhook listener running on port ${PORT}`);
  console.log(`WebSocket server running on port ${PORT}`);
});
