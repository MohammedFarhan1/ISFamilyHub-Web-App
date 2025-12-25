const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  weekStartDate: {
    type: Date,
    required: true
  },
  meals: {
    monday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    tuesday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    wednesday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    thursday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    friday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    saturday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    },
    sunday: {
      breakfast: { type: String, default: '' },
      lunch: { type: String, default: '' },
      dinner: { type: String, default: '' }
    }
  },
  lastUpdatedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

mealSchema.index({ weekStartDate: -1 });

module.exports = mongoose.model('Meal', mealSchema);