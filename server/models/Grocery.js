const mongoose = require('mongoose');

const grocerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Fruits & Vegetables',
      'Dairy & Eggs',
      'Meat & Seafood',
      'Pantry',
      'Snacks',
      'Beverages',
      'Frozen',
      'Household',
      'Personal Care',
      'Other'
    ]
  },
  isPurchased: {
    type: Boolean,
    default: false
  },
  purchasedDate: {
    type: Date
  },
  addedBy: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

grocerySchema.index({ isPurchased: 1 });
grocerySchema.index({ category: 1 });

module.exports = mongoose.model('Grocery', grocerySchema);