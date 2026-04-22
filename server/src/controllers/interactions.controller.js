const interactionsService = require("../services/interactions.service");

async function create(req, res, next) {
  try {
    const interactionResult = await interactionsService.createInteraction(
      req.user.userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: interactionResult,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
};
