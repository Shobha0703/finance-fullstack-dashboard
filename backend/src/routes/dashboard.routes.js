const router = require('express').Router();
const { query } = require('express-validator');
const DashboardService = require('../services/dashboard.service');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate, authorize('analyst','admin'));

router.get('/summary', async (req,res) => res.json(await DashboardService.getSummary()));
router.get('/categories', async (req,res) => res.json(await DashboardService.getCategoryTotals()));
router.get('/monthly',
  [query('months').optional().isInt({min:1,max:60}).toInt()], validate,
  async (req,res) => res.json(await DashboardService.getMonthlyTrends({ months: req.query.months }))
);
router.get('/weekly',
  [query('weeks').optional().isInt({min:1,max:52}).toInt()], validate,
  async (req,res) => res.json(await DashboardService.getWeeklyTrends({ weeks: req.query.weeks }))
);
router.get('/recent',
  [query('limit').optional().isInt({min:1,max:50}).toInt()], validate,
  async (req,res) => res.json(await DashboardService.getRecentActivity({ limit: req.query.limit }))
);

module.exports = router;
