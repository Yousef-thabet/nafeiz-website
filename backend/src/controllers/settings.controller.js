const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response');
const { sanitizeSettingsPayload, PUBLIC_SETTINGS_KEYS } = require('../validators/settings.validator');

const settingsCache = { value: null, expiresAt: 0 };
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;

const invalidateSettingsCache = () => {
  settingsCache.value = null;
  settingsCache.expiresAt = 0;
};

const getSettings = async (req, res, next) => {
  try {
    const now = Date.now();
    if (settingsCache.value && now < settingsCache.expiresAt) {
      return sendSuccess(res, 'Settings fetched', { settings: settingsCache.value });
    }

    const settings = await prisma.setting.findMany({
      where: { key: { in: PUBLIC_SETTINGS_KEYS } },
      select: { key: true, value: true },
    });

    const values = settings.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    settingsCache.value = values;
    settingsCache.expiresAt = now + SETTINGS_CACHE_TTL_MS;

    return sendSuccess(res, 'Settings fetched', { settings: values });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let sanitizedPayload;

    try {
      sanitizedPayload = sanitizeSettingsPayload(req.body);
    } catch (error) {
      return sendError(res, 'Invalid settings payload', [error.message], 400);
    }

    if (Object.keys(sanitizedPayload).length === 0) {
      return sendError(res, 'No valid settings provided', [], 400);
    }

    await prisma.$transaction(
      Object.entries(sanitizedPayload).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    invalidateSettingsCache();
    return sendSuccess(res, 'Settings updated', { settings: sanitizedPayload });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateSettings, invalidateSettingsCache };
