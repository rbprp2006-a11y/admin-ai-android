import { Router } from 'express';
import { db } from '../db.js';

export const modulesRouter = Router();

const ALLOWED_TABLES = [
  'facility_maintenance',
  'visitors',
  'transport',
  'assets',
  'vendors',
  'meeting_rooms',
  'gate_passes',
  'housekeeping',
  'utilities_energy',
  'documents'
];

function sanitizeTable(name) {
  const normalized = name.replace(/-/g, '_').toLowerCase();
  if (ALLOWED_TABLES.includes(normalized)) {
    return normalized;
  }
  return null;
}

// GET /api/:module
modulesRouter.get('/:module', (req, res) => {
  const table = sanitizeTable(req.params.module);
  if (!table) {
    return res.status(404).json({ error: `Unknown module table: ${req.params.module}` });
  }

  try {
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
    const mapped = rows.map(r => {
      let parsedData = {};
      if (r.data) {
        try { parsedData = JSON.parse(r.data); } catch (e) {}
      }
      return { ...parsedData, ...r };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch ${table}`, details: err.message });
  }
});

// GET /api/:module/:id
modulesRouter.get('/:module/:id', (req, res) => {
  const table = sanitizeTable(req.params.module);
  if (!table) {
    return res.status(404).json({ error: `Unknown module table: ${req.params.module}` });
  }

  try {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: `Record not found in ${table}` });
    }
    let parsedData = {};
    if (row.data) {
      try { parsedData = JSON.parse(row.data); } catch (e) {}
    }
    res.json({ ...parsedData, ...row });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch record from ${table}`, details: err.message });
  }
});

// POST /api/:module
modulesRouter.post('/:module', (req, res) => {
  const table = sanitizeTable(req.params.module);
  if (!table) {
    return res.status(404).json({ error: `Unknown module table: ${req.params.module}` });
  }

  try {
    const body = req.body || {};
    const id = body.id || `REC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const status = body.status || 'Active';

    // Insert generic row with data JSON column
    const insertStmt = db.prepare(`
      INSERT INTO ${table} (id, status, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, status, JSON.stringify(body), now, now);
    res.status(201).json({ id, ...body, status, created_at: now, updated_at: now });
  } catch (err) {
    res.status(400).json({ error: `Failed to create record in ${table}`, details: err.message });
  }
});

// PUT /api/:module/:id
modulesRouter.put('/:module/:id', (req, res) => {
  const table = sanitizeTable(req.params.module);
  if (!table) {
    return res.status(404).json({ error: `Unknown module table: ${req.params.module}` });
  }

  try {
    const id = req.params.id;
    const body = req.body || {};
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);

    if (!existing) {
      return res.status(404).json({ error: `Record ${id} not found in ${table}` });
    }

    const now = new Date().toISOString();
    let currentData = {};
    if (existing.data) {
      try { currentData = JSON.parse(existing.data); } catch (e) {}
    }
    const merged = { ...currentData, ...body };

    const updateStmt = db.prepare(`
      UPDATE ${table} SET
        status = ?,
        data = ?,
        updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(body.status || existing.status, JSON.stringify(merged), now, id);
    res.json({ id, ...merged, updated_at: now });
  } catch (err) {
    res.status(400).json({ error: `Failed to update record in ${table}`, details: err.message });
  }
});

// DELETE /api/:module/:id
modulesRouter.delete('/:module/:id', (req, res) => {
  const table = sanitizeTable(req.params.module);
  if (!table) {
    return res.status(404).json({ error: `Unknown module table: ${req.params.module}` });
  }

  try {
    const id = req.params.id;
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);

    if (!existing) {
      return res.status(404).json({ error: `Record ${id} not found in ${table}` });
    }

    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ message: `Record ${id} deleted from ${table}`, id });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete record from ${table}`, details: err.message });
  }
});
