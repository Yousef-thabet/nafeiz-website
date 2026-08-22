const express = require('express');
const {
  listProducts,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', listProducts);
router.get('/slug/:slug/related', getRelatedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.patch('/:id/toggle-visibility', protect, authorize('admin'), toggleProductVisibility);

module.exports = router;

