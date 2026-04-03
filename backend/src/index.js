const { initDb } = require('./config/database');
const app = require('./app');
const PORT = process.env.PORT || 5000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 API running → http://localhost:${PORT}/api`);
  });
}).catch(err => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
