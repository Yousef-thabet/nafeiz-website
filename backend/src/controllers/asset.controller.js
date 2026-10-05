const { sendSuccess, sendError } = require('../utils/response');
const { saveImage } = require('../services/storage.service');
const { nodeEnv, port, publicSiteUrl } = require('../config/env');

const createAssetUpload = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'Image file is required', [], 400);
    const { entity = 'articles' } = req.body || {};
    const publicUrlBase = nodeEnv === 'production' ? publicSiteUrl : `http://localhost:${port}`;
    const savedImage = await saveImage({ buffer: req.file.buffer, filename: req.file.originalname, mimeType: req.file.mimetype, sizeBytes: req.file.size, entity, publicUrlBase });
    return sendSuccess(res, 'Image uploaded', savedImage, 201);
  } catch (error) {
    if (/Only |Image size|Image dimensions|Invalid image|Image data|corrupted|filename|entity/.test(error.message)) return sendError(res, error.message, [], 400);
    next(error);
  }
};

module.exports = { createAssetUpload };