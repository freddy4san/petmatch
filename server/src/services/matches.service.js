const prisma = require("../lib/prisma");

const MATCH_PET_SELECT = {
  id: true,
  name: true,
  type: true,
  breed: true,
  age: true,
  bio: true,
  gender: true,
  size: true,
  temperament: true,
  city: true,
  imageUrl: true,
  owner: {
    select: {
      id: true,
      fullName: true,
      bio: true,
      city: true,
    },
  },
};

function sanitizePet(pet) {
  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    bio: pet.bio,
    gender: pet.gender,
    size: pet.size,
    temperament: pet.temperament || [],
    city: pet.city,
    location: pet.city,
    imageUrl: pet.imageUrl,
    primaryImage: pet.imageUrl
      ? {
          url: pet.imageUrl,
        }
      : null,
    owner: pet.owner
      ? {
          id: pet.owner.id,
          fullName: pet.owner.fullName,
          bio: pet.owner.bio,
          city: pet.owner.city,
          location: pet.owner.city,
        }
      : null,
  };
}

function sanitizeMatch(match, ownedPetIds) {
  const pet1IsOwned = ownedPetIds.has(match.pet1Id);
  const currentPet = pet1IsOwned ? match.pet1 : match.pet2;
  const otherPet = pet1IsOwned ? match.pet2 : match.pet1;

  return {
    id: match.id,
    petIds: [match.pet1Id, match.pet2Id],
    createdAt: match.createdAt,
    currentPet: sanitizePet(currentPet),
    otherPet: sanitizePet(otherPet),
  };
}

async function getMatches(userId) {
  const userPets = await prisma.pet.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const userPetIds = userPets.map((pet) => pet.id);

  if (userPetIds.length === 0) {
    return [];
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          pet1Id: {
            in: userPetIds,
          },
        },
        {
          pet2Id: {
            in: userPetIds,
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      pet1Id: true,
      pet2Id: true,
      createdAt: true,
      pet1: {
        select: MATCH_PET_SELECT,
      },
      pet2: {
        select: MATCH_PET_SELECT,
      },
    },
  });
  const ownedPetIds = new Set(userPetIds);

  return matches.map((match) => sanitizeMatch(match, ownedPetIds));
}

module.exports = {
  getMatches,
};
