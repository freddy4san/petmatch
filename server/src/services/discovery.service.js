const prisma = require("../lib/prisma");

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

async function getDiscoveryPets(userId, { limit }) {
  const userPets = await prisma.pet.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((pet) => pet.id);

  if (userPetIds.length === 0) {
    return [];
  }

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: {
        not: userId,
      },
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
