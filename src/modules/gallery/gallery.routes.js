const express = require("express");
const router = express.Router();
const {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
  toggleShowInHome,
} = require("./gallery.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router
  .route("/")
  .get(getGalleryImages)
  .post(protect, uploadSingleImage("image"), createGalleryImage);

router.route("/:id").delete(protect, deleteGalleryImage);
router.route("/:id/toggle-home").put(protect, toggleShowInHome);

module.exports = router;
