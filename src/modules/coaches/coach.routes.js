const express = require("express");
const router = express.Router();
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");
const {
  getCoaches,
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  reorderCoaches,
} = require("./coach.controller");

router
  .route("/")
  .get(getCoaches)
  .post(protect, uploadSingleImage("image"), createCoach);

router.post("/reorder", protect, reorderCoaches);

router
  .route("/:id")
  .get(getCoachById)
  .put(protect, uploadSingleImage("image"), updateCoach)
  .delete(protect, deleteCoach);

module.exports = router;
