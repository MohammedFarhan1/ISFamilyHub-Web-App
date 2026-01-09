const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Groceries',
      'Transportation',
      'Utilities',
      'Healthcare',
      'Entertainment',
      'Shopping',
      'Education',
      'Bills',
      'Other'
    ]
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet']
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  },
  notes: {
    type: String,
    maxlength: 500
  },
  addedBy: {
    type: String,
    required: true
  },
  isReset: {
    type: Boolean,
    default: false
  },
  resetBy: {
    type: String
  },
  resetDate: {
    type: Date
  }
}, {
  timestamps: true
});

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ type: 1 });

module.exports = mongoose.model('Expense', expenseSchema);