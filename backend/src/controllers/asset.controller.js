const { sendSuccess, sendError } = require('../utils/response');
const { saveImage } = require('../services/storage.service');

const createAssetUpload = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'Image file is required', [], 400);
    const { width, height, entity = 'articles' } = req.body || {};
    const upload = await saveImage({ buffer: req.file.buffer, filename: req.file.originalname, mimeType: req.file.mimetype, sizeBytes: req.file.size, width: Number(width), height: Number(height), entity });
    return sendSuccess(res, 'Image uploaded', { ...upload, key: upload.storageKey }, 201);
  } catch (error) {
    if (/Only |Image size|Image dimensions|Invalid image|Image data|filename|entity/.test(error.message)) return sendError(res, error.message, [], 400);
    next(error);
  }
};

module.exports = { createAssetUpload };