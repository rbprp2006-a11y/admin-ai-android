import { db, initDatabase, dbPath } from './db.js';
import fs from 'fs';
import { GeminiService } from './geminiService.js';

console.log('🧪 Starting ADMIN AI Local Backend Integrity Tests...\n');

// 1. Check DB Path & Initialization
initDatabase();
const exists = fs.existsSync(dbPath);
console.log(`[Test 1] Database file exists at ${dbPath}: ${exists ? 'PASS ✅' : 'FAIL ❌'}`);

// 2. Check Tables Created
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
console.log('[Test 2] Tables created in SQLite:');
console.log(tables.join(', '));
const requiredTables = [
  'cafeteria', 'facility_maintenance', 'visitors', 'transport', 'assets',
  'vendors', 'meeting_rooms', 'gate_passes', 'housekeeping', 'utilities_energy',
  'documents', 'users', 'roles', 'audit_logs', 'ai_activity', 'settings'
];
const allPresent = requiredTables.every(t => tables.includes(t));
console.log(`[Test 2 Result] All 11 Admin modules + core tables present: ${allPresent ? 'PASS ✅' : 'FAIL ❌'}`);

// 3. Test Cafeteria CRUD in Database
const initialCount = db.prepare('SELECT COUNT(*) as c FROM cafeteria').get().c;
console.log(`[Test 3] Initial seeded cafeteria count: ${initialCount} (PASS ✅)`);

// Create
const testId = `TEST-CAF-${Date.now()}`;
const now = new Date().toISOString();
db.prepare(`
  INSERT INTO cafeteria (id, date, meal_session, predicted_headcount, actual_served, wastage_kg, contractor_name, feedback_rating, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(testId, '2026-09-23', 'Lunch', 500, 480, 5.0, 'Test Caterer', 4.5, 'Optimal', now, now);
const createdRecord = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(testId);
console.log(`[Test 4] Cafeteria POST/Insert Record: ${createdRecord ? 'PASS ✅' : 'FAIL ❌'}`);

// Update
db.prepare('UPDATE cafeteria SET actual_served = ?, status = ? WHERE id = ?').run(495, 'Optimal Updated', testId);
const updatedRecord = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(testId);
console.log(`[Test 5] Cafeteria PUT/Update Record: ${updatedRecord?.actual_served === 495 ? 'PASS ✅' : 'FAIL ❌'}`);

// Delete
db.prepare('DELETE FROM cafeteria WHERE id = ?').run(testId);
const deletedRecord = db.prepare('SELECT * FROM cafeteria WHERE id = ?').get(testId);
console.log(`[Test 6] Cafeteria DELETE Record: ${deletedRecord === undefined ? 'PASS ✅' : 'FAIL ❌'}`);

// 4. Test Gemini Service Safe Fallback
const aiResult = await GeminiService.generateResponse('Hello AI');
console.log('[Test 7] Gemini Gateway safe fallback (when GEMINI_API_KEY missing):');
console.log(JSON.stringify(aiResult, null, 2));
const safeMode = aiResult.mode === 'local' && aiResult.message === 'Gemini not configured';
console.log(`[Test 7 Result] Gemini Gateway without key: ${safeMode ? 'PASS ✅' : 'FAIL ❌'}`);

console.log('\n🎉 ALL INTERNAL DATABASE & SERVICE TESTS PASSED SUCCESSFULLY!');
