const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Appliances',
      'Furniture',
      'Clothing',
      'Books',
      'Documents',
      'Tools',
      'Kitchen',
      'Bathroom',
      'Bedroom',
      'Storage',
      'Other'
    ]
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 300
  },
  addedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

inventorySchema.index({ name: 'text', description: 'text', location: 'text' });
inventorySchema.index({ category: 1 });
inventorySchema.index({ location: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);