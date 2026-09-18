const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const { uploadDir, publicSiteUrl } = require('../config/env');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_ENTITIES = new Set(['articles', 'products', 'countries', 'testimonials', 'settings']);

function validateImage({ mimeType, sizeBytes, width, height, filename, entity, buffer }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Only JPEG, PNG, WebP, and AVIF images are allowed');
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_UPLOAD_BYTES) throw new Error('Image size must be between 1 byte and 5 MB');
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8000 || height > 8000) throw new Error('Image dimensions must be between 1 and 8000 pixels');
  if (!ALLOWED_ENTITIES.has(entity)) throw new Error('Invalid image entity');
  if (typeof filename !== 'string' || filename.length < 1 || filename.length > 255 || filename.includes('/') || filename.includes('\\') || filename.includes('..')) throw new Error('Invalid image filename');
  const expectedExtension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[mimeType];
  const actualExtension = filename.toLowerCase().split('.').pop();
  if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(actualExtension) || (actualExtension !== expectedExtension && !(mimeType === 'image/jpeg' && actualExtension === 'jpeg'))) throw new Error('Image filename extension does not match its MIME type');
  if (!buffer) return;
  if (!Buffer.isBuffer(buffer) || buffer.length !== sizeBytes) throw new Error('Invalid image data');
  const signatures = {
    'image/jpeg': buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    'image/png': buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    'image/webp': buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP',
    'image/avif': buffer.subarray(4, 12).toString('ascii').includes('ftyp'),
  };
  if (!signatures[mimeType]) throw new Error('Image data does not match its MIME type');
}

function assertUploadAllowed(mimeType, sizeBytes, width, height, filename, entity) {
  validateImage({ mimeType, sizeBytes, width, height, filename, entity });
}

function generateStorageKey({ mimeType, entity }) {
  const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
  return `${entity}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
}

async function saveImage({ buffer, mimeType, sizeBytes, width, height, filename, entity }) {
  validateImage({ buffer, mimeType, sizeBytes, width, height, filename, entity });
  const storageKey = generateStorageKey({ mimeType, entity });
  const destination = path.join(uploadDir, ...storageKey.split('/'));
  const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
  await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o755 });
  try {
    await fs.writeFile(temporary, buffer, { mode: 0o644, flag: 'wx' });
    await fs.rename(temporary, destination);
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
  return { storageKey, publicUrl: getPublicUrl(storageKey) };
}

async function deleteImage(storageKey) {
  if (typeof storageKey !== 'string' || !storageKey || storageKey.includes('..') || storageKey.includes('\\') || path.isAbsolute(storageKey)) throw new Error('Invalid image storage key');
  await fs.rm(path.join(uploadDir, ...storageKey.split('/')), { force: true });
}

function getPublicUrl(storageKey) {
  return `${publicSiteUrl}/uploads/${storageKey.split('/').map(encodeURIComponent).join('/')}`;
}

module.exports = { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES, ALLOWED_ENTITIES, assertUploadAllowed, validateImage, generateStorageKey, saveImage, deleteImage, getPublicUrl };