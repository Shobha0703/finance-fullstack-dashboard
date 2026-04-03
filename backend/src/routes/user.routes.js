const router = require('express').Router();
const { body, query, param } = require('express-validator');
const UserModel = require('../models/user.model');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', authorize('admin'),
  [query('role').optional().isIn(['viewer','analyst','admin']), query('status').optional().isIn(['active','inactive']),
   query('page').optional().isInt({min:1}).toInt(), query('limit').optional().isInt({min:1,max:100}).toInt()],
  validate,
  async (req, res) => res.json(await UserModel.findAll(req.query))
);

router.get('/:id', authorize('admin'), [param('id').isInt({min:1}).toInt()], validate,
  async (req, res) => {
    const u = await UserModel.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(u);
  }
);

router.patch('/:id', authorize('admin'),
  [param('id').isInt({min:1}).toInt(), body('name').optional().trim().notEmpty(),
   body('role').optional().isIn(['viewer','analyst','admin']), body('status').optional().isIn(['active','inactive'])],
  validate,
  async (req, res) => {
    if (req.params.id === req.user.id && req.body.role && req.body.role!=='admin')
      return res.status(400).json({ error: 'Cannot change your own role' });
    const u = await UserModel.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(await UserModel.update(req.params.id, req.body));
  }
);

router.delete('/:id', authorize('admin'), [param('id').isInt({min:1}).toInt()], validate,
  async (req, res) => {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    const u = await UserModel.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    await UserModel.delete(req.params.id);
    res.json({ message: 'User deleted' });
  }
);

module.exports = router;
