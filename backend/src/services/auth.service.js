const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');
const { JWT_SECRET } = require('../middleware/auth');

const AuthService = {
  async register({ name, email, password, role }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) { const e = new Error('Email already registered'); e.status=409; throw e; }
    const hashed = await bcrypt.hash(password, 10);
    return UserModel.create({ name, email, password: hashed, role });
  },
  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) { const e = new Error('Invalid email or password'); e.status=401; throw e; }
    if (user.status==='inactive') { const e = new Error('Account is inactive'); e.status=403; throw e; }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { const e = new Error('Invalid email or password'); e.status=401; throw e; }
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }
};
module.exports = AuthService;
