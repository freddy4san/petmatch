const prisma = require("../lib/prisma");
const {
  deleteImage,
  uploadImageBuffer,
} = require("../lib/cloudinary");
const { createHttpError } = require("../lib/helpers");

function sanitizePet(pet) {
  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    imageUrl: pet.imageUrl,
    image: pet.imageUrl
      ? {
          url: pet.imageUrl,
          publicId: pet.imagePublicId,
          assetId: pet.imageAssetId,
          version: pet.imageVersion,
          format: pet.imageFormat,
          resourceType: pet.imageResourceType,
          bytes: pet.imageBytes,
          width: pet.imageWidth,
          height: pet.imageHeight,
          originalFilename: pet.imageOriginalFilename,
          uploadedAt: pet.imageUploadedAt,
        }
      : null,
    ownerId: pet.ownerId,
  };
}

function getEmptyImageData() {
  return {
    imageUrl: null,
    imagePublicId: null,
    imageAssetId: null,
    imageVersion: null,
    imageFormat: null,
    imageResourceType: null,
    imageBytes: null,
    imageWidth: null,
    imageHeight: null,
    imageOriginalFilename: null,
    imageUploadedAt: null,
  };
}

function getImageDataFromUpload(uploadResult) {
  return {
    imageUrl: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
    imageAssetId: uploadResult.asset_id,
    imageVersion: uploadResult.version,
    imageFormat: uploadResult.format,
    imageResourceType: uploadResult.resource_type,
    imageBytes: uploadResult.bytes,
    imageWidth: uploadResult.width,
    imageHeight: uploadResult.height,
    imageOriginalFilename: uploadResult.original_filename,
    imageUploadedAt: new Date(),
  };
}

function getCloudinaryError(message) {
  return createHttpError(502, message);
}

async function findOwnedPet(userId, petId) {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!pet || pet.ownerId !== userId) {
    throw createHttpError(404, "Pet not found");
  }

  return pet;
}

async function tryDeleteStoredImage(publicId, resourceType) {
  if (!publicId) {
    return "not_applicable";
  }

  try {
    const result = await deleteImage(publicId, resourceType);

    if (result?.result && !["ok", "not found"].includes(result.result)) {
      return "failed";
    }

    return result?.result || "ok";
  } catch {
    return "failed";
  }
}

async function getUserPets(userId) {
  const pets = await prisma.pet.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });

  return pets.map(sanitizePet);
}

async function createPet(userId, { age, breed, name, type }) {
  const pet = await prisma.pet.create({
    data: {
      age,
      breed: breed.trim(),
      name: name.trim(),
      ownerId: userId,
      type: type.trim(),
    },
  });

  return sanitizePet(pet);
}

async function updatePet(userId, petId, { age, breed, name, type }) {
  await findOwnedPet(userId, petId);

  const pet = await prisma.pet.update({
    where: { id: petId },
    data: {
      age,
      breed: breed.trim(),
      name: name.trim(),
      type: type.trim(),
    },
  });

  return sanitizePet(pet);
}

async function uploadPetImage(userId, petId, file) {
  const existingPet = await findOwnedPet(userId, petId);
  let uploadResult;

  try {
    uploadResult = await uploadImageBuffer(file);
  } catch {
    throw getCloudinaryError("Image upload failed");
  }

  try {
    const updateResult = await prisma.pet.updateMany({
      where: {
        id: petId,
        ownerId: userId,
        imagePublicId: existingPet.imagePublicId,
      },
      data: getImageDataFromUpload(uploadResult),
    });

    if (updateResult.count !== 1) {
      await tryDeleteStoredImage(
        uploadResult.public_id,
        uploadResult.resource_type
      );
      uploadResult = null;
      throw createHttpError(409, "Pet image changed; please retry upload");
    }

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });
    const oldImageDeleteStatus = await tryDeleteStoredImage(
      existingPet.imagePublicId,
      existingPet.imageResourceType
    );
    const sanitizedPet = sanitizePet(pet);

    if (oldImageDeleteStatus === "failed") {
      return {
        ...sanitizedPet,
        oldImageDeleteStatus,
      };
    }

    return sanitizedPet;
  } catch (error) {
    if (uploadResult) {
      await tryDeleteStoredImage(
        uploadResult.public_id,
        uploadResult.resource_type
      );
    }

    if (error.statusCode) {
      throw error;
    }

    throw error;
  }
}

async function deletePetImage(userId, petId) {
  const existingPet = await findOwnedPet(userId, petId);
  const updateResult = await prisma.pet.updateMany({
    where: {
      id: petId,
      ownerId: userId,
      imagePublicId: existingPet.imagePublicId,
    },
    data: getEmptyImageData(),
  });

  if (updateResult.count !== 1) {
    throw createHttpError(409, "Pet image changed; please retry delete");
  }

  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });
  const imageDeleteStatus = await tryDeleteStoredImage(
    existingPet.imagePublicId,
    existingPet.imageResourceType
  );
  const sanitizedPet = sanitizePet(pet);

  if (imageDeleteStatus === "failed") {
    return {
      ...sanitizedPet,
      imageDeleteStatus,
    };
  }

  return sanitizedPet;
}

async function deletePet(userId, petId) {
  const existingPet = await findOwnedPet(userId, petId);

  await prisma.pet.delete({
    where: { id: petId },
  });

  const imageDeleteStatus = await tryDeleteStoredImage(
    existingPet.imagePublicId,
    existingPet.imageResourceType
  );

  return {
    imageDeleteStatus,
  };
}

module.exports = {
  createPet,
  deletePet,
  deletePetImage,
  getUserPets,
  updatePet,
  uploadPetImage,
};
