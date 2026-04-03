const router = require('express').Router();
const { body } = require('express-validator');
const AuthService = require('../services/auth.service');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.post('/register',
  [body('name').trim().notEmpty(), body('email').isEmail().normalizeEmail(),
   body('password').isLength({min:6}), body('role').optional().isIn(['viewer','analyst','admin'])],
  validate,
  async (req, res, next) => {
    try { res.status(201).json({ message: 'Registered', user: await AuthService.register(req.body) }); }
    catch(e) { next(e); }
  }
);

router.post('/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req, res, next) => {
    try { res.json(await AuthService.login(req.body)); }
    catch(e) { next(e); }
  }
);

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
