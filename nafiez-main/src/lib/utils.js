export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getSettingString(settings, key, fallback = '') {
  const value = settings?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function getSettingNumber(settings, key, fallback) {
  const value = Number(settings?.[key]);
  return Number.isFinite(value) && String(settings?.[key] ?? '').trim() !== '' ? value : fallback;
}

export function getLocalizedSetting(settings, key, lang, fallback = '') {
  const localizedValue = settings?.[`${key}L10n`];
  let localized = localizedValue;

  if (typeof localizedValue === 'string') {
    try {
      localized = JSON.parse(localizedValue);
    } catch {
      localized = null;
    }
  }

  if (localized && typeof localized === 'object' && !Array.isArray(localized)) {
    const value = localized[lang] || (lang === 'en' ? localized.en : '');
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return lang === 'en' ? getSettingString(settings, key, fallback) : fallback;
}

export function formatDate(date, locale = 'en') {
  const locales = { ar: 'ar-EG', en: 'en-US', zh: 'zh-CN' };
  return new Intl.DateTimeFormat(locales[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function getLocalizedField(obj, lang) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') {
    try {
      const parsed = JSON.parse(obj);
      return getLocalizedField(parsed, lang);
    } catch {
      return obj;
    }
  }
  if (typeof obj !== 'object' || Array.isArray(obj)) return String(obj);

  const values = [obj[lang], obj.en, obj.ar, obj.zh, obj.ru];
  const text = values.find((value) => typeof value === 'string' && value.trim());
  if (text) return text;

  const scalar = values.find((value) => typeof value === 'number' || typeof value === 'boolean');
  return scalar === undefined ? '' : String(scalar);
}
