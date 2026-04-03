const router = require('express').Router();
const { body, query, param } = require('express-validator');
const RecordModel = require('../models/record.model');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/',
  [query('type').optional().isIn(['income','expense']), query('category').optional().trim(),
   query('startDate').optional().isISO8601(), query('endDate').optional().isISO8601(),
   query('page').optional().isInt({min:1}).toInt(), query('limit').optional().isInt({min:1,max:100}).toInt()],
  validate,
  async (req, res) => res.json(await RecordModel.findAll(req.query))
);

router.get('/:id', [param('id').isInt({min:1}).toInt()], validate,
  async (req, res) => {
    const r = await RecordModel.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Record not found' });
    res.json(r);
  }
);

router.post('/', authorize('admin'),
  [body('amount').isFloat({gt:0}), body('type').isIn(['income','expense']),
   body('category').trim().notEmpty(), body('date').isISO8601(), body('notes').optional().trim()],
  validate,
  async (req, res) => res.status(201).json(await RecordModel.create({ ...req.body, created_by: req.user.id }))
);

router.patch('/:id', authorize('admin'),
  [param('id').isInt({min:1}).toInt(), body('amount').optional().isFloat({gt:0}),
   body('type').optional().isIn(['income','expense']), body('category').optional().trim().notEmpty(),
   body('date').optional().isISO8601(), body('notes').optional().trim()],
  validate,
  async (req, res) => {
    const r = await RecordModel.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Record not found' });
    res.json(await RecordModel.update(req.params.id, req.body));
  }
);

router.delete('/:id', authorize('admin'), [param('id').isInt({min:1}).toInt()], validate,
  async (req, res) => {
    const r = await RecordModel.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Record not found' });
    await RecordModel.softDelete(req.params.id);
    res.json({ message: 'Record deleted' });
  }
);

module.exports = router;
