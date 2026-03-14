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
app.use(express.json());
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

// Document/Template management
app.get('/api/documents', (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'public', 'documents');
    if (!fs.existsSync(fullPath)) return res.json([]);
    const files = fs.readdirSync(fullPath)
      .filter(file => /\.(csv|json|txt)$/i.test(file));
    res.json(files);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/documents/:filename', (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'public', 'documents', req.params.filename);
    if (!fs.existsSync(fullPath)) return res.status(404).send('File not found');
    const content = fs.readFileSync(fullPath, 'utf8');
    res.send(content);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/documents/:filename', (req, res) => {
  try {
    const fullPath = path.join(__dirname, 'public', 'documents', req.params.filename);
    fs.writeFileSync(fullPath, req.body.content, 'utf8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/generate-slides', (req, res) => {
  try {
    const { filename } = req.body;
    const fullPath = path.join(__dirname, 'public', 'documents', filename);
    if (!fs.existsSync(fullPath)) return res.status(404).send('File not found');
    
    const content = fs.readFileSync(fullPath, 'utf8');
    let newSlides = [];

    if (filename.endsWith('.csv')) {
      const lines = content.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      newSlides = lines.slice(1).map((line, idx) => {
        const values = line.split(',').map(v => v.trim());
        const slide = { id: `gen-${Date.now()}-${idx}`, type: 'promo', disabled: false };
        headers.forEach((h, i) => {
          if (h === 'duration') slide[h] = Number(values[i]) || 30000;
          else slide[h] = values[i] || '';
        });
        return slide;
      });
    } else if (filename.endsWith('.json')) {
      newSlides = JSON.parse(content);
    }

    // Update global state with newly generated slides
    globalState.slides = newSlides;
    io.emit('state:sync', globalState);
    
    res.json({ success: true, count: newSlides.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
