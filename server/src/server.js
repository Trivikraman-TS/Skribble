import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { GameManager } from './game/GameManager.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 10000,
});

// Initialize GameManager instance
const gameManager = new GameManager(io);

// Setup Socket.IO Event Handlers
setupSocketHandlers(io, gameManager);

// Start listening
server.listen(PORT, HOST, () => {
  console.log(`==================================================`);
  console.log(`🎨 SKRIBBLE BRUTALIST BACKEND SERVER RUNNING`);
  console.log(`📡 URL: http://${HOST}:${PORT}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================`);
});

// Graceful Shutdown
const gracefulShutdown = (signal) => {
  console.log(`[${signal}] Received shutdown signal. Closing server...`);
  server.close(() => {
    console.log('HTTP and Socket.IO server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
