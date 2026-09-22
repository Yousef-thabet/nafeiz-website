const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadImageFile } = require('../middlewares/upload.middleware');
const { createAssetUpload } = require('../controllers/asset.controller');

const router = express.Router();
router.post('/upload', protect, authorize('admin'), uploadImageFile, createAssetUpload);
router.post('/upload-url', protect, authorize('admin'), uploadImageFile, createAssetUpload);

module.exports = router;