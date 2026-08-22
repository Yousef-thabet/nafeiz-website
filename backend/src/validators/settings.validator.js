const { z } = require('zod');

const LOCALIZED_SETTING_KEYS = [
  'heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription',
  'visionTitle', 'visionDescription', 'missionTitle', 'missionDescription',
  'servicesTitle', 'servicesDescription', 'productsTitle', 'productsDescription',
  'countriesTitle', 'countriesDescription', 'whyTitle', 'whyDescription',
  'howTitle', 'howDescription', 'testimonialsTitle', 'testimonialsDescription',
  'contactTitle', 'contactDescription', 'footerDescription',
].map((key) => `${key}L10n`);

const PUBLIC_SETTINGS_KEYS = [
  'phone',
  'email',
  'address',
  'facebook',
  'instagram',
  'tiktok',
  'wechat',
  'heroTitle',
  'heroDescription',
  'aboutTitle',
  'aboutDescription',
  'visionTitle',
  'visionDescription',
  'missionTitle',
  'missionDescription',
  'statisticsClients',
  'statisticsShipments',
  'statisticsCountries',
  'statisticsFactories',
  'statisticsYears',
  'servicesTitle',
  'servicesDescription',
  'productsTitle',
  'productsDescription',
  'countriesTitle',
  'countriesDescription',
  'whyTitle',
  'whyDescription',
  'howTitle',
  'howDescription',
  'testimonialsTitle',
  'testimonialsDescription',
  'contactTitle',
  'contactDescription',
  'footerDescription',
  'logoUrl',
  'faviconUrl',
  'heroImageUrl',
  'heroVideoUrl',
  'ctaText',
  'ctaUrl',
  'companyName',
  'workingHours',
  'googleMapsUrl',
  ...LOCALIZED_SETTING_KEYS,
];

const URL_SETTING_KEYS = new Set(['facebook', 'instagram', 'tiktok', 'wechat', 'logoUrl', 'faviconUrl', 'heroImageUrl', 'heroVideoUrl', 'ctaUrl', 'googleMapsUrl']);

const settingsSchema = z.object({
  phone: z.string().trim().max(50).optional().or(z.literal('')),
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
  facebook: z.string().trim().max(255).optional().or(z.literal('')),
  instagram: z.string().trim().max(255).optional().or(z.literal('')),
  tiktok: z.string().trim().max(255).optional().or(z.literal('')),
  wechat: z.string().trim().max(255).optional().or(z.literal('')),
  heroTitle: z.string().trim().max(200).optional().or(z.literal('')),
  heroDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  aboutTitle: z.string().trim().max(200).optional().or(z.literal('')),
  aboutDescription: z.string().trim().max(2000).optional().or(z.literal('')),
  visionTitle: z.string().trim().max(200).optional().or(z.literal('')),
  visionDescription: z.string().trim().max(2000).optional().or(z.literal('')),
  missionTitle: z.string().trim().max(200).optional().or(z.literal('')),
  missionDescription: z.string().trim().max(2000).optional().or(z.literal('')),
  statisticsClients: z.string().trim().max(50).optional().or(z.literal('')),
  statisticsShipments: z.string().trim().max(50).optional().or(z.literal('')),
  statisticsCountries: z.string().trim().max(50).optional().or(z.literal('')),
  statisticsFactories: z.string().trim().max(50).optional().or(z.literal('')),
  statisticsYears: z.string().trim().max(50).optional().or(z.literal('')),
  servicesTitle: z.string().trim().max(200).optional().or(z.literal('')),
  servicesDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  productsTitle: z.string().trim().max(200).optional().or(z.literal('')),
  productsDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  countriesTitle: z.string().trim().max(200).optional().or(z.literal('')),
  countriesDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  whyTitle: z.string().trim().max(200).optional().or(z.literal('')),
  whyDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  howTitle: z.string().trim().max(200).optional().or(z.literal('')),
  howDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  testimonialsTitle: z.string().trim().max(200).optional().or(z.literal('')),
  testimonialsDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  contactTitle: z.string().trim().max(200).optional().or(z.literal('')),
  contactDescription: z.string().trim().max(1000).optional().or(z.literal('')),
  footerDescription: z.string().trim().max(500).optional().or(z.literal('')),
  logoUrl: z.string().trim().max(500).optional().or(z.literal('')),
  faviconUrl: z.string().trim().max(500).optional().or(z.literal('')),
  heroImageUrl: z.string().trim().max(500).optional().or(z.literal('')),
  heroVideoUrl: z.string().trim().max(500).optional().or(z.literal('')),
  ctaText: z.string().trim().max(200).optional().or(z.literal('')),
  ctaUrl: z.string().trim().max(500).optional().or(z.literal('')),
  companyName: z.string().trim().max(200).optional().or(z.literal('')),
  workingHours: z.string().trim().max(200).optional().or(z.literal('')),
  googleMapsUrl: z.string().trim().max(500).optional().or(z.literal('')),
}).extend(
  Object.fromEntries(
    LOCALIZED_SETTING_KEYS.map((key) => [key, z.string().max(20000).optional().or(z.literal(''))])
  )
).passthrough();

const validateSafeUrl = (value) => {
  if (!value || value === '') return '';

  const normalized = String(value).trim();
  const url = new URL(normalized);
  const protocol = url.protocol.toLowerCase();

  if (!['http:', 'https:'].includes(protocol)) {
    throw new Error('Invalid URL');
  }

  return normalized;
};

const sanitizeSettingsPayload = (payload = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  }

  const output = {};

  for (const [key, value] of Object.entries(parsed.data)) {
    if (!PUBLIC_SETTINGS_KEYS.includes(key)) continue;

    if (value === null || value === undefined) continue;

    const stringValue = String(value).trim();
    if (stringValue === '') {
      output[key] = '';
      continue;
    }

    if (URL_SETTING_KEYS.has(key)) {
      output[key] = validateSafeUrl(stringValue);
      continue;
    }

    output[key] = stringValue;
  }

  return output;
};

module.exports = { settingsSchema, sanitizeSettingsPayload, validateSafeUrl, PUBLIC_SETTINGS_KEYS };
