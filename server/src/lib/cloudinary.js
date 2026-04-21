const { v2: cloudinary } = require("cloudinary");

const DEFAULT_UPLOAD_FOLDER = "petmatch/pets";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getUploadFolder() {
  return process.env.CLOUDINARY_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER;
}

function assertCloudinaryConfigured() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    const error = new Error("Cloudinary is not configured");
    error.statusCode = 500;
    throw error;
  }
}

function uploadImageBuffer(file) {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: getUploadFolder(),
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    upload.end(file.buffer);
  });
}

async function deleteImage(publicId, resourceType = "image") {
  assertCloudinaryConfigured();

  if (!publicId) {
    return null;
  }

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || "image",
  });
}

module.exports = {
  deleteImage,
  uploadImageBuffer,
};
