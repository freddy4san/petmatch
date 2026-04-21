const multer = require("multer");

const { createHttpError } = require("../lib/helpers");

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(
        createHttpError(400, "Image must be a JPEG, PNG, WebP, or GIF file")
      );
    }

    return callback(null, true);
  },
});

function singlePetImage(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return next(createHttpError(413, "Image must be 5MB or smaller"));
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return next(createHttpError(400, "Only one image can be uploaded"));
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return next(createHttpError(400, "Upload field must be named image"));
    }

    return next(error);
  });
}

function requireUploadedImage(req, res, next) {
  if (!req.file) {
    return next(createHttpError(400, "Image file is required"));
  }

  return next();
}

module.exports = {
  requireUploadedImage,
  singlePetImage,
};
