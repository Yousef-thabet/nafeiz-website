const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2AccountId, r2AccessKeyId, r2SecretAccessKey, r2Bucket, r2PublicUrl } = require('../config/env');

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const ALLOWED_ENTITIES = new Set(['articles', 'products', 'countries', 'testimonials', 'settings']);
const configured = Boolean(r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2Bucket && r2PublicUrl);
const client = configured ? new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
}) : null;

function assertUploadAllowed(mimeType, sizeBytes, width, height, filename, entity) {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Only JPEG, PNG, WebP, and AVIF images are allowed');
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_UPLOAD_BYTES) throw new Error('Image size must be between 1 byte and 5 MB');
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8000 || height > 8000) throw new Error('Image dimensions must be between 1 and 8000 pixels');
  if (!ALLOWED_ENTITIES.has(entity)) throw new Error('Invalid image entity');
  if (typeof filename !== 'string' || filename.length < 1 || filename.length > 255 || filename.includes('/') || filename.includes('\\') || filename.includes('..')) throw new Error('Invalid image filename');
  const expectedExtension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }[mimeType];
  const actualExtension = filename.toLowerCase().split('.').pop();
  if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(actualExtension) || (actualExtension !== expectedExtension && !(mimeType === 'image/jpeg' && actualExtension === 'jpeg'))) throw new Error('Image filename extension does not match its MIME type');
}

async function createUploadUrl({ mimeType, sizeBytes, width, height, filename, entity }) {
  if (!configured) throw new Error('Image storage is not configured');
  assertUploadAllowed(mimeType, sizeBytes, width, height, filename, entity);
  const extension = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const storageKey = `${entity}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const command = new PutObjectCommand({ Bucket: r2Bucket, Key: storageKey, ContentType: mimeType, ContentLength: sizeBytes });
  return { storageKey, publicUrl: `${r2PublicUrl}/${storageKey}`, uploadUrl: await getSignedUrl(client, command, { expiresIn: 600 }) };
}

module.exports = { MAX_UPLOAD_BYTES, ALLOWED_MIME_TYPES, ALLOWED_ENTITIES, assertUploadAllowed, createUploadUrl };