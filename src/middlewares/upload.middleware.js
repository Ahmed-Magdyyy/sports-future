const multer = require("multer");

const storage = multer.memoryStorage();

const uploadSingleImage = (fieldName) =>
  multer({ storage }).single(fieldName);

const uploadMultipleImages = (fieldName, maxCount = 10) =>
  multer({ storage }).array(fieldName, maxCount);

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
};
