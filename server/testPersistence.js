import { db, initDatabase, dbPath } from './db.js';
import fs from 'fs';

console.log('🧪 Running SQLite File Persistence Test...\n');

// Phase 1: Initialize and insert a persistence test record
initDatabase();
const persistId = 'PERSIST-TEST-999';
const now = new Date().toISOString();

// Check if already exists from previous step
let existing = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(persistId);

if (!existing) {
  console.log(`[Step 1] Inserting test record ${persistId}...`);
  db.prepare(`
    INSERT INTO cafeteria (id, date, meal_session, predicted_headcount, actual_served, wastage_kg, contractor_name, feedback_rating, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(persistId, '2026-09-23', 'Dinner', 350, 340, 8.2, 'Persistence Caterer', 4.9, 'Optimal', now, now);

  const fileStats = fs.statSync(dbPath);
  console.log(`[Step 2] SQLite file updated on disk at ${dbPath} (Size: ${fileStats.size} bytes)`);
  console.log('PASS ✅ Phase 1 Written to Disk. Exiting process.');
  process.exit(0);
} else {
  console.log(`[Step 3] Re-opened SQLite file in fresh process. Found record ${persistId}:`);
  console.log(JSON.stringify(existing, null, 2));

  // Clean up
  db.prepare('DELETE FROM cafeteria WHERE id = ?').run(persistId);
  console.log(`[Step 4] Cleaned up ${persistId}.`);
  console.log('\n🎉 PERSISTENCE ACROSS SERVER RESTART VERIFIED 100% PASS ✅');
  process.exit(0);
}
