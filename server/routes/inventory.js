const express = require('express');
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/auth');
const { inventorySchema } = require('../utils/validation');

const router = express.Router();

// Get all inventory items with search and filtering
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    
    if (search) {
      filter.$text = { $search: search };
    }

    const items = await Inventory.find(filter).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unique locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Inventory.distinct('location');
    res.json(locations.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create inventory item (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = inventorySchema.parse(req.body);
    
    const item = new Inventory({
      ...validatedData,
      addedBy: req.admin.username
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update inventory item (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validatedData = inventorySchema.parse(req.body);
    
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete inventory item (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;