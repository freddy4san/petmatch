const { Prisma } = require("@prisma/client");

const prisma = require("../lib/prisma");
const { createHttpError } = require("../lib/helpers");

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
  ownerId: true,
  owner: {
    select: {
      id: true,
      fullName: true,
      bio: true,
      city: true,
    },
  },
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

function sanitizeConversation(conversation, userId, unreadCount = 0) {
  const match = conversation.match;
  const pet1IsOwned = match.pet1.ownerId === userId;
  const currentPet = pet1IsOwned ? match.pet1 : match.pet2;
  const otherPet = pet1IsOwned ? match.pet2 : match.pet1;
  const lastMessage = conversation.messages?.[0] || null;
  const readState = conversation.readStates?.[0] || null;
  const sanitizedLastMessage = sanitizeMessage(lastMessage);

  return {
    id: conversation.id,
    matchId: conversation.matchId,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    latestMessageAt: lastMessage?.createdAt || null,
    lastReadAt: readState?.lastReadAt || null,
    unreadCount,
    hasUnread: unreadCount > 0,
    match: {
      id: match.id,
      petIds: [match.pet1Id, match.pet2Id],
      createdAt: match.createdAt,
      currentPet: sanitizePet(currentPet),
      otherPet: sanitizePet(otherPet),
    },
    lastMessage: sanitizedLastMessage,
    lastMessagePreview: sanitizedLastMessage?.body || null,
  };
}

async function getUnreadCount(conversationId, userId, lastReadAt) {
  return prisma.message.count({
    where: {
      conversationId,
      senderUserId: {
        not: userId,
      },
      ...(lastReadAt
        ? {
            createdAt: {
              gt: lastReadAt,
            },
          }
        : {}),
    },
  });
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

async function findAccessibleConversation(matchId, userId) {
  const match = await findAccessibleMatch(matchId, userId);
  const conversation = await prisma.conversation.findUnique({
    where: {
      matchId: match.id,
    },
    select: {
      id: true,
      matchId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!conversation) {
    return null;
  }

  return {
    ...conversation,
    match,
  };
}

async function findAccessibleConversationById(conversationId, userId) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      match: {
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
    },
    select: {
      id: true,
      matchId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  return conversation;
}

async function getConversations(userId) {
  const conversations = await prisma.conversation.findMany({
    where: {
      match: {
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
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      matchId: true,
      updatedAt: true,
      match: {
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
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: MESSAGE_SELECT,
      },
      readStates: {
        where: {
          userId,
        },
        take: 1,
        select: {
          lastReadAt: true,
          lastReadMessageId: true,
        },
      },
    },
  });

  return Promise.all(
    conversations.map(async (conversation) => {
      const readState = conversation.readStates?.[0] || null;
      const unreadCount = await getUnreadCount(
        conversation.id,
        userId,
        readState?.lastReadAt || null
      );

      return sanitizeConversation(conversation, userId, unreadCount);
    })
  );
}

async function getMessages(userId, matchId) {
  const conversation = await findAccessibleConversation(matchId, userId);

  if (!conversation) {
    return [];
  }

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

async function markConversationRead(userId, conversationId) {
  const conversation = await findAccessibleConversationById(
    conversationId,
    userId
  );

  const latestMessage = await prisma.message.findFirst({
    where: {
      conversationId: conversation.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  const lastReadAt = latestMessage?.createdAt || new Date();
  const lastReadMessageId = latestMessage?.id || null;

  const readState = await prisma.conversationReadState.upsert({
    where: {
      conversationId_userId: {
        conversationId: conversation.id,
        userId,
      },
    },
    create: {
      conversationId: conversation.id,
      userId,
      lastReadAt,
      lastReadMessageId,
    },
    update: {
      lastReadAt,
      lastReadMessageId,
    },
    select: {
      lastReadAt: true,
      lastReadMessageId: true,
    },
  });

  const unreadCount = await getUnreadCount(
    conversation.id,
    userId,
    readState.lastReadAt
  );

  return {
    conversationId: conversation.id,
    matchId: conversation.matchId,
    lastReadAt: readState.lastReadAt,
    lastReadMessageId: readState.lastReadMessageId,
    unreadCount,
    hasUnread: unreadCount > 0,
  };
}

module.exports = {
  createMessage,
  ensureConversationForMatch,
  getConversations,
  getMessages,
  markConversationRead,
};
