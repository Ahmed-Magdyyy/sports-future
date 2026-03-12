const express = require("express");
const router = express.Router();
const {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
} = require("./gallery.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router
  .route("/")
  .get(getGalleryImages)
  .post(protect, uploadSingleImage("image"), createGalleryImage);

router.route("/:id").delete(protect, deleteGalleryImage);

module.exports = router;
