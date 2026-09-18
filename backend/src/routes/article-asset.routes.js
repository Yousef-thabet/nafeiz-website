const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createAssetUpload } = require('../controllers/asset.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
router.post('/upload-url', protect, authorize('admin'), upload.single('file'), (req, res, next) => {
	req.body = { ...req.body, entity: 'articles' };
	return createAssetUpload(req, res, next);
});

module.exports = router;