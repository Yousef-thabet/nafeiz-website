const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');
const { uploadDir, publicSiteUrl } = require('../config/env');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_ENTITIES = new Set(['articles', 'products', 'countries', 'testimonials', 'settings']);
const FORMAT_BY_MIME = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
const EXTENSION_BY_FORMAT = { jpeg: 'jpg', png: 'png', webp: 'webp', avif: 'avif' };

function validateImageInput({ mimeType, sizeBytes, filename, entity, buffer }) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Only JPEG, PNG, WebP, and AVIF images are allowed');
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_UPLOAD_BYTES) throw new Error('Image size must be between 1 byte and 5 MB');
  if (!ALLOWED_ENTITIES.has(entity)) throw new Error('Invalid image entity');
  if (typeof filename !== 'string' || filename.length < 1 || filename.length > 255 || filename.includes('/') || filename.includes('\\') || filename.includes('..')) throw new Error('Invalid image filename');
  if (buffer !== undefined && (!Buffer.isBuffer(buffer) || buffer.length !== sizeBytes)) throw new Error('Invalid image data');
}

async function validateImage({ buffer, mimeType, sizeBytes, filename, entity }) {
  validateImageInput({ buffer, mimeType, sizeBytes, filename, entity });
  let metadata;
  try {
    metadata = await sharp(buffer, { failOn: 'error' }).metadata();
  } catch {
    throw new Error('Invalid or corrupted image data');
  }
  const isAvif = mimeType === 'image/avif' && metadata.format === 'heif' && buffer.subarray(0, 128).includes(Buffer.from('avif'));
  const formatMatches = metadata.format === FORMAT_BY_MIME[mimeType] || isAvif;
  if (!formatMatches) throw new Error('Image data does not match its MIME type');
  if (!Number.isInteger(metadata.width) || !Number.isInteger(metadata.height) || metadata.width < 1 || metadata.height < 1 || metadata.width > 8000 || metadata.height > 8000) throw new Error('Image dimensions must be between 1 and 8000 pixels');
  return metadata;
}

function assertUploadAllowed(mimeType, sizeBytes, width, height, filename, entity) {
  validateImageInput({ mimeType, sizeBytes, filename, entity });
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8000 || height > 8000) throw new Error('Image dimensions must be between 1 and 8000 pixels');
}

function generateStorageKey({ mimeType, entity }) {
  const extension = EXTENSION_BY_FORMAT[FORMAT_BY_MIME[mimeType]];
  return `${entity}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
}

async function saveImage({ buffer, mimeType, sizeBytes, filename, entity, publicUrlBase = publicSiteUrl }) {
  await validateImage({ buffer, mimeType, sizeBytes, filename, entity });
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
  return { storageKey, publicUrl: getPublicUrl(storageKey, publicUrlBase) };
}

async function deleteImage(storageKey) {
  if (typeof storageKey !== 'string' || !storageKey || storageKey.includes('..') || storageKey.includes('\\') || path.isAbsolute(storageKey)) throw new Error('Invalid image storage key');
  await fs.rm(path.join(uploadDir, ...storageKey.split('/')), { force: true });
}

function getPublicUrl(storageKey, baseUrl = publicSiteUrl) {
  return `${baseUrl}/uploads/${storageKey.split('/').map(encodeURIComponent).join('/')}`;
}

module.exports = { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES, ALLOWED_ENTITIES, assertUploadAllowed, validateImage, generateStorageKey, saveImage, deleteImage, getPublicUrl };