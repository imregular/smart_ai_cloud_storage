const express = require('express');
const { uploadImage, getUserImages, serveImage, searchImages } = require('../controllers/image.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Search images (Protected) - Place BEFORE /:id to prevent collision
router.get('/search', authenticateToken, searchImages);

// Upload images (Protected)
// 'images' is the field name in the form-data, max 10 files
router.post('/upload', authenticateToken, upload.array('images', 10), uploadImage);

// Get user images (Protected)
router.get('/', authenticateToken, getUserImages);

// Serve image file (Protected)
router.get('/:id/file', authenticateToken, serveImage);

module.exports = router;
