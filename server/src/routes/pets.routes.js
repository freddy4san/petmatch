const express = require("express");
const petsController = require("../controllers/pets.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createPetSchema,
  deletePetSchema,
  updatePetSchema,
} = require("../types/pets.schema");

const router = express.Router();

router.use(requireAuth);
router.get("/", petsController.list);
router.post("/", validate(createPetSchema), petsController.create);
router.patch("/:petId", validate(updatePetSchema), petsController.update);
router.delete("/:petId", validate(deletePetSchema), petsController.remove);

module.exports = router;
