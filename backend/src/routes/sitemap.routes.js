const express = require('express');
const { sitemap } = require('../controllers/article.controller');

const router = express.Router();
router.get('/', sitemap);

module.exports = router;