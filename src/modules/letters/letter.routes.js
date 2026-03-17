const express = require("express");
const router = express.Router();
const letterController = require("./letter.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

// Notice: We are using `uploadSingleImage` which is backed by multer memoryStorage.
// We expect the frontend to send the file in a field named 'attachment'.

router
  .route("/")
  .get(protect, letterController.getLetters)
  .post(
    protect,
    uploadSingleImage("attachment"),
    letterController.createLetter,
  );

router
  .route("/:id")
  .get(protect, letterController.getLetterById)
  .put(protect, uploadSingleImage("attachment"), letterController.updateLetter)
  .delete(protect, letterController.deleteLetter);

module.exports = router;
