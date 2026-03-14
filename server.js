import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// In dev mode we need CORS, in prod it serves from the same port.
const io = new Server(server, { cors: { origin: '*' } });

const port = 3000;

// Global Application State (Source of Truth)
let globalState = {
  mode: 'slides', // slides, raffle, losers, fireplace, quiz, ace, weather
  currentSlideIndex: 0,
  isPlaying: true, // Slides auto-playing
  slides: [], // Will hold slide DB temporarily
  raffleSettings: {
    rangeStart: 1,
    rangeEnd: 200,
    drawCount: 1, // Draw count per session
    drawnNumbers: [],
    winnerExclusions: [],
    monsterRaffleStartDay: 'Thursday',
    monsterRaffleStartTime: '19:00',
    prizePool: 0,
    eposTakings: 0,
    cashTakings: 0
  },
  loserSettings: {
    drawCount: 2,
    drawnNumbers: []
  },
  schedules: []
};

io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`);
  
  // Send current state to new clients immediately
  socket.emit('state:sync', globalState);

  // When admin/remote updates state
  socket.on('state:update', (updates) => {
    globalState = { ...globalState, ...updates };
    io.emit('state:sync', globalState); // Broadcast to everyone
  });

  socket.on('disconnect', () => {
    console.log(`Client Disconnected: ${socket.id}`);
  });
});

// API routes to read local image directories for slides/dropoffs
app.get('/api/images', (req, res) => {
  const readDirSafe = (dir) => {
    try {
      const fullPath = path.join(__dirname, 'public', dir);
      if (!fs.existsSync(fullPath)) return [];
      return fs.readdirSync(fullPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => `/${dir}/${file}`);
    } catch (e) {
      return [];
    }
  };

  const slides = readDirSafe('slides');
  const dropoff = readDirSafe('dropoff');
  
  res.json({ slides, dropoff });
});

app.post('/api/sync', (req, res) => {
  console.log('Initiating GitHub Auto-Sync...');
  exec('git add . && git commit -m "Auto-sync from TV Host Admin Panel" && git push', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Sync error: ${error.message}`);
      return res.status(500).json({ success: false, error: error.message, stderr });
    }
    console.log(`Sync stdout: ${stdout}`);
    res.json({ success: true, message: "Successfully synced to GitHub", stdout });
  });
});


app.use(express.static(path.join(__dirname, 'dist')));
app.use('/_ct-tvhost', express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/_ct-tvhost', express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`WebSocket Server running at http://0.0.0.0:${port}`);
});
