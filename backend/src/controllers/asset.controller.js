const { sendSuccess, sendError } = require('../utils/response');
const { createUploadUrl } = require('../services/storage.service');

const createAssetUpload = async (req, res, next) => {
  try {
    const { filename, contentType, mimeType, size, sizeBytes, width, height, entity = 'articles' } = req.body || {};
    const upload = await createUploadUrl({ filename, mimeType: contentType || mimeType, sizeBytes: size ?? sizeBytes, width, height, entity });
    return sendSuccess(res, 'Upload URL created', { ...upload, key: upload.storageKey }, 201);
  } catch (error) {
    if (/storage is not configured|Only |Image size|Image dimensions|Invalid image/.test(error.message)) return sendError(res, error.message, [], 400);
    next(error);
  }
};

module.exports = { createAssetUpload };