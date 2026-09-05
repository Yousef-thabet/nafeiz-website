const { z } = require('zod');

const localizedSchema = z.object({
  ar: z.string().max(200000).optional().default(''),
  en: z.string().max(200000).optional().default(''),
  zh: z.string().max(200000).optional().default(''),
  ru: z.string().max(200000).optional().default(''),
}).strict();

const localizedJson = localizedSchema.or(z.string().max(800000));

const articleSchema = z.object({
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
  publishedAt: z.union([z.string().datetime(), z.null()]).optional(),
  titleL10n: localizedJson,
  descriptionL10n: localizedJson,
  contentL10n: localizedJson,
  metaTitleL10n: localizedJson,
  metaDescriptionL10n: localizedJson,
  featuredImageUrl: z.union([z.string().url().max(2000), z.literal(''), z.null()]).optional(),
  featuredImageAltL10n: localizedJson,
}).strict();

const articleUpdateSchema = articleSchema.partial();

module.exports = { articleSchema, articleUpdateSchema };