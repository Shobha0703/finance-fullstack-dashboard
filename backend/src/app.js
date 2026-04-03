const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15*60*1000, max: 200, standardHeaders: true, legacyHeaders: false }));

app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/users',     require('./routes/user.routes'));
app.use('/api/records',   require('./routes/record.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.get('/api/health', (req,res) => res.json({ status:'ok', timestamp: new Date().toISOString() }));
app.use((req,res) => res.status(404).json({ error:`${req.method} ${req.path} not found` }));
app.use(errorHandler);

module.exports = app;
