const mongoose = require('mongoose');

const milkEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    enum: [250, 500, 750, 1000]
  },
  amount: {
    type: Number,
    required: true
  },
  cycleStartDate: {
    type: Date,
    required: true
  },
  addedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

milkEntrySchema.index({ date: 1 });
milkEntrySchema.index({ cycleStartDate: 1 });

module.exports = mongoose.model('MilkEntry', milkEntrySchema);