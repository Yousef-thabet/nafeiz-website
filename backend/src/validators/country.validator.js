const { z } = require('zod');

// Language object schema for multilingual fields
const languageObjectSchema = z.record(z.string().min(1), z.string().min(1));

const countrySchema = z.object({
  code: z.string().length(2).regex(/^[A-Z]{2}$/, 'Country code must be exactly 2 uppercase letters'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  imageUrl: z.string().url().optional().nullable(),
  published: z.boolean().optional(),
  nameL10n: z.union([z.string(), languageObjectSchema]),
  descriptionL10n: z.union([z.string(), languageObjectSchema]).optional(),
  detailsL10n: z.union([z.string(), languageObjectSchema]).optional(),
});

const countryUpdateSchema = countrySchema.partial();

module.exports = { countrySchema, countryUpdateSchema };
