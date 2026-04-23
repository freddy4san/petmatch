const conversationsService = require("../services/conversations.service");

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
    const messages = await conversationsService.getMessages(
      req.user.userId,
      req.params.matchId
    );

    return res.status(200).json({
      success: true,
      data: messages,
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

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createMessage,
  list,
  listMessages,
};
