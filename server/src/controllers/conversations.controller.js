const conversationsService = require("../services/conversations.service");
const { emitMessageCreated } = require("../lib/realtime");

async function list(req, res, next) {
  try {
    const conversations = await conversationsService.getConversations(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    return next(error);
  }
}

async function listMessages(req, res, next) {
  try {
    const messagePage = await conversationsService.getMessages(
      req.user.userId,
      req.params.matchId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data:
        req.query.limit || req.query.before
          ? messagePage
          : messagePage.messages,
    });
  } catch (error) {
    return next(error);
  }
}

async function createMessage(req, res, next) {
  try {
    const message = await conversationsService.createMessage(
      req.user.userId,
      req.params.matchId,
      req.body
    );

    emitMessageCreated({
      matchId: req.params.matchId,
      message,
    });

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const readState = await conversationsService.markConversationRead(
      req.user.userId,
      req.params.conversationId
    );

    return res.status(200).json({
      success: true,
      data: readState,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createMessage,
  list,
  listMessages,
  markRead,
};
