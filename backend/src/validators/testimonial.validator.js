const { z } = require('zod');

const testimonialSchema = z.object({
  nameL10n: z.union([
    z.string(),
    z.record(z.string()),
  ]).optional(),
  positionL10n: z.union([
    z.string(),
    z.record(z.string()),
  ]).optional(),
  reviewL10n: z.union([
    z.string(),
    z.record(z.string()),
  ]).optional(),
  name: z.string().min(2).optional(),
  jobTitle: z.string().min(2).optional(),
  comment: z.string().min(10).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isVisible: z.boolean().optional(),
});

module.exports = { testimonialSchema };
