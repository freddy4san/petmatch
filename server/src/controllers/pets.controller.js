const petsService = require("../services/pets.service");

async function list(req, res, next) {
  try {
    const pets = await petsService.getUserPets(req.user.userId);

    return res.status(200).json({
      success: true,
      data: pets,
    });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const pet = await petsService.createPet(req.user.userId, req.body);

    return res.status(201).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const pet = await petsService.updatePet(req.user.userId, req.params.petId, req.body);

    return res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    await petsService.deletePet(req.user.userId, req.params.petId);

    return res.status(200).json({
      success: true,
      data: {
        id: req.params.petId,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
  remove,
  update,
};
