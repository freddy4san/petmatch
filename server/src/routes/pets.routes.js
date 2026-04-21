const express = require("express");
const petsController = require("../controllers/pets.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const {
  requireUploadedImage,
  singlePetImage,
} = require("../middleware/upload.middleware");
const validate = require("../middleware/validate.middleware");
const {
  createPetSchema,
  deletePetSchema,
  petImageParamsSchema,
  updatePetSchema,
} = require("../types/pets.schema");

const router = express.Router();

router.use(requireAuth);
router.get("/", petsController.list);
router.post("/", validate(createPetSchema), petsController.create);
router.post(
  "/:petId/image",
  validate(petImageParamsSchema),
  singlePetImage,
  requireUploadedImage,
  petsController.uploadImage
);
router.delete(
  "/:petId/image",
  validate(petImageParamsSchema),
  petsController.removeImage
);
router.patch("/:petId", validate(updatePetSchema), petsController.update);
router.delete("/:petId", validate(deletePetSchema), petsController.remove);

module.exports = router;
