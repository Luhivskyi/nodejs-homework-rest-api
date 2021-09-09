/* eslint-disable semi */
const multer = require('multer');
const { HttpCode } = require('./constants');

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    cb(null, 'tmp');
  },
  filename: function (_req, file, cb) {
    cb(null, `${Date.now().toString()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.includes('image')) {
      cb(null, true);
      return;
    }
    const error = new Error('Wrong format file for avatar');
    error.status = HttpCode.BAD_REQUEST;
    cb(error);
  },
});

module.exports = upload;
