import { Router } from 'express';
import { GeminiService } from '../geminiService.js';
import { db } from '../db.js';

export const aiRouter = Router();

// POST /api/ai/chat
aiRouter.post('/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt string is required' });
    }

    const result = await GeminiService.generateResponse(prompt, context);

    // Record audit in ai_activity table (non-blocking)
    try {
      const now = new Date().toISOString();
      const insertStmt = db.prepare(`
        INSERT INTO ai_activity (id, agent_id, prompt, response, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        `AI-LOG-${Date.now()}`,
        context?.agentId || 'master_coordinator',
        prompt.slice(0, 500),
        (result.response || result.message || '').slice(0, 500),
        result.status || 'Success',
        now
      );
    } catch (e) {
      // Do not fail user request if audit insert fails
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      mode: 'local',
      status: 'error',
      message: 'Server error processing AI query',
      error: err.message
    });
  }
});
