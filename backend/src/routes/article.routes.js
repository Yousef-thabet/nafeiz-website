const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { listArticles, getArticleBySlug, listAdminArticles, getAdminArticle, createArticle, updateArticle, updateArticleStatus, deleteArticle } = require('../controllers/article.controller');

const router = express.Router();

router.get('/', listArticles);
router.get('/admin', protect, authorize('admin'), listAdminArticles);
router.get('/admin/:id', protect, authorize('admin'), getAdminArticle);
router.post('/', protect, authorize('admin'), createArticle);
router.put('/:id', protect, authorize('admin'), updateArticle);
router.delete('/:id', protect, authorize('admin'), deleteArticle);
router.patch('/:id/status', protect, authorize('admin'), updateArticleStatus);
router.get('/:slug', getArticleBySlug);

module.exports = router;