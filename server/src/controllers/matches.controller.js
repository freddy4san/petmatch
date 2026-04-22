const matchesService = require("../services/matches.service");

async function list(req, res, next) {
  try {
    const matches = await matchesService.getMatches(req.user.userId);

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
};
