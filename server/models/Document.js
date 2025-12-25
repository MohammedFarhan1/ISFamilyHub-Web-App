const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  ownerName: {
    type: String,
    required: true,
    enum: ['Sirazdeen', 'Rahima Banu', 'Shafan & Sheerin', 'Irfan', 'Farhan']
  },
  documentType: {
    type: String,
    enum: [
      'ID Document',
      'Passport',
      'Insurance',
      'Medical',
      'Financial',
      'Legal',
      'Property',
      'Education',
      'Employment',
      'Other'
    ]
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  uploadedBy: {
    type: String,
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

documentSchema.index({ ownerName: 1 });
documentSchema.index({ documentType: 1 });
documentSchema.index({ expiryDate: 1 });
documentSchema.index({ title: 'text', notes: 'text' });

module.exports = mongoose.model('Document', documentSchema);