// HeatPatrol Node.js Server
// ESP32 posts JSON data -> server stores & emits via Socket.IO -> Dashboard updates instantly

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '64kb' }));
app.use(express.static('public'));

let latest = null;

// ESP32 → POST sensor data
app.post('/api/readings', (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ ok: false, msg: 'No body' });

  data.ts = data.ts || new Date().toISOString();
  latest = data;
  console.log('Received:', data);

  io.emit('reading', latest);
  res.json({ ok: true });
});

// Dashboard polling fallback
app.get('/api/latest', (req, res) => {
  res.json({ ok: true, latest });
});

io.on('connection', socket => {
  console.log('Dashboard connected:', socket.id);
  if (latest) socket.emit('reading', latest);
  socket.on('disconnect', () => console.log('Dashboard disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`✅ HeatPatrol server running at http://localhost:${PORT}`);
  console.log(`🛰  POST readings to http://<ip>:${PORT}/api/readings`);
});
