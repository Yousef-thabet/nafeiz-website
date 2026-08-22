const { z } = require('zod');

const countryCodeSchema = z.string().length(2).optional().or(z.literal(''));
const dialCodeSchema = z.string().regex(/^\+\d{1,4}$/).optional().or(z.literal(''));
const phoneNumberSchema = z.string().trim().min(5).max(30).optional().or(z.literal(''));

const contactSchema = z.object({
  name: z.string().trim().min(2),
  companyName: z.string().trim().max(120).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  countryCode: countryCodeSchema,
  dialCode: dialCodeSchema,
  phoneNumber: phoneNumberSchema,
  visitedChina: z.boolean(),
  interests: z.array(z.enum(['SOURCING', 'QUALITY_INSPECTION', 'LOGISTICS', 'FINDING_SUPPLIERS', 'OTHER'])).min(1),
  estimatedOrderQuantity: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'NOT_SURE']).optional().or(z.literal('')),
  startTimeline: z.enum(['IMMEDIATELY', 'WITHIN_1_MONTH', 'WITHIN_3_MONTHS', 'JUST_EXPLORING']).optional().or(z.literal('')),
  productReadiness: z.enum(['EXACTLY_KNOW', 'NEEDS_HELP', 'STILL_EXPLORING']).optional().or(z.literal('')),
  message: z.string().trim().min(10),
}).superRefine((data, context) => {
  const phone = (data.phoneNumber || data.phone || '').trim();
  if (!phone) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['phoneNumber'], message: 'Phone number is required' });
  }
});

const noteSchema = z.object({ note: z.string().min(1) });
const statusSchema = z.object({ status: z.enum(['new', 'contacted', 'closed']) });
const assignSchema = z.object({ employeeId: z.string().min(1) });

module.exports = { contactSchema, noteSchema, statusSchema, assignSchema };
