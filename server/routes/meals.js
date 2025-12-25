const express = require('express');
const Meal = require('../models/Meal');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get meal plan for a specific week
router.get('/', async (req, res) => {
  try {
    const { weekStart } = req.query;
    
    let startDate;
    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      // Get current week's Monday
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(today.setDate(diff));
    }
    
    // Set to start of day
    startDate.setHours(0, 0, 0, 0);

    let mealPlan = await Meal.findOne({ weekStartDate: startDate });
    
    if (!mealPlan) {
      // Create empty meal plan for the week
      mealPlan = new Meal({
        weekStartDate: startDate,
        meals: {
          monday: { breakfast: '', lunch: '', dinner: '' },
          tuesday: { breakfast: '', lunch: '', dinner: '' },
          wednesday: { breakfast: '', lunch: '', dinner: '' },
          thursday: { breakfast: '', lunch: '', dinner: '' },
          friday: { breakfast: '', lunch: '', dinner: '' },
          saturday: { breakfast: '', lunch: '', dinner: '' },
          sunday: { breakfast: '', lunch: '', dinner: '' }
        },
        lastUpdatedBy: 'system'
      });
      await mealPlan.save();
    }

    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update meal plan (admin only)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { weekStartDate, meals } = req.body;
    
    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);

    let mealPlan = await Meal.findOne({ weekStartDate: startDate });
    
    if (!mealPlan) {
      mealPlan = new Meal({
        weekStartDate: startDate,
        meals,
        lastUpdatedBy: req.admin.username
      });
    } else {
      mealPlan.meals = meals;
      mealPlan.lastUpdatedBy = req.admin.username;
    }

    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update specific meal (admin only)
router.patch('/:day/:mealType', authMiddleware, async (req, res) => {
  try {
    const { day, mealType } = req.params;
    const { meal, weekStartDate } = req.body;
    
    const startDate = new Date(weekStartDate);
    startDate.setHours(0, 0, 0, 0);

    let mealPlan = await Meal.findOne({ weekStartDate: startDate });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    if (!mealPlan.meals[day] || !mealPlan.meals[day].hasOwnProperty(mealType)) {
      return res.status(400).json({ message: 'Invalid day or meal type' });
    }

    mealPlan.meals[day][mealType] = meal;
    mealPlan.lastUpdatedBy = req.admin.username;
    mealPlan.markModified('meals');

    await mealPlan.save();
    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;