const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const protect = require("../../middlewares/auth.middleware");
const { uploadSingleImage } = require("../../middlewares/upload.middleware");

router
  .route("/")
  .get(productController.getProducts)
  .post(
    protect,
    uploadSingleImage("image"),
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProductById)
  .put(protect, uploadSingleImage("image"), productController.updateProduct)
  .delete(protect, productController.deleteProduct);

module.exports = router;
