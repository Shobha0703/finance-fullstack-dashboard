const { getDb } = require('../config/database');

const RecordModel = {
  async findById(id) {
    const db = await getDb();
    return db.get(`SELECT r.*,u.name as created_by_name FROM records r JOIN users u ON u.id=r.created_by WHERE r.id=? AND r.deleted_at IS NULL`, id);
  },
  async findAll({ type, category, startDate, endDate, page=1, limit=20 } = {}) {
    const db = await getDb();
    const conditions = [`r.deleted_at IS NULL`], params = [];
    if (type)      { conditions.push(`r.type=?`);      params.push(type); }
    if (category)  { conditions.push(`r.category=?`);  params.push(category); }
    if (startDate) { conditions.push(`r.date>=?`);     params.push(startDate); }
    if (endDate)   { conditions.push(`r.date<=?`);     params.push(endDate); }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const offset = (page-1)*limit;
    const rows  = await db.all(`SELECT r.*,u.name as created_by_name FROM records r JOIN users u ON u.id=r.created_by ${where} ORDER BY r.date DESC,r.created_at DESC LIMIT ? OFFSET ?`, ...params, limit, offset);
    const total = (await db.get(`SELECT COUNT(*) as c FROM records r ${where}`, ...params)).c;
    return { rows, total, page, limit };
  },
  async create({ amount, type, category, date, notes, created_by }) {
    const db = await getDb();
    const r = await db.run(`INSERT INTO records (amount,type,category,date,notes,created_by) VALUES (?,?,?,?,?,?)`, amount, type, category, date, notes||null, created_by);
    return this.findById(r.lastID);
  },
  async update(id, fields) {
    const db = await getDb();
    const ex = await this.findById(id);
    if (!ex) return null;
    await db.run(`UPDATE records SET amount=?,type=?,category=?,date=?,notes=?,updated_at=datetime('now') WHERE id=? AND deleted_at IS NULL`,
      fields.amount??ex.amount, fields.type??ex.type, fields.category??ex.category,
      fields.date??ex.date, fields.notes!==undefined?fields.notes:ex.notes, id);
    return this.findById(id);
  },
  async softDelete(id) {
    const db = await getDb();
    return db.run(`UPDATE records SET deleted_at=datetime('now') WHERE id=? AND deleted_at IS NULL`, id);
  }
};
module.exports = RecordModel;
