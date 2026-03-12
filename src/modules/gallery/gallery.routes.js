const express = require("express");
const router = express.Router();
const {
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
} = require("./gallery.controller");
const protect = require("../../middlewares/auth.middleware");
const { upload } = require("../../utils/cloudinary");

router
  .route("/")
  .get(getGalleryImages)
  .post(protect, upload.single("image"), createGalleryImage);

router.route("/:id").delete(protect, deleteGalleryImage);

module.exports = router;
