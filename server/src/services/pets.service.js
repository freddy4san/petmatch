const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

function sanitizePet(pet) {
  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    imageUrl: pet.imageUrl,
    ownerId: pet.ownerId,
  };
}

async function getUserPets(userId) {
  const pets = await prisma.pet.findMany({
    where: { ownerId: userId },
    orderBy: { name: "asc" },
  });

  return pets.map(sanitizePet);
}

async function createPet(userId, { age, breed, imageUrl, name, type }) {
  const pet = await prisma.pet.create({
    data: {
      age,
      breed: breed.trim(),
      imageUrl: imageUrl?.trim() || null,
      name: name.trim(),
      ownerId: userId,
      type: type.trim(),
    },
  });

  return sanitizePet(pet);
}

async function updatePet(userId, petId, { age, breed, imageUrl, name, type }) {
  const existingPet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!existingPet || existingPet.ownerId !== userId) {
    throw createHttpError(404, "Pet not found");
  }

  const pet = await prisma.pet.update({
    where: { id: petId },
    data: {
      age,
      breed: breed.trim(),
      imageUrl: imageUrl?.trim() || null,
      name: name.trim(),
      type: type.trim(),
    },
  });

  return sanitizePet(pet);
}

async function deletePet(userId, petId) {
  const existingPet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!existingPet || existingPet.ownerId !== userId) {
    throw createHttpError(404, "Pet not found");
  }

  await prisma.pet.delete({
    where: { id: petId },
  });
}

module.exports = {
  createPet,
  deletePet,
  getUserPets,
  updatePet,
};
