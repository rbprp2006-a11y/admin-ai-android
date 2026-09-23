import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase, dbPath } from './db.js';
import { healthRouter } from './routes/health.js';
import { cafeteriaRouter } from './routes/cafeteria.js';
import { aiRouter } from './routes/ai.js';
import { modulesRouter } from './routes/modules.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (prefer server/.env, fallback to root .env)
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

// Initialize SQLite Tables & Seed Data
initDatabase();

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = '0.0.0.0';

// Middlewares
app.use(cors({
  origin: '*', // Allows local browser, LAN mobile devices, and Android WebView
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for local inspection
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/cafeteria', cafeteriaRouter);
app.use('/api/ai', aiRouter);
app.use('/api', modulesRouter);

// Error Handling Middleware
app.use(errorHandler);

const server = app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log('🚀 ADMIN AI - Smart Admin Local Backend API Server');
  console.log('====================================================');
  console.log(`📡 Listening on: http://${HOST}:${PORT}`);
  console.log(`💻 Local Laptop:  http://localhost:${PORT}`);
  console.log(`🏥 Health Check:  http://localhost:${PORT}/health`);
  console.log(`🍽️ Cafeteria API: http://localhost:${PORT}/api/cafeteria`);
  console.log(`🤖 AI Gateway:    http://localhost:${PORT}/api/ai/chat`);
  console.log(`💾 Database:      ${dbPath}`);
  console.log(`🔑 Gemini Key:    ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not configured (Local Fallback mode) ⚠️'}`);
  console.log('====================================================');
  console.log('📱 To connect Android APK on same Wi-Fi:');
  console.log(`   Set API Base URL in app to: http://<YOUR_LAPTOP_IP>:${PORT}/api`);
  console.log('====================================================');
});

export default app;
