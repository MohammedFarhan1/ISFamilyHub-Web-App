const express = require('express');
const MilkEntry = require('../models/MilkEntry');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Price mapping
const PRICE_MAP = {
  250: 12.50,
  500: 25.00,
  750: 37.50,
  1000: 50.00
};

// Get current cycle start date (10th of current or previous month)
const getCurrentCycleStart = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  let cycleStart = new Date(currentYear, currentMonth, 10);
  
  // If today is before 10th, cycle started last month
  if (today.getDate() < 10) {
    cycleStart = new Date(currentYear, currentMonth - 1, 10);
  }
  
  return cycleStart;
};

// Get milk entry for specific date
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    
    const entry = await MilkEntry.findOne({ date });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current cycle total
router.get('/cycle/current', async (req, res) => {
  try {
    const cycleStart = getCurrentCycleStart();
    
    const entries = await MilkEntry.find({
      cycleStartDate: cycleStart
    });
    
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    
    res.json({
      cycleStart,
      total,
      entryCount: entries.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get history for specific month
router.get('/history/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // JS months are 0-indexed
    
    const cycleStart = new Date(year, month, 10);
    
    const entries = await MilkEntry.find({
      cycleStartDate: cycleStart
    }).sort({ date: 1 });
    
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    
    res.json({
      entries,
      total,
      cycleStart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update milk entry (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { date, quantity } = req.body;
    
    if (!PRICE_MAP[quantity]) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }
    
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);
    
    const amount = PRICE_MAP[quantity];
    const cycleStart = getCurrentCycleStart();
    
    // Update existing or create new
    const entry = await MilkEntry.findOneAndUpdate(
      { date: entryDate },
      {
        quantity,
        amount,
        cycleStartDate: cycleStart,
        addedBy: req.admin.username
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;