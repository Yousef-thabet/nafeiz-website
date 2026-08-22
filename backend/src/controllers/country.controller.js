const prisma = require('../config/db');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { countrySchema, countryUpdateSchema } = require('../validators/country.validator');

const listCountries = async (req, res, next) => {
  try {
    const { published } = req.query;
    const where = {};
    if (published !== undefined) where.published = published === 'true';

    const countries = await prisma.country.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    return sendSuccess(res, 'Countries fetched', { countries });
  } catch (error) {
    next(error);
  }
};

const getCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const country = await prisma.country.findUnique({ where: { id } });
    
    if (!country) {
      return sendError(res, 'Country not found', [], 404);
    }

    if (!country.published && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'Country not found', [], 404);
    }
    
    return sendSuccess(res, 'Country fetched', { country });
  } catch (error) {
    next(error);
  }
};

const getCountryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const country = await prisma.country.findUnique({ where: { slug } });
    
    if (!country) {
      return sendError(res, 'Country not found', [], 404);
    }

    // Only return published countries to public users
    if (!country.published && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'Country not found', [], 404);
    }
    
    return sendSuccess(res, 'Country fetched', { country });
  } catch (error) {
    next(error);
  }
};

const createCountry = async (req, res, next) => {
  try {
    const parsed = countrySchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid country payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const { code, slug, ...countryData } = parsed.data;

    // Check for duplicate code or slug
    const [codeExists, slugExists] = await Promise.all([
      prisma.country.findUnique({ where: { code } }),
      prisma.country.findUnique({ where: { slug } }),
    ]);

    if (codeExists) {
      return sendError(res, 'Country with this code already exists', [], 409);
    }
    if (slugExists) {
      return sendError(res, 'Country with this slug already exists', [], 409);
    }

    // Ensure language fields are stored as JSON strings
    const nameL10n = typeof countryData.nameL10n === 'string' ? countryData.nameL10n : JSON.stringify(countryData.nameL10n);
    const descriptionL10n = countryData.descriptionL10n ? (typeof countryData.descriptionL10n === 'string' ? countryData.descriptionL10n : JSON.stringify(countryData.descriptionL10n)) : null;
    const detailsL10n = countryData.detailsL10n ? (typeof countryData.detailsL10n === 'string' ? countryData.detailsL10n : JSON.stringify(countryData.detailsL10n)) : null;

    const country = await prisma.country.create({
      data: {
        code,
        slug,
        ...countryData,
        nameL10n,
        descriptionL10n,
        detailsL10n,
      },
    });

    return sendSuccess(res, 'Country created', { country }, 201);
  } catch (error) {
    next(error);
  }
};

const updateCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = countryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid country payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Country not found', [], 404);
    }

    const updateData = parsed.data;

    // Convert language objects to JSON strings if needed
    if (updateData.nameL10n) {
      updateData.nameL10n = typeof updateData.nameL10n === 'string' ? updateData.nameL10n : JSON.stringify(updateData.nameL10n);
    }
    if (updateData.descriptionL10n) {
      updateData.descriptionL10n = typeof updateData.descriptionL10n === 'string' ? updateData.descriptionL10n : JSON.stringify(updateData.descriptionL10n);
    }
    if (updateData.detailsL10n) {
      updateData.detailsL10n = typeof updateData.detailsL10n === 'string' ? updateData.detailsL10n : JSON.stringify(updateData.detailsL10n);
    }

    // Check uniqueness if changing code or slug
    if (updateData.code && updateData.code !== existing.code) {
      const codeExists = await prisma.country.findUnique({ where: { code: updateData.code } });
      if (codeExists) {
        return sendError(res, 'Country with this code already exists', [], 409);
      }
    }
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await prisma.country.findUnique({ where: { slug: updateData.slug } });
      if (slugExists) {
        return sendError(res, 'Country with this slug already exists', [], 409);
      }
    }

    const country = await prisma.country.update({
      where: { id },
      data: updateData,
    });

    return sendSuccess(res, 'Country updated', { country });
  } catch (error) {
    next(error);
  }
};

const deleteCountry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.country.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Country not found', [], 404);
    }

    await prisma.country.delete({ where: { id } });
    return sendSuccess(res, 'Country deleted');
  } catch (error) {
    next(error);
  }
};

const toggleCountryVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const country = await prisma.country.findUnique({ where: { id } });
    if (!country) {
      return sendError(res, 'Country not found', [], 404);
    }

    const updated = await prisma.country.update({
      where: { id },
      data: { published: !country.published },
    });

    return sendSuccess(res, 'Country visibility toggled', { country: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCountries,
  getCountry,
  getCountryBySlug,
  createCountry,
  updateCountry,
  deleteCountry,
  toggleCountryVisibility,
};
