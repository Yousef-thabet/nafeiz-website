const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const testUploadDir = path.join(os.tmpdir(), `nafeiz-upload-${process.pid}-${Date.now()}`);
process.env.UPLOAD_DIR = testUploadDir;
process.env.PUBLIC_SITE_URL = 'https://nafeiz.com';

const { MAX_UPLOAD_BYTES, saveImage, deleteImage } = require('./storage.service');

async function makeImage(format, width = 2, height = 2) {
  return sharp({
    create: { width, height, channels: 4, background: { r: 20, g: 80, b: 140, alpha: 1 } },
  }).toFormat(format).toBuffer();
}

test.after(async () => {
  await fs.rm(testUploadDir, { recursive: true, force: true });
});

test('accepts supported image formats and stores them under the entity directory', async () => {
  for (const [format, mimeType, extension] of [['jpeg', 'image/jpeg', 'jpg'], ['png', 'image/png', 'png'], ['webp', 'image/webp', 'webp'], ['avif', 'image/avif', 'avif']]) {
    const buffer = await makeImage(format);
    const result = await saveImage({ buffer, mimeType, sizeBytes: buffer.length, filename: `image.${extension}`, entity: 'products' });
    assert.match(result.storageKey, new RegExp(`^products/\\d{4}-\\d{2}-\\d{2}/[0-9a-f-]+\\.${extension}$`));
    assert.equal(result.publicUrl, `https://nafeiz.com/uploads/${result.storageKey}`);
    assert.equal((await fs.stat(path.join(testUploadDir, ...result.storageKey.split('/')))).isFile(), true);
    await deleteImage(result.storageKey);
  }
});

test('rejects a file with a spoofed image MIME type', async () => {
  await assert.rejects(
    saveImage({ buffer: Buffer.from('not an image'), mimeType: 'image/png', sizeBytes: 12, filename: 'image.png', entity: 'products' }),
    /Invalid or corrupted image data/
  );
});

test('rejects files over 5 MB before image decoding', async () => {
  await assert.rejects(
    saveImage({ buffer: Buffer.alloc(MAX_UPLOAD_BYTES + 1), mimeType: 'image/png', sizeBytes: MAX_UPLOAD_BYTES + 1, filename: 'large.png', entity: 'products' }),
    /Image size must be between 1 byte and 5 MB/
  );
});

test('rejects images larger than 8000 pixels', async () => {
  const buffer = await makeImage('png', 8001, 1);
  await assert.rejects(
    saveImage({ buffer, mimeType: 'image/png', sizeBytes: buffer.length, filename: 'wide.png', entity: 'products' }),
    /Image dimensions must be between 1 and 8000 pixels/
  );
});

test('rejects unsafe filenames and entities', async () => {
  const buffer = await makeImage('png');
  await assert.rejects(saveImage({ buffer, mimeType: 'image/png', sizeBytes: buffer.length, filename: '../image.png', entity: 'products' }), /Invalid image filename/);
  await assert.rejects(saveImage({ buffer, mimeType: 'image/png', sizeBytes: buffer.length, filename: 'image.png', entity: '../outside' }), /Invalid image entity/);
});
