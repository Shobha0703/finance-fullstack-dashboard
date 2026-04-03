const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/finance.db');

let _db = null;

async function getDb() {
  if (_db) return _db;
  const { open } = require('sqlite');
  const sqlite3 = require('sqlite3');
  if (DB_PATH !== ':memory:') {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  _db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await _db.exec('PRAGMA foreign_keys = ON');
  return _db;
}

function resetDb() { _db = null; }

async function initDb() {
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'viewer' CHECK(role IN ('viewer','analyst','admin')),
      status     TEXT NOT NULL DEFAULT 'active'  CHECK(status IN ('active','inactive')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS records (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      amount     REAL NOT NULL CHECK(amount > 0),
      type       TEXT NOT NULL CHECK(type IN ('income','expense')),
      category   TEXT NOT NULL,
      date       TEXT NOT NULL,
      notes      TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      deleted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_records_date     ON records(date);
    CREATE INDEX IF NOT EXISTS idx_records_type     ON records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category ON records(category);
    CREATE INDEX IF NOT EXISTS idx_records_deleted  ON records(deleted_at);
  `);

  const adminExists = await db.get(`SELECT id FROM users WHERE role='admin' LIMIT 1`);
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    await db.run(
      `INSERT INTO users (name,email,password,role) VALUES ('Admin User','admin@finance.dev',?,'admin')`,
      hash
    );
    console.log('✅ Admin seeded → admin@finance.dev / admin123');
  }
  return db;
}

module.exports = { getDb, initDb, resetDb };
