const { Prisma } = require("@prisma/client");

const conversationsService = require("./conversations.service");
const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

const INTERACTION_SELECT = {
  id: true,
  fromPetId: true,
  toPetId: true,
  type: true,
  createdAt: true,
};

const MATCH_SELECT = {
  id: true,
  pet1Id: true,
  pet2Id: true,
  createdAt: true,
};

function isUniqueConstraintError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isInteractionUniqueConstraintError(error) {
  return (
    isUniqueConstraintError(error) &&
    error.meta?.target?.includes("fromPetId") &&
    error.meta?.target?.includes("toPetId")
  );
}

function sanitizeInteraction(interaction) {
  return {
    id: interaction.id,
    fromPetId: interaction.fromPetId,
    toPetId: interaction.toPetId,
    type: interaction.type,
    createdAt: interaction.createdAt,
  };
}

function sanitizeMatch(match) {
  if (!match) {
    return null;
  }

  return {
    id: match.id,
    petIds: [match.pet1Id, match.pet2Id],
    createdAt: match.createdAt,
  };
}

function getMatchPetIds(fromPetId, toPetId) {
  return [fromPetId, toPetId].sort();
}

async function validatePetsForInteraction(userId, fromPetId, toPetId) {
  if (fromPetId === toPetId) {
    throw createHttpError(400, "A pet cannot interact with itself");
  }

  const pets = await prisma.pet.findMany({
    where: {
      id: {
        in: [fromPetId, toPetId],
      },
    },
    select: {
      id: true,
      ownerId: true,
    },
  });
  const fromPet = pets.find((pet) => pet.id === fromPetId);
  const toPet = pets.find((pet) => pet.id === toPetId);

  if (!fromPet || fromPet.ownerId !== userId) {
    throw createHttpError(404, "Source pet not found");
  }

  if (!toPet) {
    throw createHttpError(404, "Target pet not found");
  }

  if (toPet.ownerId === userId) {
    throw createHttpError(400, "Cannot interact with your own pet");
  }
}

async function ensureReciprocalMatch(fromPetId, toPetId) {
  const reciprocalLike = await prisma.interaction.findUnique({
    where: {
      fromPetId_toPetId: {
        fromPetId: toPetId,
        toPetId: fromPetId,
      },
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (reciprocalLike?.type !== "LIKE") {
    return null;
  }

  const [pet1Id, pet2Id] = getMatchPetIds(fromPetId, toPetId);

  try {
    return await prisma.$transaction(async (tx) => {
      const match = await tx.match.upsert({
        where: {
          pet1Id_pet2Id: {
            pet1Id,
            pet2Id,
          },
        },
        create: {
          pet1Id,
          pet2Id,
        },
        update: {},
        select: MATCH_SELECT,
      });

      await conversationsService.ensureConversationForMatch(match.id, tx);

      return match;
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: {
          pet1Id_pet2Id: {
            pet1Id,
            pet2Id,
          },
        },
        select: MATCH_SELECT,
      });

      if (match) {
        await conversationsService.ensureConversationForMatch(match.id, tx);
      }

      return match;
    });
  }
}

async function createInteraction(userId, { fromPetId, toPetId, type }) {
  await validatePetsForInteraction(userId, fromPetId, toPetId);

  try {
    const interaction = await prisma.interaction.create({
      data: {
        fromPetId,
        toPetId,
        type,
      },
      select: INTERACTION_SELECT,
    });
    const match =
      type === "LIKE" ? await ensureReciprocalMatch(fromPetId, toPetId) : null;

    return {
      interaction: sanitizeInteraction(interaction),
      match: sanitizeMatch(match),
    };
  } catch (error) {
    if (isInteractionUniqueConstraintError(error)) {
      return getExistingInteractionResult(fromPetId, toPetId, type);
    }

    throw error;
  }
}

async function getExistingInteractionResult(fromPetId, toPetId, type) {
  const interaction = await prisma.interaction.findUnique({
    where: {
      fromPetId_toPetId: {
        fromPetId,
        toPetId,
      },
    },
    select: INTERACTION_SELECT,
  });

  if (!interaction) {
    throw createHttpError(409, "Interaction already exists");
  }

  if (interaction.type !== type) {
    throw createHttpError(409, "Interaction already exists");
  }

  const match =
    type === "LIKE" ? await ensureReciprocalMatch(fromPetId, toPetId) : null;

  return {
    interaction: sanitizeInteraction(interaction),
    match: sanitizeMatch(match),
  };
}

module.exports = {
  createInteraction,
};
