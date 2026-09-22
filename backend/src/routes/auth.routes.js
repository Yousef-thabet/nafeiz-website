const express = require('express');
const { login, refresh, logout, createEmployee, listEmployees, updateEmployee, deleteEmployee, updateProfile } = require('../controllers/auth.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.put('/profile', protect, authorize('admin', 'employee'), updateProfile);
router.get('/employees', protect, authorize('admin'), listEmployees);
router.post('/employees', protect, authorize('admin'), createEmployee);
router.put('/employees/:id', protect, authorize('admin'), updateEmployee);
router.delete('/employees/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;
