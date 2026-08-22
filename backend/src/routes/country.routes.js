const express = require('express');
const {
  listCountries,
  getCountry,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryVisibility,
} = require('../controllers/country.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', listCountries);
router.get('/slug/:slug', getCountryBySlug);
router.get('/:id', getCountry);

// Admin routes
router.post('/', protect, authorize('admin'), createCountry);
router.put('/:id', protect, authorize('admin'), updateCountry);
router.delete('/:id', protect, authorize('admin'), deleteCountry);
router.patch('/:id/toggle-visibility', protect, authorize('admin'), toggleCountryVisibility);

module.exports = router;

