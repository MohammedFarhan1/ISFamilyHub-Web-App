const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  recurringType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  category: {
    type: String,
    required: true,
    enum: ['Utilities', 'Internet', 'Mobile', 'Insurance', 'Rent', 'Loan', 'Other']
  },
  notes: {
    type: String,
    maxlength: 300
  }
}, {
  timestamps: true
});

billSchema.index({ dueDate: 1 });
billSchema.index({ isPaid: 1 });

module.exports = mongoose.model('Bill', billSchema);