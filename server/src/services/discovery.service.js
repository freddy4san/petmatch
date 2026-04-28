const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

const DISCOVERY_PET_SELECT = {
  id: true,
  name: true,
  type: true,
  breed: true,
  age: true,
  imageUrl: true,
};

function sanitizeDiscoveryPet(pet) {
  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    imageUrl: pet.imageUrl,
    primaryImage: pet.imageUrl
      ? {
          url: pet.imageUrl,
        }
      : null,
  };
}

async function getDiscoveryPets(userId, { cursor, fromPetId, limit }) {
  const userPetIds = await getDiscoverySourcePetIds(userId, fromPetId);

  if (userPetIds.length === 0) {
    return [];
  }

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: {
        not: userId,
      },
      ...(cursor
        ? {
            id: {
              gt: cursor,
            },
          }
        : {}),
      receivedInteractions: {
        none: {
          fromPetId: {
            in: userPetIds,
          },
        },
      },
      matchesAsPet1: {
        none: {
          pet2Id: {
            in: userPetIds,
          },
        },
      },
      matchesAsPet2: {
        none: {
          pet1Id: {
            in: userPetIds,
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
    take: limit,
    select: DISCOVERY_PET_SELECT,
  });

  return pets.map(sanitizeDiscoveryPet);
}

module.exports = {
  getDiscoveryPets,
};

async function getDiscoverySourcePetIds(userId, fromPetId) {
  if (fromPetId) {
    const pet = await prisma.pet.findFirst({
      where: {
        id: fromPetId,
        ownerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!pet) {
      throw createHttpError(404, "Source pet not found");
    }

    return [pet.id];
  }

  const userPets = await prisma.pet.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  return userPets.map((pet) => pet.id);
}
