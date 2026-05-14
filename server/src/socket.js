const { Server } = require("socket.io");

const { verifyToken } = require("./lib/jwt");
const { setMessageBroadcaster } = require("./lib/realtime");
const conversationsService = require("./services/conversations.service");

const MAX_MESSAGE_BODY_LENGTH = 2000;
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://petmatch-three.vercel.app",
  ...(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

function setupChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
    },
  });

  io.use((socket, next) => {
    const token = getSocketToken(socket);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      socket.user = verifyToken(token);
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(conversationsService.getUserRoomName(socket.user.userId));

    socket.on("conversation:join", async (payload = {}, acknowledge) => {
      try {
        const room = await conversationsService.getConversationRoomForUser(
          String(payload.conversationId || "").trim(),
          socket.user.userId
        );

        socket.join(room.room);
        acknowledge?.({
          success: true,
          data: {
            conversationId: room.conversationId,
            matchId: room.matchId,
          },
        });
      } catch (error) {
        acknowledge?.(getSocketError(error));
      }
    });

    socket.on("conversation:leave", (payload = {}) => {
      const conversationId = String(payload.conversationId || "").trim();

      if (conversationId) {
        socket.leave(conversationsService.getConversationRoomName(conversationId));
      }
    });

    socket.on("message:send", async (payload = {}, acknowledge) => {
      try {
        const matchId = String(payload.matchId || "").trim();
        const body = getValidatedMessageBody(payload.body);
        const message = await conversationsService.createMessage(
          socket.user.userId,
          matchId,
          { body }
        );
        const eventPayload = {
          clientMessageId: payload.clientMessageId || null,
          matchId,
          message,
        };

        broadcastMessageCreated(io, eventPayload);
        acknowledge?.({
          success: true,
          data: message,
        });
      } catch (error) {
        acknowledge?.(getSocketError(error));
      }
    });
  });

  setMessageBroadcaster((payload) => broadcastMessageCreated(io, payload));

  return io;
}

function getValidatedMessageBody(value) {
  if (typeof value !== "string") {
    throw new Error("Message body is required");
  }

  const body = value.trim();

  if (!body) {
    throw new Error("Message body is required");
  }

  if (body.length > MAX_MESSAGE_BODY_LENGTH) {
    throw new Error(
      `Message body must be ${MAX_MESSAGE_BODY_LENGTH} characters or less`
    );
  }

  return body;
}

async function emitMessageCreated(io, payload) {
  if (!payload?.message?.conversationId) {
    return;
  }

  const delivery = await conversationsService.getConversationDelivery(
    payload.message.conversationId
  );
  const eventPayload = {
    conversationId: payload.message.conversationId,
    matchId: payload.matchId || delivery.matchId,
    message: payload.message,
    clientMessageId: payload.clientMessageId || null,
  };

  io.to(conversationsService.getConversationRoomName(payload.message.conversationId)).emit(
    "message:new",
    eventPayload
  );
  delivery.participantUserIds.forEach((userId) => {
    io.to(conversationsService.getUserRoomName(userId)).emit(
      "conversation:updated",
      eventPayload
    );
  });
}

function broadcastMessageCreated(io, payload) {
  emitMessageCreated(io, payload).catch((error) => {
    console.error("Failed to emit realtime message update", error);
  });
}

function getSocketToken(socket) {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return String(authToken).trim();
  }

  const authorizationHeader = socket.handshake.headers?.authorization;

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice("Bearer ".length).trim();
  }

  return "";
}

function getSocketError(error) {
  return {
    success: false,
    error: error.message || "Socket request failed",
  };
}

module.exports = {
  setupChatSocket,
};
