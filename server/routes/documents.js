const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 16 * 1024 * 1024 // 16MB limit for GridFS
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Initialize GridFS
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'documents'
  });
});

// Get all documents with filtering
router.get('/', async (req, res) => {
  try {
    const { ownerName, documentType, search, expiringIn } = req.query;
    const filter = { isArchived: false };
    
    if (ownerName) filter.ownerName = ownerName;
    if (documentType) filter.documentType = documentType;
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (expiringIn) {
      const days = parseInt(expiringIn);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      filter.expiryDate = { $lte: futureDate, $gte: new Date() };
    }

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document (admin only)
router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file ? req.file.originalname : 'No file',
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, ownerName } = req.body;

    if (!title || !ownerName) {
      return res.status(400).json({ message: 'Title and owner name are required' });
    }

    // Upload to GridFS
    const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
      metadata: {
        title,
        ownerName,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        uploadedBy: req.admin.username,
        uploadDate: new Date()
      }
    });

    const fileId = await new Promise((resolve, reject) => {
      uploadStream.end(req.file.buffer);
      uploadStream.on('finish', () => resolve(uploadStream.id));
      uploadStream.on('error', reject);
    });

    const document = new Document({
      title,
      ownerName,
      fileId: fileId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.admin.username
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update document metadata (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, ownerName, documentType, expiryDate, notes } = req.body;
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title,
        ownerName,
        documentType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Archive document (admin only)
router.patch('/:id/archive', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download document
router.get('/download/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const downloadStream = gfsBucket.openDownloadStream(document.fileId);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`
    });

    downloadStream.pipe(res);
    downloadStream.on('error', () => {
      res.status(404).json({ message: 'File not found' });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete document (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from GridFS
    await gfsBucket.delete(document.fileId);

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expiring documents
router.get('/expiring', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringDocs = await Document.find({
      expiryDate: { $lte: futureDate, $gte: new Date() },
      isArchived: false
    }).sort({ expiryDate: 1 });

    res.json(expiringDocs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;