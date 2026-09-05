const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { createAssetUpload } = require('../controllers/asset.controller');

const router = express.Router();
router.post('/upload-url', protect, authorize('admin'), (req, res, next) => {
	req.body = { ...req.body, entity: 'articles' };
	return createAssetUpload(req, res, next);
});

module.exports = router;