const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');
const { expenseSchema } = require('../utils/validation');

const router = express.Router();

// Get all expenses with filtering and analytics
router.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      type,
      paymentMethod,
      minAmount,
      maxAmount,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const analytics = await Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { date: { $gte: startDate }, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const monthlyTrend = await Expense.aggregate([
      { $match: { date: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    res.json({
      summary: analytics,
      categoryBreakdown,
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create expense (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = expenseSchema.parse(req.body);
    
    const expense = new Expense({
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date) : new Date(),
      addedBy: req.admin.username
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expense (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validatedData = expenseSchema.parse(req.body);
    
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { ...validatedData, date: new Date(validatedData.date) },
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;