const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

const DISCOVERY_PET_SELECT = {
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

function sanitizeDiscoveryPet(pet) {
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

function buildDiscoveryFilterWhere({ type, breed, minAge, maxAge, size, withPhotos } = {}) {
  const andFilters = [];

  if (type) {
    andFilters.push({
      type: {
        equals: type,
        mode: "insensitive",
      },
    });
  }

  if (breed) {
    andFilters.push({
      breed: {
        contains: breed,
        mode: "insensitive",
      },
    });
  }

  if (minAge !== undefined || maxAge !== undefined) {
    andFilters.push({
      age: {
        ...(minAge !== undefined ? { gte: minAge } : {}),
        ...(maxAge !== undefined ? { lte: maxAge } : {}),
      },
    });
  }

  if (size) {
    andFilters.push({ size });
  }

  if (withPhotos) {
    andFilters.push({
      imageUrl: {
        not: null,
      },
    });
    andFilters.push({
      imageUrl: {
        not: "",
      },
    });
  }

  return andFilters.length > 0 ? { AND: andFilters } : {};
}

async function getDiscoveryPets(userId, { cursor, fromPetId, limit, ...filters }) {
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
      ...buildDiscoveryFilterWhere(filters),
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
  buildDiscoveryFilterWhere,
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
