const prisma = require('../config/db');
const { sendSuccess, sendError, formatValidationErrors } = require('../utils/response');
const { productSchema, productUpdateSchema } = require('../validators/product.validator');

const listProducts = async (req, res, next) => {
  try {
    const { published, featured } = req.query;
    const where = {};
    if (published !== undefined) where.published = published === 'true';
    if (featured !== undefined) where.featured = featured === 'true';

    const products = await prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return sendSuccess(res, 'Products fetched', { products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    
    if (!product) {
      return sendError(res, 'Product not found', [], 404);
    }

    if (!product.published && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'Product not found', [], 404);
    }
    
    return sendSuccess(res, 'Product fetched', { product });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: 'asc' } } },
    });
    
    if (!product) {
      return sendError(res, 'Product not found', [], 404);
    }

    // Only return published products to public users
    if (!product.published && (!req.user || req.user.role !== 'admin')) {
      return sendError(res, 'Product not found', [], 404);
    }
    
    return sendSuccess(res, 'Product fetched', { product });
  } catch (error) {
    next(error);
  }
};

const getRelatedProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const limit = Math.min(Math.max(Number(req.query.limit) || 3, 1), 6);
    const currentProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, category: true },
    });

    if (!currentProduct) {
      return sendError(res, 'Product not found', [], 404);
    }

    const related = await prisma.product.findMany({
      where: {
        published: true,
        id: { not: currentProduct.id },
        category: currentProduct.category,
      },
      include: { images: { orderBy: { order: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    if (related.length < limit) {
      const fallback = await prisma.product.findMany({
        where: {
          published: true,
          id: { notIn: [currentProduct.id, ...related.map((product) => product.id)] },
        },
        include: { images: { orderBy: { order: 'asc' } } },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        take: limit - related.length,
      });
      related.push(...fallback);
    }

    return sendSuccess(res, 'Related products fetched', { products: related });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid product payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const { slug, images, ...productData } = parsed.data;

    // Check for duplicate slug
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'Product with this slug already exists', { slug: 'A product with this slug already exists.' }, 409);
    }

    // Ensure nameL10n and descriptionL10n are stored as JSON strings
    const nameL10n = typeof productData.nameL10n === 'string' ? productData.nameL10n : JSON.stringify(productData.nameL10n);
    const descriptionL10n = typeof productData.descriptionL10n === 'string' ? productData.descriptionL10n : JSON.stringify(productData.descriptionL10n);
    const shortDescL10n = productData.shortDescL10n ? (typeof productData.shortDescL10n === 'string' ? productData.shortDescL10n : JSON.stringify(productData.shortDescL10n)) : null;

    const product = await prisma.product.create({
      data: {
        slug,
        ...productData,
        nameL10n,
        descriptionL10n,
        shortDescL10n,
        images: images ? {
          createMany: {
            data: images.map((img, idx) => ({ url: img.url, order: img.order ?? idx })),
          },
        } : undefined,
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    return sendSuccess(res, 'Product created', { product }, 201);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = productUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 'Invalid product payload', formatValidationErrors(parsed.error.issues), 400);
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Product not found', [], 404);
    }

    const { images, ...updateData } = parsed.data;

    // Convert language objects to JSON strings if needed
    if (updateData.nameL10n) {
      updateData.nameL10n = typeof updateData.nameL10n === 'string' ? updateData.nameL10n : JSON.stringify(updateData.nameL10n);
    }
    if (updateData.descriptionL10n) {
      updateData.descriptionL10n = typeof updateData.descriptionL10n === 'string' ? updateData.descriptionL10n : JSON.stringify(updateData.descriptionL10n);
    }
    if (updateData.shortDescL10n) {
      updateData.shortDescL10n = typeof updateData.shortDescL10n === 'string' ? updateData.shortDescL10n : JSON.stringify(updateData.shortDescL10n);
    }

    // Check slug uniqueness if changing
    if (updateData.slug && updateData.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug: updateData.slug } });
      if (slugExists) {
        return sendError(res, 'Product with this slug already exists', [], 409);
      }
    }

    // Handle images separately
    const product = await prisma.$transaction(async (transaction) => {
      if (images !== undefined) {
        await transaction.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await transaction.productImage.createMany({
            data: images.map((img, idx) => ({
              productId: id,
              url: img.url,
              order: img.order ?? idx,
            })),
          });
        }
      }

      return transaction.product.update({
        where: { id },
        data: updateData,
        include: { images: { orderBy: { order: 'asc' } } },
      });
    });

    return sendSuccess(res, 'Product updated', { product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return sendError(res, 'Product not found', [], 404);
    }

    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, 'Product deleted');
  } catch (error) {
    next(error);
  }
};

const toggleProductVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return sendError(res, 'Product not found', [], 404);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { published: !product.published },
      include: { images: { orderBy: { order: 'asc' } } },
    });

    return sendSuccess(res, 'Product visibility toggled', { product: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
};
