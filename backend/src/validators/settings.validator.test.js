const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeSettingsPayload, validateSafeUrl } = require('./settings.validator');

test('rejects dangerous URL schemes in settings', () => {
  assert.throws(() => validateSafeUrl('javascript:alert(1)'), /Invalid URL/);
  assert.throws(() => validateSafeUrl('data:text/html;base64,abc'), /Invalid URL/);
  assert.throws(() => validateSafeUrl('vbscript:msgbox(1)'), /Invalid URL/);
});

test('sanitizes settings to only public keys', () => {
  const sanitized = sanitizeSettingsPayload({
    phone: '+966500000000',
    whatsapp: 'https://wa.me/966500000000',
    email: 'hello@example.com',
    logoUrl: 'https://example.com/logo.png',
    password: 'secret',
    heroTitle: 'Welcome',
  });

  assert.deepEqual(Object.keys(sanitized).sort(), ['email', 'heroTitle', 'logoUrl', 'phone', 'whatsapp'].sort());
  assert.equal(sanitized.heroTitle, 'Welcome');
});

test('accepts localized section settings and statistics', () => {
  const sanitized = sanitizeSettingsPayload({
    heroTitleL10n: JSON.stringify({ ar: 'عنوان عربي', en: 'English title' }),
    contactDescriptionL10n: JSON.stringify({ ru: 'Описание' }),
    statisticsYears: '9',
  });

  assert.equal(sanitized.heroTitleL10n, JSON.stringify({ ar: 'عنوان عربي', en: 'English title' }));
  assert.equal(sanitized.contactDescriptionL10n, JSON.stringify({ ru: 'Описание' }));
  assert.equal(sanitized.statisticsYears, '9');
});

test('accepts contact QR settings and validates image URLs', () => {
  const sanitized = sanitizeSettingsPayload({
    whatsappQrEnabled: 'false',
    whatsappQrImageUrl: 'https://example.com/whatsapp-qr.png',
    whatsappQrLabel: 'WhatsApp',
    whatsappQrDescription: 'Scan to message our team.',
    wechatQrEnabled: 'true',
    wechatQrImageUrl: '',
  });

  assert.equal(sanitized.whatsappQrEnabled, 'false');
  assert.equal(sanitized.whatsappQrImageUrl, 'https://example.com/whatsapp-qr.png');
  assert.equal(sanitized.whatsappQrLabel, 'WhatsApp');
  assert.equal(sanitized.wechatQrEnabled, 'true');
  assert.throws(() => sanitizeSettingsPayload({ whatsappQrImageUrl: 'javascript:alert(1)' }), /Invalid URL/);
});

test('accepts a separate header country and multiline contact address', () => {
  const address = 'Building 8, Room 402\nNanshan District\nShenzhen, China';
  const sanitized = sanitizeSettingsPayload({ headerCountry: 'China', address });

  assert.equal(sanitized.headerCountry, 'China');
  assert.equal(sanitized.address, address);
});
