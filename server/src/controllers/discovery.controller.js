const discoveryService = require("../services/discovery.service");

async function list(req, res, next) {
  try {
    const pets = await discoveryService.getDiscoveryPets(
      req.user.userId,
      req.validated.query
    );

    return res.status(200).json({
      success: true,
      data: pets,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
};
