import { Router } from 'express';
import { db } from '../db.js';

export const cafeteriaRouter = Router();

function toCamel(row) {
  if (!row) return null;
  const foodWastageKg = Number(row.wastage_kg) || 0;
  const mealType = row.meal_session || 'Lunch';
  return {
    id: row.id,
    date: row.date,
    mealType,
    mealSession: mealType,
    predictedHeadcount: Number(row.predicted_headcount) || 0,
    actualServed: Number(row.actual_served) || 0,
    foodWastageKg,
    wastageKg: foodWastageKg,
    contractorName: row.contractor_name || 'Campus Food Services',
    feedbackRating: Number(row.feedback_rating) || 4.0,
    specialMenu: row.special_menu || undefined,
    status: row.status || 'Completed',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/cafeteria
cafeteriaRouter.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM cafeteria ORDER BY date DESC, created_at DESC').all();
    res.json(rows.map(toCamel));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafeteria records', details: err.message });
  }
});

// GET /api/cafeteria/:id
cafeteriaRouter.get('/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Cafeteria record not found' });
    }
    res.json(toCamel(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafeteria record', details: err.message });
  }
});

// POST /api/cafeteria
cafeteriaRouter.post('/', (req, res) => {
  try {
    const body = req.body || {};
    const id = body.id || `CAF-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO cafeteria (
        id, date, meal_session, predicted_headcount, actual_served,
        wastage_kg, contractor_name, feedback_rating, special_menu,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      body.date || new Date().toISOString().split('T')[0],
      body.mealType || body.mealSession || 'Lunch',
      Number(body.predictedHeadcount) || 0,
      Number(body.actualServed) || 0,
      body.foodWastageKg !== undefined ? Number(body.foodWastageKg) : (Number(body.wastageKg) || 0),
      body.contractorName || 'Campus Food Services',
      Number(body.feedbackRating) || 4.5,
      body.specialMenu || null,
      body.status || 'Completed',
      body.createdAt || now,
      now
    );

    const created = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(id);
    res.status(201).json(toCamel(created));
  } catch (err) {
    res.status(400).json({ error: 'Failed to create cafeteria record', details: err.message });
  }
});

// PUT /api/cafeteria/:id
cafeteriaRouter.put('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const existing = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Cafeteria record not found' });
    }

    const now = new Date().toISOString();

    const updateStmt = db.prepare(`
      UPDATE cafeteria SET
        date = ?,
        meal_session = ?,
        predicted_headcount = ?,
        actual_served = ?,
        wastage_kg = ?,
        contractor_name = ?,
        feedback_rating = ?,
        special_menu = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `);

    const mealVal = body.mealType !== undefined ? body.mealType : (body.mealSession !== undefined ? body.mealSession : existing.meal_session);
    const wasteVal = body.foodWastageKg !== undefined ? Number(body.foodWastageKg) : (body.wastageKg !== undefined ? Number(body.wastageKg) : existing.wastage_kg);

    updateStmt.run(
      body.date !== undefined ? body.date : existing.date,
      mealVal,
      body.predictedHeadcount !== undefined ? Number(body.predictedHeadcount) : existing.predicted_headcount,
      body.actualServed !== undefined ? Number(body.actualServed) : existing.actual_served,
      wasteVal,
      body.contractorName !== undefined ? body.contractorName : existing.contractor_name,
      body.feedbackRating !== undefined ? Number(body.feedbackRating) : existing.feedback_rating,
      body.specialMenu !== undefined ? body.specialMenu : existing.special_menu,
      body.status !== undefined ? body.status : existing.status,
      now,
      id
    );

    const updated = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(id);
    res.json(toCamel(updated));
  } catch (err) {
    res.status(400).json({ error: 'Failed to update cafeteria record', details: err.message });
  }
});

// DELETE /api/cafeteria/:id
cafeteriaRouter.delete('/:id', (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Cafeteria record not found' });
    }

    db.prepare('DELETE FROM cafeteria WHERE id = ?').run(id);
    res.json({ message: `Record ${id} successfully deleted`, id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cafeteria record', details: err.message });
  }
});
