import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const dbPath = path.join(dataDir, 'admin-ai.db');
export const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Cafeteria Table (Pilot Module)
  db.exec(`
    CREATE TABLE IF NOT EXISTS cafeteria (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      meal_session TEXT NOT NULL,
      predicted_headcount INTEGER DEFAULT 0,
      actual_served INTEGER DEFAULT 0,
      wastage_kg REAL DEFAULT 0.0,
      contractor_name TEXT DEFAULT 'Campus Food Services',
      feedback_rating REAL DEFAULT 4.0,
      special_menu TEXT,
      status TEXT DEFAULT 'Completed',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cafeteria_date ON cafeteria(date);
    CREATE INDEX IF NOT EXISTS idx_cafeteria_status ON cafeteria(status);
  `);

  // 2. Facility Maintenance Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS facility_maintenance (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      assigned_to TEXT,
      sla_hours INTEGER DEFAULT 4,
      status TEXT DEFAULT 'Open',
      reported_by TEXT,
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_facility_status ON facility_maintenance(status);
  `);

  // 3. Visitors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      host_employee TEXT,
      purpose TEXT,
      gate_number TEXT,
      status TEXT DEFAULT 'Expected',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
  `);

  // 4. Transport Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transport (
      id TEXT PRIMARY KEY,
      vehicle_number TEXT,
      driver_name TEXT,
      route TEXT,
      status TEXT DEFAULT 'Scheduled',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_transport_status ON transport(status);
  `);

  // 5. Assets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      tag TEXT,
      name TEXT NOT NULL,
      category TEXT,
      location TEXT,
      assigned_to TEXT,
      lifecycle_stage TEXT DEFAULT 'Allocated',
      status TEXT DEFAULT 'Active',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
  `);

  // 6. Vendors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      vendor_name TEXT NOT NULL,
      category TEXT,
      contact_person TEXT,
      amc_status TEXT DEFAULT 'Active',
      status TEXT DEFAULT 'Active',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
  `);

  // 7. Meeting Rooms Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_rooms (
      id TEXT PRIMARY KEY,
      room_name TEXT NOT NULL,
      floor TEXT,
      organizer TEXT,
      status TEXT DEFAULT 'Confirmed',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_meetings_status ON meeting_rooms(status);
  `);

  // 8. Gate Passes Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gate_passes (
      id TEXT PRIMARY KEY,
      pass_number TEXT,
      requester_name TEXT,
      approval_status TEXT DEFAULT 'Pending Approval',
      status TEXT DEFAULT 'Active',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_gate_passes_status ON gate_passes(status);
  `);

  // 9. Housekeeping Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS housekeeping (
      id TEXT PRIMARY KEY,
      area_zone TEXT NOT NULL,
      shift TEXT,
      assigned_staff TEXT,
      status TEXT DEFAULT 'Scheduled',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping(status);
  `);

  // 10. Utilities & Energy Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS utilities_energy (
      id TEXT PRIMARY KEY,
      meter_id TEXT NOT NULL,
      utility_type TEXT NOT NULL,
      daily_consumption REAL DEFAULT 0,
      estimated_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'Normal',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_utilities_status ON utilities_energy(status);
  `);

  // 11. Documents Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      file_name TEXT,
      status TEXT DEFAULT 'Active',
      data JSON,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
  `);

  // Admin Core Tables: users, roles, audit_logs, ai_activity, settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'Staff',
      status TEXT DEFAULT 'Active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL,
      permissions TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_activity (
      id TEXT PRIMARY KEY,
      agent_id TEXT,
      prompt TEXT,
      response TEXT,
      status TEXT DEFAULT 'Success',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  // Seed initial sample cafeteria data if empty
  const count = db.prepare('SELECT COUNT(*) as cnt FROM cafeteria').get().cnt;
  if (count === 0) {
    const seedStmt = db.prepare(`
      INSERT INTO cafeteria (
        id, date, meal_session, predicted_headcount, actual_served,
        wastage_kg, contractor_name, feedback_rating, special_menu,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    seedStmt.run(
      'CAF-101', '2026-09-23', 'Lunch', 450, 428, 4.2, 'Sodexo Facility Kitchen', 4.6, 'Paneer Tikka, Jeera Rice, Dal Tadka', 'Optimal', now, now
    );
    seedStmt.run(
      'CAF-102', '2026-09-23', 'Breakfast', 300, 310, 1.8, 'Sodexo Facility Kitchen', 4.7, 'Idli Sambhar, Poha, Fresh Juice', 'Optimal', now, now
    );
    seedStmt.run(
      'CAF-103', '2026-09-22', 'Dinner', 280, 210, 14.5, 'Sodexo Facility Kitchen', 3.8, 'Chapati, Mix Veg, Pulao', 'High Wastage Alert', now, now
    );
  }
}
