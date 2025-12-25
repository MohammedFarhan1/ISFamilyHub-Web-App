const express = require('express');
const Grocery = require('../models/Grocery');
const authMiddleware = require('../middleware/auth');
const { grocerySchema } = require('../utils/validation');

const router = express.Router();

// Get all groceries
router.get('/', async (req, res) => {
  try {
    const { category, purchased } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (purchased !== undefined) filter.isPurchased = purchased === 'true';

    const groceries = await Grocery.find(filter).sort({ 
      isPurchased: 1, 
      priority: -1, 
      createdAt: -1 
    });
    
    res.json(groceries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create grocery item (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = grocerySchema.parse(req.body);
    
    const grocery = new Grocery({
      ...validatedData,
      addedBy: req.admin.username
    });

    await grocery.save();
    res.status(201).json(grocery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update grocery item (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validatedData = grocerySchema.parse(req.body);
    
    const grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );

    if (!grocery) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }

    res.json(grocery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle purchased status (admin only)
router.patch('/:id/toggle-purchased', authMiddleware, async (req, res) => {
  try {
    const grocery = await Grocery.findById(req.params.id);
    
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }

    grocery.isPurchased = !grocery.isPurchased;
    grocery.purchasedDate = grocery.isPurchased ? new Date() : null;

    await grocery.save();
    res.json(grocery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear purchased items (admin only)
router.delete('/purchased', authMiddleware, async (req, res) => {
  try {
    await Grocery.deleteMany({ isPurchased: true });
    res.json({ message: 'Purchased items cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete grocery item (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndDelete(req.params.id);
    
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }

    res.json({ message: 'Grocery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;