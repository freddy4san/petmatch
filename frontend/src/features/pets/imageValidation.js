const MAX_PET_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PET_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

export function validatePetImageFile(file) {
  if (!file) {
    return '';
  }

  if (!ALLOWED_PET_IMAGE_TYPES.has(file.type)) {
    return 'Pet photo must be a JPEG, PNG, WebP, or GIF file.';
  }

  if (file.size > MAX_PET_IMAGE_SIZE_BYTES) {
    return 'Pet photo must be 5MB or smaller.';
  }

  return '';
}

export function getImageMutationErrorMessage(error) {
  if (error.statusCode === 409) {
    return 'Pet details saved, but the image changed while saving. Choose the photo again and save once more.';
  }

  return `Pet details saved, but the image update failed: ${error.message}`;
}

export function getImageCleanupWarning(result) {
  if (result?.oldImageDeleteStatus === 'failed') {
    return 'Pet change saved, but the previous Cloudinary image could not be cleaned up automatically.';
  }

  if (result?.imageDeleteStatus === 'failed') {
    return 'Pet change saved, but the removed Cloudinary image could not be cleaned up automatically.';
  }

  return '';
}
