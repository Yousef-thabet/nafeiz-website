const { z } = require('zod');

// Language object schema for multilingual fields
const languageObjectSchema = z.record(z.string().min(1), z.string().min(1));

const productSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  category: z.string().min(1),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  nameL10n: z.union([z.string(), languageObjectSchema]),
  shortDescL10n: z.union([z.string(), languageObjectSchema]).optional(),
  descriptionL10n: z.union([z.string(), languageObjectSchema]),
  images: z.array(z.object({
    url: z.string().url(),
    order: z.number().int().min(0).optional(),
  })).optional(),
});

const productUpdateSchema = productSchema.partial();

module.exports = { productSchema, productUpdateSchema };
