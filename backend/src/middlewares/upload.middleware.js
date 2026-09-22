const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 3, parts: 5 },
});

const uploadImageFile = upload.single('file');

module.exports = { uploadImageFile };
