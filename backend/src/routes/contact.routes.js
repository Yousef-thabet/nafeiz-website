const express = require('express');
const { createContact, listContacts, getContact, addNote, updateStatus, assignContact } = require('../controllers/contact.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', createContact);
router.get('/', protect, authorize('admin', 'employee'), listContacts);
router.get('/:id', protect, authorize('admin', 'employee'), getContact);
router.post('/:id/note', protect, authorize('admin', 'employee'), addNote);
router.put('/:id/status', protect, authorize('admin', 'employee'), updateStatus);
router.put('/:id/assign', protect, authorize('admin'), assignContact);

module.exports = router;
