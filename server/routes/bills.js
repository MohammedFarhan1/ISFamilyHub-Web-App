const express = require('express');
const Bill = require('../models/Bill');
const authMiddleware = require('../middleware/auth');
const { billSchema } = require('../utils/validation');

const router = express.Router();

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ dueDate: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create bill (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const validatedData = billSchema.parse(req.body);
    
    const bill = new Bill({
      ...validatedData,
      dueDate: new Date(validatedData.dueDate)
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bill (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const validatedData = billSchema.parse(req.body);
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { ...validatedData, dueDate: new Date(validatedData.dueDate) },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark bill as paid/unpaid (admin only)
router.patch('/:id/toggle-paid', authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    bill.isPaid = !bill.isPaid;
    bill.paidDate = bill.isPaid ? new Date() : null;

    // If marking as paid and it's recurring, create next bill
    if (bill.isPaid && bill.isRecurring) {
      const nextDueDate = new Date(bill.dueDate);
      
      if (bill.recurringType === 'monthly') {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      } else if (bill.recurringType === 'quarterly') {
        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      } else if (bill.recurringType === 'yearly') {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      }

      const nextBill = new Bill({
        name: bill.name,
        dueDate: nextDueDate,
        amount: bill.amount,
        isRecurring: bill.isRecurring,
        recurringType: bill.recurringType,
        category: bill.category,
        notes: bill.notes
      });

      await nextBill.save();
    }

    await bill.save();
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete bill (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;