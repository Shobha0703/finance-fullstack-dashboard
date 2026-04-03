const { getDb } = require('../config/database');

const DashboardService = {
  async getSummary() {
    const db = await getDb();
    const t = await db.get(`
      SELECT
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expenses,
        COUNT(*) AS total_records
      FROM records WHERE deleted_at IS NULL`);
    t.net_balance = (t.total_income||0) - (t.total_expenses||0);
    return t;
  },
  async getCategoryTotals() {
    const db = await getDb();
    return db.all(`SELECT category,type,SUM(amount) AS total,COUNT(*) AS count FROM records WHERE deleted_at IS NULL GROUP BY category,type ORDER BY total DESC`);
  },
  async getMonthlyTrends({ months=12 }={}) {
    const db = await getDb();
    return db.all(`
      SELECT strftime('%Y-%m',date) AS month,
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses,
        SUM(CASE WHEN type='income'  THEN amount ELSE -amount END) AS net
      FROM records WHERE deleted_at IS NULL AND date>=date('now',? || ' months')
      GROUP BY month ORDER BY month ASC`, `-${months}`);
  },
  async getRecentActivity({ limit=10 }={}) {
    const db = await getDb();
    return db.all(`SELECT r.id,r.amount,r.type,r.category,r.date,r.notes,u.name AS created_by FROM records r JOIN users u ON u.id=r.created_by WHERE r.deleted_at IS NULL ORDER BY r.created_at DESC LIMIT ?`, limit);
  },
  async getWeeklyTrends({ weeks=8 }={}) {
    const db = await getDb();
    return db.all(`
      SELECT strftime('%Y-W%W',date) AS week,
        SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses
      FROM records WHERE deleted_at IS NULL AND date>=date('now',? || ' days')
      GROUP BY week ORDER BY week ASC`, -(weeks*7));
  }
};
module.exports = DashboardService;
