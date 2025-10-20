const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors'); // ✅ Add CORS support
const { createRoom, joinRoom, rooms } = require('./rooms');

const app = express();
app.use(cors()); // ✅ Allow Chrome extension to call localhost
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// ✅ Create a new room endpoint
app.get('/create-room', (req, res) => {
  const token = createRoom();
  res.json({ token, joinUrl: `/join.html?token=${token}` }); // fixed URL
});

// ✅ WebSocket connection logic
wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const token = params.get('token');
  const role = params.get('role') || 'client';

  const room = joinRoom(token, ws, role);
  if (!room) return ws.close();

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }

    // Broadcast chat or playback events
    if (data.chat || data.event) {
      room.broadcast(ws, data);
    }
  });

  ws.on('close', () => {
    room.remove(ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});


