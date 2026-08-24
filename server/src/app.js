import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for easy deployment
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api', healthRoutes);

// Root endpoint info
app.get('/', (req, res) => {
  res.json({
    name: 'Skribble Brutalist Multiplayer API',
    status: 'online',
    health: '/api/health',
  });
});

export default app;
