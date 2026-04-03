const { getDb } = require('../config/database');
const SAFE = `id,name,email,role,status,created_at,updated_at`;

const UserModel = {
  async findById(id) {
    const db = await getDb();
    return db.get(`SELECT ${SAFE} FROM users WHERE id=?`, id);
  },
  async findByEmail(email) {
    const db = await getDb();
    return db.get(`SELECT * FROM users WHERE email=?`, email);
  },
  async findAll({ role, status, page=1, limit=20 } = {}) {
    const db = await getDb();
    const conditions = [], params = [];
    if (role)   { conditions.push(`role=?`);   params.push(role); }
    if (status) { conditions.push(`status=?`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page-1)*limit;
    const rows  = await db.all(`SELECT ${SAFE} FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, ...params, limit, offset);
    const total = (await db.get(`SELECT COUNT(*) as c FROM users ${where}`, ...params)).c;
    return { rows, total, page, limit };
  },
  async create({ name, email, password, role='viewer' }) {
    const db = await getDb();
    const r = await db.run(`INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)`, name, email, password, role);
    return this.findById(r.lastID);
  },
  async update(id, fields) {
    const db = await getDb();
    const allowed = ['name','role','status'];
    const pairs = Object.keys(fields).filter(k => allowed.includes(k)).map(k => `${k}=?`);
    if (!pairs.length) return this.findById(id);
    pairs.push(`updated_at=datetime('now')`);
    const vals = Object.entries(fields).filter(([k]) => allowed.includes(k)).map(([,v]) => v);
    await db.run(`UPDATE users SET ${pairs.join(',')} WHERE id=?`, ...vals, id);
    return this.findById(id);
  },
  async delete(id) {
    const db = await getDb();
    return db.run(`DELETE FROM users WHERE id=?`, id);
  }
};
module.exports = UserModel;
