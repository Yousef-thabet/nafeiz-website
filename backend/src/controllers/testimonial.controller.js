const prisma = require('../config/db');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { testimonialSchema } = require('../validators/testimonial.validator');

const parseLocalizedValue = (value) => {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return value;
};

const getLocalizedText = (value, preferredLanguages = ['en', 'ar', 'zh', 'ru']) => {
  const localized = parseLocalizedValue(value);

  if (!localized || typeof localized !== 'object') {
    return '';
  }

  const orderedKeys = preferredLanguages.filter((key) => typeof localized[key] === 'string');
  for (const key of orderedKeys) {
    const text = localized[key].trim();
    if (text) return text;
  }

  const fallback = Object.values(localized).find((item) => typeof item === 'string' && item.trim());
  return fallback ? fallback.trim() : '';
};

const normalizeLegacyTestimonialData = (payload = {}) => {
  const { nameL10n, positionL10n, reviewL10n, name, jobTitle, comment, ...rest } = payload;

  const normalized = {
    ...rest,
    name: typeof name === 'string' && name.trim() ? name.trim() : getLocalizedText(nameL10n),
    jobTitle: typeof jobTitle === 'string' && jobTitle.trim() ? jobTitle.trim() : getLocalizedText(positionL10n),
    comment: typeof comment === 'string' && comment.trim() ? comment.trim() : getLocalizedText(reviewL10n),
  };

  return normalized;
};

const listTestimonials = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: 'desc' },
    });
    
    return sendSuccess(res, 'Testimonials fetched', { testimonials });
  } catch (error) {
    next(error);
  }
};

const getAllTestimonials = async (req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return sendSuccess(res, 'Testimonials fetched', { testimonials });
  } catch (error) {
    next(error);
  }
};

const getTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    
    if (!testimonial) {
      return sendError(res, 'Testimonial not found', [], 404);
    }
    
    return sendSuccess(res, 'Testimonial fetched', { testimonial });
  } catch (error) {
    next(error);
  }
};

const createTestimonial = async (req, res, next) => {
  try {
    const parsed = testimonialSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid testimonial payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const { nameL10n, positionL10n, reviewL10n, ...testimonialData } = parsed.data;
    const normalizedData = normalizeLegacyTestimonialData({
      ...testimonialData,
      nameL10n,
      positionL10n,
      reviewL10n,
    });

    if (!normalizedData.name || !normalizedData.jobTitle || !normalizedData.comment) {
      return sendError(res, 'Testimonial name, role, and comment are required', [], 400);
    }

    // Ensure language fields are stored as JSON strings
    const nameL10nStr = typeof nameL10n === 'string' ? nameL10n : JSON.stringify(nameL10n || {});
    const positionL10nStr = typeof positionL10n === 'string' ? positionL10n : JSON.stringify(positionL10n || {});
    const reviewL10nStr = typeof reviewL10n === 'string' ? reviewL10n : JSON.stringify(reviewL10n || {});

    const testimonial = await prisma.testimonial.create({
      data: {
        ...normalizedData,
        nameL10n: nameL10nStr,
        positionL10n: positionL10nStr,
        reviewL10n: reviewL10nStr,
      },
    });

    return sendSuccess(res, 'Testimonial created', { testimonial }, 201);
  } catch (error) {
    next(error);
  }
};

const updateTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = testimonialSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid testimonial payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Testimonial not found', [], 404);
    }

    const updateData = normalizeLegacyTestimonialData(parsed.data);

    // Convert language objects to JSON strings if needed
    if (parsed.data.nameL10n) {
      updateData.nameL10n = typeof parsed.data.nameL10n === 'string' ? parsed.data.nameL10n : JSON.stringify(parsed.data.nameL10n);
    }
    if (parsed.data.positionL10n) {
      updateData.positionL10n = typeof parsed.data.positionL10n === 'string' ? parsed.data.positionL10n : JSON.stringify(parsed.data.positionL10n);
    }
    if (parsed.data.reviewL10n) {
      updateData.reviewL10n = typeof parsed.data.reviewL10n === 'string' ? parsed.data.reviewL10n : JSON.stringify(parsed.data.reviewL10n);
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Testimonial updated', { testimonial });
  } catch (error) {
    next(error);
  }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Testimonial not found', [], 404);
    }

    await prisma.testimonial.delete({ where: { id } });
    return sendSuccess(res, 'Testimonial deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { listTestimonials, getAllTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial };
