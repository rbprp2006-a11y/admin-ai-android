import { Router } from 'express';
import { db } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  try {
    const row = db.prepare('SELECT 1 as alive').get();
    res.json({
      status: 'ok',
      database: row?.alive === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      engine: 'ADMIN AI Local Laptop Central Database (SQLite)'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'error',
      error: err.message
    });
  }
});
