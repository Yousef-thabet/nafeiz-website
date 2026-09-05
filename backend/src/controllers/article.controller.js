const prisma = require('../config/db');
const sanitizeHtml = require('sanitize-html');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { articleSchema, articleUpdateSchema } = require('../validators/article.validator');
const { publicSiteUrl } = require('../config/env');

const LANGUAGES = ['ar', 'en', 'zh', 'ru'];
const CONTENT_FIELDS = ['titleL10n', 'descriptionL10n', 'contentL10n', 'metaTitleL10n', 'metaDescriptionL10n', 'featuredImageAltL10n'];

function parseLocalized(value) {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeLocalized(value) {
  const parsed = parseLocalized(value);
  return JSON.stringify(Object.fromEntries(LANGUAGES.map((language) => {
    const content = String(parsed[language] || '');
    return [language, sanitizeHtml(content, {
      allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr'],
      allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'] },
      allowedSchemes: ['http', 'https'],
      allowedSchemesByTag: { img: ['http', 'https'] },
      transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }) },
    })];
  })));
}

function hasAllRequiredTranslations(data) {
  return ['titleL10n', 'descriptionL10n', 'contentL10n'].every((field) => {
    const values = parseLocalized(data[field]);
    return LANGUAGES.every((language) => String(values[language] || '').trim());
  });
}

function serializeArticle(article) {
  return {
    ...article,
    titleL10n: parseLocalized(article.titleL10n),
    descriptionL10n: parseLocalized(article.descriptionL10n),
    contentL10n: parseLocalized(article.contentL10n),
    metaTitleL10n: parseLocalized(article.metaTitleL10n),
    metaDescriptionL10n: parseLocalized(article.metaDescriptionL10n),
    featuredImageAltL10n: parseLocalized(article.featuredImageAltL10n),
  };
}

const articleInclude = { author: { select: { id: true, name: true } }, assets: true };

const listArticles = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const where = { status: 'published' };
    const [articles, total] = await prisma.$transaction([
      prisma.article.findMany({ where, include: articleInclude, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.article.count({ where }),
    ]);
    return sendSuccess(res, 'Articles fetched', { articles: articles.map(serializeArticle), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await prisma.article.findFirst({ where: { slug: req.params.slug, status: 'published' }, include: articleInclude });
    if (!article) return sendError(res, 'Article not found', [], 404);
    return sendSuccess(res, 'Article fetched', { article: serializeArticle(article) });
  } catch (error) { next(error); }
};

const listAdminArticles = async (req, res, next) => {
  try {
    const articles = await prisma.article.findMany({ include: articleInclude, orderBy: { updatedAt: 'desc' } });
    return sendSuccess(res, 'Articles fetched', { articles: articles.map(serializeArticle) });
  } catch (error) { next(error); }
};

const getAdminArticle = async (req, res, next) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: req.params.id }, include: articleInclude });
    if (!article) return sendError(res, 'Article not found', [], 404);
    return sendSuccess(res, 'Article fetched', { article: serializeArticle(article) });
  } catch (error) { next(error); }
};

const createArticle = async (req, res, next) => {
  try {
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Invalid article payload', formatValidationErrors(parsed.error.issues), 400);
    const data = parsed.data;
    if (data.status === 'published' && !hasAllRequiredTranslations(data)) return sendError(res, 'All title, description, and content translations are required before publishing', [], 400);
    if (await prisma.article.findUnique({ where: { slug: data.slug } })) return sendError(res, 'Article with this slug already exists', [{ path: ['slug'], message: 'Slug must be unique' }], 409);
    const article = await prisma.article.create({
      data: {
        ...data,
        ...Object.fromEntries(CONTENT_FIELDS.map((field) => [field, normalizeLocalized(data[field])])),
        publishedAt: data.status === 'published' ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
        authorId: req.user.id,
      },
      include: articleInclude,
    });
    return sendSuccess(res, 'Article created', { article: serializeArticle(article) }, 201);
  } catch (error) { next(error); }
};

const updateArticle = async (req, res, next) => {
  try {
    const parsed = articleUpdateSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Invalid article payload', formatValidationErrors(parsed.error.issues), 400);
    const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!existing) return sendError(res, 'Article not found', [], 404);
    const data = parsed.data;
    if (data.slug && data.slug !== existing.slug && await prisma.article.findUnique({ where: { slug: data.slug } })) return sendError(res, 'Article with this slug already exists', [], 409);
    const nextStatus = data.status || existing.status;
    if (nextStatus === 'published' && !hasAllRequiredTranslations({ ...existing, ...data })) return sendError(res, 'All title, description, and content translations are required before publishing', [], 400);
    const updateData = { ...data };
    CONTENT_FIELDS.forEach((field) => { if (data[field] !== undefined) updateData[field] = normalizeLocalized(data[field]); });
    if (data.status === 'published' && existing.status !== 'published') updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : new Date();
    if (data.status === 'draft') updateData.publishedAt = null;
    delete updateData.authorId;
    const article = await prisma.article.update({ where: { id: req.params.id }, data: updateData, include: articleInclude });
    return sendSuccess(res, 'Article updated', { article: serializeArticle(article) });
  } catch (error) { next(error); }
};

const updateArticleStatus = (req, res, next) => updateArticle({ ...req, body: { status: req.body?.status } }, res, next);

const deleteArticle = async (req, res, next) => {
  try {
    if (!await prisma.article.findUnique({ where: { id: req.params.id } })) return sendError(res, 'Article not found', [], 404);
    await prisma.article.delete({ where: { id: req.params.id } });
    return sendSuccess(res, 'Article deleted');
  } catch (error) { next(error); }
};

const sitemap = async (req, res, next) => {
  try {
    const articles = await prisma.article.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } });
    const languages = ['ar', 'en', 'zh', 'ru'];
    const staticPaths = ['', 'about', 'services', 'products', 'countries', 'testimonials', 'contact', 'articles'];
    const urls = languages.flatMap((language) => [
      ...staticPaths.map((path) => `${publicSiteUrl}/${language}${path ? `/${path}` : ''}`),
      ...articles.map((article) => `${publicSiteUrl}/${language}/articles/${article.slug}`),
    ]);
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.replace(/&/g, '&amp;')}</loc></url>`).join('')}</urlset>`;
    res.type('application/xml').send(body);
  } catch (error) { next(error); }
};

module.exports = { listArticles, getArticleBySlug, listAdminArticles, getAdminArticle, createArticle, updateArticle, updateArticleStatus, deleteArticle, sitemap };