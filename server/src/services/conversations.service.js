const { Prisma } = require("@prisma/client");

const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

const MATCH_PET_SELECT = {
  id: true,
  name: true,
  type: true,
  breed: true,
  age: true,
  imageUrl: true,
  ownerId: true,
};

const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderUserId: true,
  body: true,
  createdAt: true,
};

function isUniqueConstraintError(error) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function sanitizePet(pet) {
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

function sanitizeMessage(message) {
  if (!message) {
    return null;
  }

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderUserId: message.senderUserId,
    body: message.body,
    createdAt: message.createdAt,
  };
}

function sanitizeConversation(conversation, userId) {
  const match = conversation.match;
  const pet1IsOwned = match.pet1.ownerId === userId;
  const currentPet = pet1IsOwned ? match.pet1 : match.pet2;
  const otherPet = pet1IsOwned ? match.pet2 : match.pet1;
  const lastMessage = conversation.messages?.[0] || null;

  return {
    id: conversation.id,
    matchId: conversation.matchId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    match: {
      id: match.id,
      petIds: [match.pet1Id, match.pet2Id],
      createdAt: match.createdAt,
      currentPet: sanitizePet(currentPet),
      otherPet: sanitizePet(otherPet),
    },
    lastMessage: sanitizeMessage(lastMessage),
  };
}

async function ensureConversationForMatch(matchId, client = prisma) {
  try {
    return await client.conversation.upsert({
      where: {
        matchId,
      },
      create: {
        matchId,
      },
      update: {},
      select: {
        id: true,
        matchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    return client.conversation.findUnique({
      where: {
        matchId,
      },
      select: {
        id: true,
        matchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

async function findAccessibleMatch(matchId, userId) {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [
        {
          pet1: {
            ownerId: userId,
          },
        },
        {
          pet2: {
            ownerId: userId,
          },
        },
      ],
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

  if (!match) {
    throw createHttpError(404, "Match not found");
  }

  return match;
}

async function getAccessibleConversation(matchId, userId) {
  const match = await findAccessibleMatch(matchId, userId);
  const conversation = await ensureConversationForMatch(match.id);

  return {
    ...conversation,
    match,
  };
}

async function getConversations(userId) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          pet1: {
            ownerId: userId,
          },
        },
        {
          pet2: {
            ownerId: userId,
          },
        },
      ],
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

  const conversations = await Promise.all(
    matches.map(async (match) => {
      const conversation = await ensureConversationForMatch(match.id);
      const lastMessage = await prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: MESSAGE_SELECT,
      });

      return {
        ...conversation,
        match,
        messages: lastMessage ? [lastMessage] : [],
      };
    })
  );

  return conversations
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map((conversation) => sanitizeConversation(conversation, userId));
}

async function getMessages(userId, matchId) {
  const conversation = await getAccessibleConversation(matchId, userId);
  const messages = await prisma.message.findMany({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: MESSAGE_SELECT,
  });

  return messages.map(sanitizeMessage);
}

async function createMessage(userId, matchId, { body }) {
  const conversation = await getAccessibleConversation(matchId, userId);

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderUserId: userId,
        body,
      },
      select: MESSAGE_SELECT,
    });

    await tx.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return createdMessage;
  });

  return sanitizeMessage(message);
}

module.exports = {
  createMessage,
  ensureConversationForMatch,
  getConversations,
  getMessages,
};
