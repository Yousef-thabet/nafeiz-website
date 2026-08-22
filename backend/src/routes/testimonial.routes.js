const express = require('express');
const { 
  listTestimonials, 
  getAllTestimonials, 
  getTestimonial, 
  createTestimonial, 
  updateTestimonial, 
  deleteTestimonial 
} = require('../controllers/testimonial.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Admin endpoints (must come before /:id route)
router.get('/admin/all', protect, authorize('admin'), getAllTestimonials);

// Public endpoints
router.get('/', listTestimonials);
router.get('/:id', getTestimonial);

// Admin CRUD endpoints
router.post('/', protect, authorize('admin'), createTestimonial);
router.put('/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

module.exports = router;
